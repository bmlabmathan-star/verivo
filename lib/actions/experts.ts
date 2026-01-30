"use server"

import { createClient } from "@/lib/supabase/server"

// Hardcoded list of manually featured users (e.g. core team or early VIPs) using usernames
const FEATURED_USERNAMES = ["verivo_official", "admin", "market_wizard"]

export async function getExperts() {
  try {
    const supabase = await createClient()

    // Requirements:
    // 1. Fetch from profiles (experts table)
    // 2. INNER JOIN predictions (to ensure count > 0)
    // 3. Count predictions
    // 4. Order by count DESC

    // Note: We use 'experts' table as it matches the 'profiles' role in this codebase.
    // 'predictions!inner(count)' performs the inner join and count.

    // We also fetch expert_stats to display the score if it exists.

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        registration_id,
        predictions!inner(count),
        expert_stats (
          total_predictions,
          verivo_score
        )
      `)

    if (error) {
      console.error("Database error in getExperts:", error.message)
      return []
    }

    if (!data) return []

    // Process: Map to shape, extract count, sort by count DESC
    const expertList = data.map((expert: any) => {
      // Count from the inner join
      let count = 0
      if (Array.isArray(expert.predictions) && expert.predictions[0]) {
        count = expert.predictions[0].count
      }

      // If count is somehow 0 (unlikely with inner join), fallback or keep as 0. 
      // Inner join ensures at least 1 prediction exists for the user.

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
      .from("profiles")
      .select(`
        *,
        registration_id,
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




