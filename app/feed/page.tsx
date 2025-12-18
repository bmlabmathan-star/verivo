import { getPredictions } from "@/lib/actions/predictions"
import { PredictionCard } from "@/components/prediction-card"
import { FeedFilters } from "@/components/feed-filters"

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string }
}) {
  try {
    const revealed = searchParams.status === "revealed" ? true :
      searchParams.status === "locked" ? false : undefined

    const predictions = await getPredictions({
      category: searchParams.category,
      revealed,
    })

    return (
      <div className="container py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
            INTEL FEED
          </h1>
          <p className="text-xl text-white/80 font-medium">
            Live stream of verified market calls and algorithmic revelations.
          </p>
        </div>

        <FeedFilters />

        <div className="mt-12 space-y-6">
          {predictions.length === 0 ? (
            <div className="glass-card p-16 text-center text-white/40">
              No intelligence found matching these parameters.
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
  } catch (err: any) {
    return (
      <div className="container py-20 text-white bg-red-900/20 p-8 rounded-2xl border border-red-500">
        <h1 className="text-2xl font-bold mb-4">DEPLOYED DEBUG LOG (Feed):</h1>
        <p className="font-mono text-sm whitespace-pre-wrap">{err.message}</p>
        <div className="mt-8 p-4 bg-white/10 rounded-lg text-xs">
          Check environment variables and database schema.
        </div>
      </div>
    )
  }
}
