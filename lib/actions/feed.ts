"use server"

import { createClient } from "@/lib/supabase/server"

export async function getVerifiedFeed(params: {
    filter?: string
    sort?: string
}) {
    const supabase = await createClient()

    // Base query: only evaluated predictions
    // We use outcome IS NOT NULL as the definitive 'evaluated' check
    let query = supabase
        .from("predictions")
        .select("*")
        .not("outcome", "is", null)

    // 1. Apply Filtering
    if (params.filter && params.filter !== "All") {
        // Mapping simpler filter names to DB values if needed
        // 'Crypto', 'Forex', 'Commodities' match globalAsset column usually
        // 'Indices' matches Stocks/Indices category logic?
        // Let's assume globalAsset holds these, or category holds 'Stocks'/'Indices'

        if (params.filter === "Indices") {
            query = query.eq("category", "Indices")
        } else if (params.filter === "Stocks") {
            query = query.eq("category", "Stocks")
        } else {
            // For global assets: Crypto, Forex, Commodities
            query = query.eq("globalAsset", params.filter)
        }
    }

    // 2. Apply Sorting
    // Options: 'recency' (default), 'timeframe' (duration), 'accuracy' (user score - complex, maybe skip or approximation)

    switch (params.sort) {
        case "timeframe":
            query = query.order("duration_minutes", { ascending: false })
            break
        case "oldest":
            query = query.order("evaluation_time", { ascending: true })
            break
        default: // 'recency'
            query = query.order("evaluation_time", { ascending: false })
            break
    }

    // Limit to 50 for performance
    query = query.limit(50)

    const { data, error } = await query

    if (error) {
        console.error("Error fetching feed:", error)
        return []
    }

    return data
}

export async function getTopPerformers() {
    const supabase = await createClient()

    // Using the view created in previous steps
    const { data, error } = await supabase
        .from("user_verivo_scores")
        .select("*")
        .order("verivo_score", { ascending: false })
        .limit(10)

    if (error) {
        console.error("Error fetching top performers:", error)
        return []
        // Fallback or empty if table doesn't exist yet
    }

    return data
}
