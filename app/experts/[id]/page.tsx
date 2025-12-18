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
    <div className="container py-12 max-w-5xl">
      <div className="glass-card overflow-hidden mb-12 border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse" />
        <CardHeader className="pt-12 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-5xl font-black shadow-2xl animate-in zoom-in duration-500 group-hover:scale-105 transition-transform">
              {expert.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
                {expert.name}
              </h1>
              <p className="text-xl text-purple-400 font-mono mb-6">@{expert.username}</p>
              {expert.bio && (
                <p className="text-lg text-white/80 leading-relaxed max-w-2xl bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                  {expert.bio}
                </p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-6 text-white/40 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Member since {new Date(expert.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-black/20 border-t border-white/5 p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-white/5">
            <div className="p-8 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-black text-white">{stats.total_predictions}</div>
              <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Total Calls</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-black text-green-400">{stats.correct_predictions}</div>
              <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Validated</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-black text-purple-400">
                {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(0)}%` : '0%'}
              </div>
              <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Hit Rate</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-black text-pink-500">{stats.verivo_score}</div>
              <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Vault Score</div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-3xl font-black text-white tracking-tight">PREDICTION HISTORY</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div className="space-y-6">
        {predictions.length === 0 ? (
          <div className="glass-card p-12 text-center text-white/40">
            No historical data available for this profile.
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



