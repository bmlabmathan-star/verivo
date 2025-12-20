import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StartContributingButton } from "@/components/start-contributing-button"

export default function PredictionsPage() {
  return (
    <div className="container py-12 max-w-5xl">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
          PREDICTIONS
        </h1>
        <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
          A neutral repository for time-locked commitments. Verivo provides the framework for record-based accountability across all domains.
        </p>
      </div>

      {/* Protocol Explanation */}
      <div className="glass-card p-10 rounded-3xl mb-16 border-l-8 border-purple-500">
        <h2 className="text-2xl font-bold text-white mb-4">The Time-Locked Protocol</h2>
        <p className="text-white/70 leading-relaxed text-lg">
          A time-locked prediction is an unalterable data commitment. Once submitted, the prediction is secured against retrospective edits or removals. This system design ensures that credibility is built on a transparent, chronological record of performance.
        </p>
      </div>

      {/* Conceptual Examples */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Conceptual System Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              domain: "Finance",
              asset: "S&P 500 Index",
              forecast: "> 6,200",
              lock: "Dec 2025",
              color: "border-blue-500/30"
            },
            {
              domain: "Science",
              asset: "Artemis III Lunar Landing",
              forecast: "Official Launch Date",
              lock: "Q4 2026",
              color: "border-cyan-500/30"
            },
            {
              domain: "Sports",
              asset: "2026 FIFA World Cup",
              forecast: "Winning Team: Brazil",
              lock: "May 2026",
              color: "border-green-500/30"
            }
          ].map((example, i) => (
            <Card key={i} className={`glass-card border-white/10 ${example.color} overflow-hidden`}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-white/40">
                    {example.domain}
                  </div>
                  <span className="text-xl">🔒</span>
                </div>
                <CardTitle className="text-white text-xl">{example.asset}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Forecast</div>
                  <div className="text-lg font-bold text-white">{example.forecast}</div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Lock Period</div>
                  <div className="text-white font-bold">{example.lock}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Roadmap Note */}
      {/* Call to Action */}
      <div className="text-center p-12 glass-card rounded-3xl border border-white/5 bg-white/5">
        <div className="inline-block px-4 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold uppercase tracking-widest mb-6">
          Live Protocol
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Build Your Record?</h3>
        <p className="text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
          The protocol is live. Start submitting locked predictions to establish your credibility score on the Verivo network.
        </p>
        <StartContributingButton />
      </div>
    </div>
  )
}
