import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"
import { FeedFilters } from "./feed-filters"

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string }
}) {
  const category = searchParams.category || "all"
  const status = searchParams.status || "all"

  const filters: any = {}
  if (category !== "all") {
    filters.category = category
  }
  if (status === "revealed") {
    filters.revealed = true
  } else if (status === "locked") {
    filters.revealed = false
  }

  const predictions = await getPredictions(filters)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Prediction Feed</h1>
        <p className="text-lg text-white/90">
          Real-time timeline of expert predictions and validations
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <FeedFilters />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {predictions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No predictions found matching your filters.
            </CardContent>
          </Card>
        ) : (
          predictions.map((prediction) => (
            <div key={prediction.id} className="relative pl-8">
              <div className="absolute left-0 top-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow"></div>
              <PredictionCard
                prediction={prediction as any}
                showFull={prediction.is_revealed}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

