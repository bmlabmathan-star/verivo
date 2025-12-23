"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPrediction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // NOTE: This server action seems legacy vs the /api/create-prediction route used in frontend.
  // But updating for consistency.
  const prediction = {
    user_id: user.id, // Changed from expert_id
    category: formData.get("category") as string,
    asset_name: formData.get("asset_name") as string,
    prediction: formData.get("prediction") as string,
    target_value: formData.get("target_value") ? parseFloat(formData.get("target_value") as string) : null,
    current_value: formData.get("current_value") ? parseFloat(formData.get("current_value") as string) : null,
    confidence: formData.get("confidence") ? parseInt(formData.get("confidence") as string) : null,
    direction: formData.get("direction") as string || null,
    event_date: formData.get("event_date") as string,
    event_close_time: formData.get("event_close_time") as string,
    is_locked: true,
    is_revealed: false,
  }

  const { error } = await supabase.from("predictions").insert(prediction)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard")
  revalidatePath("/feed")
  revalidatePath("/predictions")
}

export async function getPredictions(filters?: {
  category?: string
  revealed?: boolean
  userId?: string // Changed from expert_id
}) {
  try {
    const supabase = await createClient()

    // Simplified select to avoid relationship errors with legacy tables.
    // Fetching * includes reference_price, final_price, outcome etc.
    let query = supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.revealed !== undefined) {
      query = query.eq("is_revealed", filters.revealed)
    }

    if (filters?.userId) {
      // Changed to current column 'user_id'
      query = query.eq("user_id", filters.userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error in getPredictions:", error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Unexpected error in getPredictions:", err)
    return []
  }
}

export async function validatePrediction(predictionId: string, actualValue: number, isCorrect: boolean) {
  const supabase = await createClient()

  // manual validation logic (legacy?)
  const { data: prediction, error: predError } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", predictionId)
    .single()

  if (predError || !prediction) {
    throw new Error("Prediction not found")
  }

  // ... (keeping legacy logic intact if needed, but updating is_revealed)
  // New automation updates outcome/final_price directly.

  const { error: updateError } = await supabase
    .from("predictions")
    .update({
      is_revealed: true,
      // map legacy args to new cols if manual validation used
      outcome: isCorrect ? 'Correct' : 'Incorrect',
      final_price: actualValue,
      evaluation_time: new Date().toISOString()
    })
    .eq("id", predictionId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/feed")
  revalidatePath("/predictions")
  revalidatePath("/dashboard")
}
