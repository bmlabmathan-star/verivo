"use server"

import { createClient } from "@/lib/supabase/server"

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
      .order("verivo_score", { foreignTable: "expert_stats", ascending: false })

    if (error) {
      console.error("Database error in getExperts:", error.message)
      return []
    }

    return data || []
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




