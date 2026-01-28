"use server"

import { createClient } from "@/lib/supabase/server"

// Hardcoded list of manually featured users (e.g. core team or early VIPs) using usernames
const FEATURED_USERNAMES = ["verivo_official", "admin", "market_wizard"]

export async function getExperts() {
  try {
    const supabase = await createClient()

    // Correct Query Logic per Requirements:
    // 1. Fetch from 'experts' (profiles equivalent)
    // 2. INNER JOIN 'predictions' via 'expert_id' to 'id' (filtered via !inner)
    // 3. Count predictions
    // 4. Return only if count > 0
    // 5. Order by count DESC

    // We rely on expert_stats if reliable or just fallback to the join count.

    // Using explicit selection with !inner to enforce existence of predictions
    // Note: 'predictions!inner(count)' fetches the count of matched predictions.
    // However, Supabase (PostgREST) returns one row per expert.

    const { data, error } = await supabase
      .from("experts")
      .select(`
        *,
        predictions!inner(count),
        expert_stats (
          total_predictions,
          correct_predictions,
          accuracy_rate,
          verivo_score
        )
      `)

    if (error) {
      console.error("Database error in getExperts:", error.message)
      return []
    }

    if (!data) return []

    // Process data to standard format
    const expertList = data.map((expert: any) => {
      // PostgREST return for count usually comes as [{ count: N }] array
      let count = 0
      if (Array.isArray(expert.predictions) && expert.predictions[0]) {
        count = expert.predictions[0].count
      } else if (expert.expert_stats && expert.expert_stats[0]) {
        count = expert.expert_stats[0].total_predictions
      }

      return {
        ...expert,
        computed_prediction_count: count
      }
    })

    // Sort descending by count
    expertList.sort((a, b) => b.computed_prediction_count - a.computed_prediction_count)

    return expertList
  } catch (err) {
    console.error("Unexpected error in getExperts:", err)
    return []
  }
}

export async function getExpertById(expertId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("experts")
      .select(`
        *,
        expert_stats (
          total_predictions,
          correct_predictions,
          accuracy_rate,
          verivo_score
        )
      `)
      .eq("id", expertId)
      .single()

    if (error) {
      console.error("Database error in getExpertById:", error.message)
      return null
    }

    return data
  } catch (err) {
    console.error("Unexpected error in getExpertById:", err)
    return null
  }
}

export async function getCurrentExpert() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return getExpertById(user.id)
}

export async function getExpertByUsername(username: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("experts")
      .select(`
        *,
        expert_stats (
          total_predictions,
          correct_predictions,
          accuracy_rate,
          verivo_score
        )
      `)
      .eq("username", username)
      .single()

    if (error) {
      // console.error("Database error in getExpertByUsername:", error.message)
      return null
    }

    return data
  } catch (err) {
    console.error("Unexpected error in getExpertByUsername:", err)
    return null
  }
}




