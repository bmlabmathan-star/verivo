import { getPredictions } from "@/lib/actions/predictions"
import { PredictionCard } from "@/components/prediction-card"

export default async function PredictionsPage() {
  try {
    const predictions = await getPredictions()

    return (
      <div className="container py-12 max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
            MARKET INSIGHTS
          </h1>
          <p className="text-xl text-white/80 font-medium">
            Real-time predictions from the world's most accurate financial minds.
          </p>
        </div>

        <div className="space-y-6">
          {predictions.length === 0 ? (
            <div className="glass-card p-16 text-center text-white/40">
              No active predictions found in the vault.
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
        <h1 className="text-2xl font-bold mb-4">DEPLOYED DEBUG LOG (Predictions):</h1>
        <p className="font-mono text-sm whitespace-pre-wrap">{err.message}</p>
        {err.stack && <p className="mt-4 font-mono text-xs opacity-50">{err.stack}</p>}
        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <p className="text-sm font-bold">Troubleshooting Check:</p>
          <ul className="list-disc list-inside text-xs mt-2 opacity-70">
            <li>Are NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set in your hosting platform (Netlify/Vercel)?</li>
            <li>Is the database schema up to date?</li>
          </ul>
        </div>
      </div>
    )
  }
}
