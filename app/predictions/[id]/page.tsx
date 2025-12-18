import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function PredictionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const predictions = await getPredictions()
  const prediction = predictions.find((p) => p.id === params.id)

  if (!prediction) {
    notFound()
  }

  const eventCloseTime = new Date(prediction.event_close_time)
  const now = new Date()
  const canValidate = user && now >= eventCloseTime && !prediction.is_revealed

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/feed">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 transition-all font-mono tracking-tighter uppercase text-xs">
              ← Back to Intel Feed
            </Button>
          </Link>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <PredictionCard prediction={prediction as any} showFull={prediction.is_revealed} />

        {canValidate && (
          <div className="glass-card mt-8 p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">VALIDATION REQUIRED</h3>
              <p className="text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
                The event has concluded. We need your verification to finalize the accuracy score for this expert.
              </p>
              <Link href={`/predictions/${params.id}/validate`}>
                <Button className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  VERIFY RESULT NOW
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



