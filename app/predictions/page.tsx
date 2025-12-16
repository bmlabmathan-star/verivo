import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"

export default async function PredictionsPage() {
  const predictions = await getPredictions()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Expert Predictions</h1>
        <p className="text-lg text-white/90">
          Browse all expert predictions and their validation results
        </p>
      </div>

      <div className="space-y-4">
        {predictions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No predictions found.
            </CardContent>
          </Card>
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



