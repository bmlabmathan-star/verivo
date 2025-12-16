"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPrediction } from "@/lib/actions/predictions"

export function PredictionForm() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    category: "equity",
    asset_name: "",
    prediction: "",
    target_value: "",
    current_value: "",
    confidence: "50",
    direction: "up",
    event_date: "",
    event_close_time: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      await createPrediction(formDataObj)
      setShowForm(false)
      setFormData({
        category: "equity",
        asset_name: "",
        prediction: "",
        target_value: "",
        current_value: "",
        confidence: "50",
        direction: "up",
        event_date: "",
        event_close_time: "",
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to create prediction")
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        + Create New Prediction
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Create Prediction</CardTitle>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="commodity">Commodity</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asset Name *</Label>
              <Input
                placeholder="e.g., NSE Index, Bitcoin"
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prediction *</Label>
            <Textarea
              placeholder="Describe your prediction in detail..."
              rows={4}
              value={formData.prediction}
              onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction *</Label>
              <Select
                value={formData.direction}
                onValueChange={(value) => setFormData({ ...formData, direction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">📈 Up</SelectItem>
                  <SelectItem value="down">📉 Down</SelectItem>
                  <SelectItem value="neutral">➡️ Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Confidence Level *</Label>
              <Input
                type="range"
                min="0"
                max="100"
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                required
              />
              <div className="text-center font-semibold text-purple-600">
                {formData.confidence}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Value (Optional)</Label>
              <Input
                type="number"
                step="any"
                placeholder="Current market value"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Value (Optional)</Label>
              <Input
                type="number"
                step="any"
                placeholder="Predicted target value"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Event Close Time *</Label>
              <Input
                type="datetime-local"
                value={formData.event_close_time}
                onChange={(e) => setFormData({ ...formData, event_close_time: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Lock & Submit Prediction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}



