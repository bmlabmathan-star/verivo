"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { validatePrediction } from "@/lib/actions/predictions"
import { formatDateTime } from "@/lib/utils"

export default function ValidatePredictionPage() {
  const router = useRouter()
  const params = useParams()
  const predictionId = params.id as string
  // const supabase = createClient() - using shared instance


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
    <div className="container py-12 max-w-4xl">
      <div className="glass-card overflow-hidden border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        <CardHeader className="pt-10">
          <CardTitle className="text-3xl font-black text-white tracking-tight uppercase">VALIDATION CONSOLE</CardTitle>
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest mt-1">Finalizing Prediction Data</p>
        </CardHeader>
        <CardContent className="pt-6 pb-12">
          <div className="mb-10 p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-6">INTEL SNAPSHOT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Asset</span>
                <span className="text-white font-black">{prediction.asset_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Category</span>
                <span className="text-white font-bold">{prediction.category}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Expert</span>
                <span className="text-purple-400 font-bold">{prediction.experts?.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Call</span>
                <span className="text-white font-black">{prediction.prediction}</span>
              </div>
              {prediction.target_value && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Target</span>
                  <span className="text-pink-500 font-black">{prediction.target_value}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 font-mono uppercase text-[10px] tracking-widest">Closes</span>
                <span className="text-white/80">{formatDateTime(prediction.event_close_time)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {canValidate ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="actual_value" className="text-white/60 uppercase text-[10px] tracking-widest font-black ml-1">OFFICIAL ACTUAL VALUE</Label>
                <Input
                  id="actual_value"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="h-16 bg-white/5 border-white/10 text-2xl font-black text-white px-6 focus:border-purple-500 transition-all rounded-2xl"
                  value={formData.actual_value}
                  onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label className="text-white/60 uppercase text-[10px] tracking-widest font-black ml-1">VERDICT</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_correct: true })}
                    className={`h-20 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${formData.is_correct === true
                      ? 'bg-green-500/10 border-green-500 text-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_correct === true ? 'border-green-500' : 'border-white/20'}`}>
                      {formData.is_correct === true && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                    </div>
                    <span className="font-black tracking-tight text-lg">ACCURATE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_correct: false })}
                    className={`h-20 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${formData.is_correct === false
                      ? 'bg-red-500/10 border-red-500 text-red-500 shadow-lg shadow-red-500/20'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_correct === false ? 'border-red-500' : 'border-white/20'}`}>
                      {formData.is_correct === false && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                    </div>
                    <span className="font-black tracking-tight text-lg">FAILED</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <Button type="submit" disabled={submitting} className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]">
                  {submitting ? "COMMITTING..." : "FINALIZE & REVEAL"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.back()} className="text-white/40 hover:text-white font-mono uppercase text-xs">
                  Discard Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-8 text-center">
              <div className="text-blue-400 font-black mb-2 uppercase tracking-widest text-lg">ACTION RESTRICTED</div>
              <p className="text-white/60 leading-relaxed font-medium">
                {now < eventCloseTime
                  ? `This prediction is still active and cannot be validated until ${formatDateTime(prediction.event_close_time)}.`
                  : "This prediction has already been officially validated and recorded in history."}
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  )
}
