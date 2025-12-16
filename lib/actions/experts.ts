"use server"

import { createClient } from "@/lib/supabase/server"

export async function getExperts() {
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
    throw new Error(error.message)
  }

  return data
}

export async function getExpertById(expertId: string) {
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
    throw new Error(error.message)
  }

  return data
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



