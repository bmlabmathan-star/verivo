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
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in zoom-in duration-700">
          PREDICTION FEED
        </h1>
        <p className="text-xl text-white/80 font-medium">
          The heartbeat of market foresight – verified and unalterable.
        </p>
      </div>

      <div className="glass-card mb-12 p-1 rounded-3xl border-white/20">
        <div className="p-8">
          <FeedFilters />
        </div>
      </div>

      <div className="space-y-6">
        {predictions.length === 0 ? (
          <div className="glass-card p-20 rounded-3xl text-center">
            <div className="text-6xl mb-6">🏜️</div>
            <p className="text-white/60 text-xl font-medium">
              The feed is quiet... for now.
            </p>
          </div>
        ) : (
          predictions.map((prediction) => (
            <div key={prediction.id} className="relative pl-12 group">
              <div className="absolute left-0 top-12 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-white shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
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

