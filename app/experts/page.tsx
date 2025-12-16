import Link from "next/link"
import { getExperts } from "@/lib/actions/experts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function ExpertsPage() {
  const experts = await getExperts()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Verified Experts</h1>
        <p className="text-lg text-white/90">
          Browse experts ranked by their prediction accuracy and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => {
          const stats = expert.expert_stats?.[0] || {
            total_predictions: 0,
            accuracy_rate: 0,
            verivo_score: 0,
          }

          return (
            <Link key={expert.id} href={`/experts/${expert.id}`}>
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-2xl font-bold">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{expert.name}</h3>
                      <p className="text-sm text-gray-500">@{expert.username}</p>
                    </div>
                  </div>
                  {expert.bio && (
                    <p className="text-sm text-gray-600 mt-2">{expert.bio}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.total_predictions}</div>
                      <div className="text-xs text-gray-500 uppercase">Predictions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.verivo_score}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">Verivo Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}



