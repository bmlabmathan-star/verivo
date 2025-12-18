import { getExperts } from "@/lib/actions/experts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export default async function LeaderboardPage() {
  const experts = await getExperts()

  return (
    <div className="container py-8">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in zoom-in duration-700">
          THE HALL OF FAME
        </h1>
        <p className="text-xl text-white/80 font-medium">
          The ultimate ranking of market sages. Top performance, verified by the vault.
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
            <Link key={expert.id} href={`/experts/${expert.id}`} className="group">
              <Card className="glass-card card-hover border-white/10 overflow-hidden mb-4 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-24 h-24 md:h-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-3xl font-black py-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1 w-full p-6 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl font-black shadow-inner">
                        {expert.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all duration-300">{expert.name}</h3>
                        <p className="text-white/40 font-mono text-sm leading-tight">@{expert.username}</p>
                      </div>
                      <div className="flex gap-12 w-full md:w-auto justify-around">
                        <div className="text-center group-hover:scale-110 transition-transform duration-300">
                          <div className="text-2xl font-black text-white">{stats.total_predictions}</div>
                          <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Calls</div>
                        </div>
                        <div className="text-center group-hover:scale-110 transition-transform duration-300">
                          <div className="text-2xl font-black text-purple-400">
                            {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(0)}%` : '0%'}
                          </div>
                          <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Accuracy</div>
                        </div>
                        <div className="text-center group-hover:scale-110 transition-transform duration-300">
                          <div className="text-4xl font-black text-pink-500 bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
                            {stats.verivo_score}
                          </div>
                          <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-2">Score</div>
                        </div>
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



