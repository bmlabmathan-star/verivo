import { Card, CardContent } from "@/components/ui/card"

export default function LeaderboardPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          LEADERBOARD
        </h1>
        <p className="text-xl text-white/80 font-medium">
          Rankings driven by pure, validated performance data.
        </p>
      </div>

      <div className="glass-card p-10 rounded-3xl mb-12 border-l-8 border-yellow-500">
        <h2 className="text-2xl font-bold text-white mb-4">Methodology</h2>
        <p className="text-white/70 leading-relaxed text-lg">
          The Verivo Leaderboard is a system-calculated ranking of all contributors.
          Rankings strictly reflect historical consistency and accuracy across multiple domains.
          There are no subjective assessments—only mathematical proof of predictive credibility.
        </p>
      </div>

      {/* Conceptual Leaderboard */}
      <div className="space-y-4 mb-16">
        {[
          { rank: 1, id: "Contributor #84", score: 92, status: "Top Tier" },
          { rank: 2, id: "Contributor #12", score: 89, status: "Rising" },
          { rank: 3, id: "Contributor #102", score: 84, status: "Consistent" }
        ].map((item, i) => (
          <Card key={i} className="glass-card card-hover border-white/10 group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-6 p-6">
                <div className="text-4xl font-black text-white/20 w-12 group-hover:text-white/40 transition-colors">
                  #{item.rank}
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                  {item.id.charAt(12)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">{item.id}</h3>
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Status: {item.status}</div>
                </div>
                <div className="text-right pr-8">
                  <div className="text-3xl font-black text-white group-hover:text-yellow-400 transition-all">{item.score}</div>
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Verivo Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer Section */}
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>⚠️</span> Informational Disclaimer
        </h3>
        <p className="text-xs text-white/40 leading-relaxed">
          The rankings presented above are conceptual system examples. Live rankings are calculated via unalterable platform data
          and do not constitute a financial endorsement or professional recommendation. Verivo serves as a transparency
          protocol for historical data tracking.
        </p>
      </div>
    </div>
  )
}
