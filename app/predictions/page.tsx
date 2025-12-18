import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"

export default async function PredictionsPage() {
  const predictions = await getPredictions()

  return (
    <div className="container py-12 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
          MARKET INSIGHTS
        </h1>
        <p className="text-xl text-white/80 font-medium">
          Real-time predictions from the world's most accurate financial minds.
        </p>
      </div>

      <div className="space-y-6">
        {predictions.length === 0 ? (
          <div className="glass-card p-16 text-center text-white/40">
            No active predictions found in the vault.
          </div>
        ) : (
          predictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction as any}
              showFull={prediction.is_revealed}
            />
          ))
        )}
      </div>
    </div>
  )
}



