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

  const prediction = {
    expert_id: user.id,
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
  expert_id?: string
}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from("predictions")
      .select(`
        *,
        experts:expert_id (
          id,
          name,
          username
        ),
        validations (
          id,
          actual_value,
          is_correct,
          validated_at
        )
      `)
      .order("created_at", { ascending: false })

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.revealed !== undefined) {
      query = query.eq("is_revealed", filters.revealed)
    }

    if (filters?.expert_id) {
      query = query.eq("expert_id", filters.expert_id)
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

  // Check if prediction exists and event has closed
  const { data: prediction, error: predError } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", predictionId)
    .single()

  if (predError || !prediction) {
    throw new Error("Prediction not found")
  }

  const eventCloseTime = new Date(prediction.event_close_time)
  const now = new Date()

  if (now < eventCloseTime) {
    throw new Error("Event has not closed yet")
  }

  if (prediction.is_revealed) {
    throw new Error("Prediction already validated")
  }

  // Create validation
  const { error: validationError } = await supabase
    .from("validations")
    .insert({
      prediction_id: predictionId,
      actual_value: actualValue,
      is_correct: isCorrect,
    })

  if (validationError) {
    throw new Error(validationError.message)
  }

  // Reveal prediction
  const { error: revealError } = await supabase
    .from("predictions")
    .update({ is_revealed: true })
    .eq("id", predictionId)

  if (revealError) {
    throw new Error(revealError.message)
  }

  revalidatePath("/feed")
  revalidatePath("/predictions")
  revalidatePath(`/experts/${prediction.expert_id}`)
  revalidatePath("/dashboard")
}

