import { getExperts } from "@/lib/actions/experts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export default async function LeaderboardPage() {
  const experts = await getExperts()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-lg text-white/90">
          Top experts ranked by Verivo Score
        </p>
      </div>

      <div className="space-y-4">
        {experts.map((expert, index) => {
          const stats = expert.expert_stats?.[0] || {
            total_predictions: 0,
            accuracy_rate: 0,
            verivo_score: 0,
          }

          return (
            <Link key={expert.id} href={`/experts/${expert.id}`}>
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-3xl font-bold text-purple-600 w-12 text-center">
                      #{index + 1}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-2xl font-bold">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{expert.name}</h3>
                      <p className="text-sm text-gray-500">@{expert.username}</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-lg font-bold">{stats.total_predictions}</div>
                        <div className="text-xs text-gray-500">Predictions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.verivo_score}
                        </div>
                        <div className="text-xs text-gray-500">Verivo Score</div>
                      </div>
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



