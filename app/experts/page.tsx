import Link from "next/link"
import { getExperts } from "@/lib/actions/experts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function ExpertsPage() {
  const experts = await getExperts()

  return (
    <div className="container py-8">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          VERIFIED EXPERTS
        </h1>
        <p className="text-xl text-white/80 font-medium">
          The elite minds of market foresight, ranked by proven performance.
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
            <Link key={expert.id} href={`/experts/${expert.id}`} className="group">
              <Card className="glass-card card-hover h-full border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-300">⭐</div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-3xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all duration-300">{expert.name}</h3>
                      <p className="text-white/50 font-mono text-sm leading-none">@{expert.username}</p>
                    </div>
                  </div>
                  {expert.bio && (
                    <p className="text-white/70 mt-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      {expert.bio}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">{stats.total_predictions}</div>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400">
                        {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(0)}%` : '0%'}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-pink-500">
                        {stats.verivo_score}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Score</div>
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



