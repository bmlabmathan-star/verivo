"use server"

import { createClient } from "@/lib/supabase/server"

// Hardcoded list of manually featured users (e.g. core team or early VIPs) using usernames
const FEATURED_USERNAMES = ["verivo_official", "admin", "market_wizard"]

export async function getExperts() {
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
      // Order by score descending, but keep nulls/zeros at the end
      .order("verivo_score", { foreignTable: "expert_stats", ascending: false })

    if (error) {
      console.error("Database error in getExperts:", error.message)
      return []
    }

    if (!data) return []

    // Filter: Include if (total_predictions > 0) OR (username is in FEATURED_USERNAMES)
    const filtered = data.filter((expert: any) => {
      const stats = expert.expert_stats?.[0]
      const hasForecasts = stats && stats.total_predictions > 0
      const isFeatured = expert.username && FEATURED_USERNAMES.includes(expert.username)

      return hasForecasts || isFeatured
    })

    return filtered
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




