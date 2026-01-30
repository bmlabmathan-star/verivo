"use server"

import { createClient } from "@/lib/supabase/server"

// Helper function for weights
function getWeight(minutes: number): number {
    if (minutes < 30) return 0.1
    if (minutes < 60) return 0.2 // 10m bucket logic approx
    if (minutes < 180) return 0.5 // 30m-1h logic approx
    if (minutes < 240) return 0.8 // 1h-3h approx
    return 1.0 // 3h+
}

export interface ExpertProfileData {
    id: string
    // Add other profile fields if 'verivo_users' table has them
    stats: {
        total_predictions: number
        correct_predictions: number
        accuracy_rate: number
        verivo_score: number
    } | null
}

export async function getExpertProfile(expertId: string): Promise<ExpertProfileData | null> {
    const supabase = await createClient()

    // Try to fetch from 'user_verivo_scores' view which aggregates stats
    const { data: stats, error } = await supabase
        .from("user_verivo_scores")
        .select("*")
        .eq("user_id", expertId)
        .single()

    if (error) {
        // If user has no stats yet, return basic structure
        if (error.code === 'PGRST116') { // No rows found
            return {
                id: expertId,
                stats: {
                    total_predictions: 0,
                    correct_predictions: 0,
                    accuracy_rate: 0,
                    verivo_score: 0
                }
            }
        }
        console.error("Error fetching expert stats:", error)
        return null
    }

    return {
        id: expertId,
        stats: stats ? {
            total_predictions: stats.total_predictions,
            correct_predictions: stats.correct_predictions,
            accuracy_rate: stats.accuracy_rate,
            verivo_score: stats.verivo_score
        } : null
    }
}

export async function getExpertPerformance(expertId: string) {
    const supabase = await createClient()

    // Fetch all *verified* predictions sorted by date (oldest first for graph)
    const { data: predictions, error } = await supabase
        .from("predictions")
        .select("*, evaluation_time, duration_minutes") // Added evaluation_time and duration_minutes
        .eq("user_id", expertId)
        .not("outcome", "is", null)
        .order("evaluation_time", { ascending: true })

    if (error || !predictions) return {
        byAsset: [],
        byTimeframe: [],
        scoreHistory: [],
        confidenceFactor: 0
    }

    // 1. Asset & Timeframe Maps
    const assetMap = new Map<string, { total: number, correct: number }>()
    const timeframeMap = new Map<string, { total: number, correct: number }>()

    // 2. Score History Calculation
    // We simulate the score over time. Starting at 0.
    let currentScore = 0
    let totalWeight = 0
    let totalCount = 0

    const scoreHistory: { date: string, score: number }[] = []

    // Add initial point
    if (predictions.length > 0) {
        scoreHistory.push({
            date: new Date(new Date(predictions[0].evaluation_time).getTime() - 86400000).toISOString(),
            score: 0
        })
    }

    predictions.forEach(p => {
        // --- Asset Breakdown ---
        const asset = p.globalAsset || p.category || "Other"
        const currentAsset = assetMap.get(asset) || { total: 0, correct: 0 }
        currentAsset.total++
        if (p.outcome === 'Correct') currentAsset.correct++
        assetMap.set(asset, currentAsset)

        // --- Timeframe Breakdown ---
        let durationLabel = "Intraday"
        if (p.duration_minutes > 1440) durationLabel = "Long Term"
        else if (p.duration_minutes > 180) durationLabel = "Swing"
        else if (p.duration_minutes > 60) durationLabel = "Short Term"
        else durationLabel = "Scalp"

        const currentTime = timeframeMap.get(durationLabel) || { total: 0, correct: 0 }
        currentTime.total++
        if (p.outcome === 'Correct') currentTime.correct++
        timeframeMap.set(durationLabel, currentTime)

        // --- Score Simulation ---
        const weight = getWeight(p.duration_minutes || 0)
        totalWeight += weight
        totalCount++

        // Simplified Score Logic for Graph Visualization:
        // +Weight for Correct, -(Weight/2) for Incorrect
        if (p.outcome === 'Correct') {
            currentScore += weight
        } else {
            currentScore -= (weight * 0.5)
        }

        // Push point
        scoreHistory.push({
            date: p.evaluation_time,
            score: Math.max(0, currentScore) // Floor at 0 like main score
        })
    })

    const byAsset = Array.from(assetMap.entries()).map(([name, val]) => ({
        name,
        accuracy: (val.correct / val.total) * 100,
        count: val.total
    })).sort((a, b) => b.count - a.count)

    const byTimeframe = Array.from(timeframeMap.entries()).map(([name, val]) => ({
        name,
        accuracy: (val.correct / val.total) * 100,
        count: val.total
    }))

    // Confidence Factor = Avg Weight
    const confidenceFactor = totalCount > 0 ? (totalWeight / totalCount) : 0

    return { byAsset, byTimeframe, scoreHistory, confidenceFactor, predictions }
}

export async function getBatchContributorIds(userIds: string[]): Promise<Record<string, string>> {
    if (userIds.length === 0) return {}

    const supabase = await createClient()
    const uniqueIds = Array.from(new Set(userIds))

    // Fetch created_at for all requested users
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, created_at")
        .in("id", uniqueIds)

    const idMap: Record<string, string> = {}

    if (!profiles) return idMap

    // For each user, calculate the ID
    // Note: In a high-scale prod scenario, we would materialize this ID in the DB.
    // For now, parallel execution of counts is acceptable.

    await Promise.all(profiles.map(async (profile) => {
        if (!profile.created_at) {
            idMap[profile.id] = `Contributor #${profile.id.slice(0, 4)}`
            return
        }

        const date = new Date(profile.created_at)
        const dd = String(date.getDate()).padStart(2, '0')
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const yy = String(date.getFullYear()).slice(-2)

        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        // Fetch ALL users registered on this day to determine rank deterministically
        // Ordering by created_at (asc) and ID (asc) ensures stable sort even for collisions
        const { data: dayUsers } = await supabase
            .from("profiles")
            .select("id")
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
            .order('created_at', { ascending: true })
            .order('id', { ascending: true }) // Tie-breaker

        let sequence = 1
        if (dayUsers) {
            const index = dayUsers.findIndex(u => u.id === profile.id)
            if (index !== -1) {
                sequence = index + 1
            }
        }

        const sequenceStr = String(sequence).padStart(4, '0')
        idMap[profile.id] = `${dd}${mm}${yy}${sequenceStr}`
    }))

    return idMap
}
