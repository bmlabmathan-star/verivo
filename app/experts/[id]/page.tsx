import { getExpertById } from "@/lib/actions/experts"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"
import { notFound } from "next/navigation"

export default async function ExpertProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const expert = await getExpertById(params.id)
  const predictions = await getPredictions({ expert_id: params.id })

  if (!expert) {
    notFound()
  }

  const stats = expert.expert_stats?.[0] || {
    total_predictions: 0,
    correct_predictions: 0,
    accuracy_rate: 0,
    verivo_score: 0,
  }

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-4xl font-bold">
              {expert.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{expert.name}</h1>
              <p className="text-lg text-gray-600 mb-2">@{expert.username}</p>
              {expert.bio && <p className="text-gray-700">{expert.bio}</p>}
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(expert.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{stats.total_predictions}</div>
                <div className="text-xs text-gray-500 uppercase">Predictions Made</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{stats.correct_predictions}</div>
                <div className="text-xs text-gray-500 uppercase">Correct</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded">
                <div className="text-2xl font-bold">
                  {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-xs uppercase">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded">
                <div className="text-2xl font-bold">{stats.verivo_score}</div>
                <div className="text-xs uppercase">Verivo Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No predictions found.</p>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction as any}
                  showFull={prediction.is_revealed}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



