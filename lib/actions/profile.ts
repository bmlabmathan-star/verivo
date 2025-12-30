"use server"

import { createClient } from "@/lib/supabase/server"

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
        // If user has no stats yet, might return error or null
        console.error("Error fetching expert stats:", error)
        if (error.code === 'PGRST116') { // No rows found
            return {
                id: expertId,
                stats: null
            }
        }
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

    // Fetch all *verified* predictions for this user to calculate breakdown
    const { data: predictions, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", expertId)
        .not("outcome", "is", null)

    if (error || !predictions) return { byAsset: [], byTimeframe: [] }

    // Calculate Asset Breakdown
    const assetMap = new Map<string, { total: number, correct: number }>()
    // Calculate Timeframe Breakdown
    const timeframeMap = new Map<string, { total: number, correct: number }>()

    predictions.forEach(p => {
        // Asset
        const asset = p.globalAsset || p.category || "Other"
        const currentAsset = assetMap.get(asset) || { total: 0, correct: 0 }
        currentAsset.total++
        if (p.outcome === 'Correct') currentAsset.correct++
        assetMap.set(asset, currentAsset)

        // Timeframe
        let durationLabel = "Intraday"
        if (p.duration_minutes > 1440) durationLabel = "Long Term"
        else if (p.duration_minutes > 60) durationLabel = "Short Term"
        else durationLabel = "Scalp (<1h)"

        const currentTime = timeframeMap.get(durationLabel) || { total: 0, correct: 0 }
        currentTime.total++
        if (p.outcome === 'Correct') currentTime.correct++
        timeframeMap.set(durationLabel, currentTime)
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

    return { byAsset, byTimeframe }
}
