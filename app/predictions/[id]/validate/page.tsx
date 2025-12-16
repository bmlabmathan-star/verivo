"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { validatePrediction } from "@/lib/actions/predictions"
import { formatDateTime } from "@/lib/utils"

export default function ValidatePredictionPage() {
  const router = useRouter()
  const params = useParams()
  const predictionId = params.id as string
  const supabase = createClient()
  
  const [prediction, setPrediction] = useState<any>(null)
  const [formData, setFormData] = useState({
    actual_value: "",
    is_correct: true,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPrediction = async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select(`
          *,
          experts:expert_id (
            name,
            username
          )
        `)
        .eq("id", predictionId)
        .single()

      if (error || !data) {
        setError("Prediction not found")
        setLoading(false)
        return
      }

      const eventCloseTime = new Date(data.event_close_time)
      const now = new Date()
      
      if (now < eventCloseTime) {
        setError("Event has not closed yet. Cannot validate until after the event close time.")
      }
      
      if (data.is_revealed) {
        setError("This prediction has already been validated.")
      }

      setPrediction(data)
      setLoading(false)
    }

    fetchPrediction()
  }, [predictionId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await validatePrediction(
        predictionId,
        parseFloat(formData.actual_value),
        formData.is_correct
      )
      router.push(`/predictions/${predictionId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to validate prediction")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            Prediction not found
          </CardContent>
        </Card>
      </div>
    )
  }

  const eventCloseTime = new Date(prediction.event_close_time)
  const now = new Date()
  const canValidate = now >= eventCloseTime && !prediction.is_revealed

  return (
    <div className="container py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Validate Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Prediction Details</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Asset:</strong> {prediction.asset_name}</div>
              <div><strong>Category:</strong> {prediction.category}</div>
              <div><strong>Expert:</strong> {prediction.experts?.name}</div>
              <div><strong>Prediction:</strong> {prediction.prediction}</div>
              {prediction.target_value && (
                <div><strong>Target Value:</strong> {prediction.target_value}</div>
              )}
              <div><strong>Event Date:</strong> {new Date(prediction.event_date).toLocaleDateString()}</div>
              <div><strong>Event Close Time:</strong> {formatDateTime(prediction.event_close_time)}</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {canValidate ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="actual_value">Actual Value *</Label>
                <Input
                  id="actual_value"
                  type="number"
                  step="any"
                  placeholder="Enter the actual market value after event closure"
                  value={formData.actual_value}
                  onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Was the prediction correct? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="is_correct"
                      value="true"
                      checked={formData.is_correct === true}
                      onChange={() => setFormData({ ...formData, is_correct: true })}
                      required
                    />
                    <span>Correct</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="is_correct"
                      value="false"
                      checked={formData.is_correct === false}
                      onChange={() => setFormData({ ...formData, is_correct: false })}
                      required
                    />
                    <span>Incorrect</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Validating..." : "Validate & Reveal Prediction"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              {now < eventCloseTime
                ? `This prediction cannot be validated until ${formatDateTime(prediction.event_close_time)}`
                : "This prediction has already been validated and revealed."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



