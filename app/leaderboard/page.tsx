import Link from "next/link"
import { getExperts } from "@/lib/actions/experts"
import { Card, CardContent } from "@/components/ui/card"

export default async function LeaderboardPage() {
  try {
    const experts = await getExperts()

    return (
      <div className="container py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            LEADERBOARD
          </h1>
          <p className="text-xl text-white/80 font-medium">
            The mathematical elite. Ranked by pure performance metrics.
          </p>
        </div>

        <div className="space-y-4">
          {experts.map((expert, index) => {
            const rawStats = Array.isArray(expert.expert_stats) ? expert.expert_stats[0] : expert.expert_stats
            const stats = rawStats || {
              total_predictions: 0,
              accuracy_rate: 0,
              verivo_score: 0,
            }

            return (
              <Link key={expert.id} href={`/experts/${expert.id}`}>
                <Card className="glass-card card-hover border-white/10 group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-6 p-6">
                      <div className="text-4xl font-black text-white/20 w-12 group-hover:text-white/40 transition-colors">
                        #{index + 1}
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                        {expert.name ? expert.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{expert.name}</h3>
                        <p className="text-white/40 font-mono text-sm leading-none mt-1">@{expert.username}</p>
                      </div>
                      <div className="flex gap-12 text-right invisible md:visible pr-8">
                        <div>
                          <div className="text-2xl font-black text-white">{stats.total_predictions}</div>
                          <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Calls</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-purple-400">
                            {stats.accuracy_rate ? `${Number(stats.accuracy_rate).toFixed(0)}%` : '0%'}
                          </div>
                          <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-pink-500">
                            {stats.verivo_score}
                          </div>
                          <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Score</div>
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
  } catch (err: any) {
    return (
      <div className="container py-20 text-white bg-red-900/20 p-8 rounded-2xl border border-red-500">
        <h1 className="text-2xl font-bold mb-4">DEPLOYED DEBUG LOG (Leaderboard):</h1>
        <p className="font-mono text-sm whitespace-pre-wrap">{err.message}</p>
        <div className="mt-8 p-4 bg-white/10 rounded-lg text-xs">
          Check environment variables and database schema.
        </div>
      </div>
    )
  }
}
