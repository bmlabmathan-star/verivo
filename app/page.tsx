import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StartContributingButton } from "@/components/start-contributing-button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 hero-bg">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16 space-y-8">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter animate-in fade-in slide-in-from-top-10 duration-1000">
          VERIVO
        </h1>
        <div className="relative inline-block">
          <p className="text-2xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
            A Transparent Protocol for <span className="gradient-text">Predictive Credibility</span>
          </p>
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        </div>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed glass-card p-6 rounded-2xl border-white/20">
          Join a platform where contributors build credibility through transparent, locked predictions across finance, sports, and public events.
          All predictions are validated after events conclude, supporting record-based accountability.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <StartContributingButton />
          <Link href="/feed">
            <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/10 hover:border-white hover:scale-105 transition-all duration-300 font-bold px-10 py-8 text-xl rounded-full backdrop-blur-md">
              Live Feed
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-24">
        {[
          { icon: "🔒", title: "Locked", desc: "Predictions are secured before events and revealed only after closure." },
          { icon: "✅", title: "Verified", desc: "System-driven verification against primary data sources promotes consistency." },
          { icon: "⭐", title: "Credibility", desc: "Contributors earn scores based on historical performance and accuracy over time." },
          { icon: "🌍", title: "Multi-Domain", desc: "Broad coverage across finance, global events, and emerging trends." },
        ].map((f, i) => (
          <Card key={i} className="glass-card card-hover border-white/10 group">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <CardTitle className="text-white text-2xl font-bold">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-center text-lg leading-snug">
                {f.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto mb-24 w-full">
        <h2 className="text-4xl font-bold text-center text-white mb-12 drop-shadow-md">How Verivo Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { num: "1", title: "Community Onboarding", desc: "Anyone can join and start building their predictive track record." },
            { num: "2", title: "Submit Predictions", desc: "Locked records support verifiable data consistency." },
            { num: "3", title: "Event Closure", desc: "Outcomes are measured against documented datasets." },
            { num: "4", title: "Validation & Tracking", desc: "Reliability indicators evolve as more data points are validated." },
          ].map((step) => (
            <div key={step.num} className="glass-card p-8 rounded-3xl text-center hover-glow transition-all duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-purple-200 text-purple-700 flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl">
                {step.num}
              </div>
              <h3 className="font-bold text-white text-xl mb-4">{step.title}</h3>
              <p className="text-white/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Section */}
      <div className="max-w-7xl mx-auto mb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-10 rounded-3xl border-l-8 border-purple-400">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="font-black text-white text-2xl mb-4">Unalterable Data</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Once a contributor commits, it&apos;s etched in the platform records. No retrospective edits, emphasizing commitment to authentic data integrity.
            </p>
          </div>
          <div className="glass-card p-10 rounded-3xl border-l-8 border-pink-400">
            <div className="text-5xl mb-6">🔓</div>
            <h3 className="font-black text-white text-2xl mb-4">Accountable Disclosure</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Every outcome is public. We disclose validated data once events conclude, bridging the gap between talk and walk.
            </p>
          </div>
          <div className="glass-card p-10 rounded-3xl border-l-8 border-cyan-400">
            <div className="text-5xl mb-6">📊</div>
            <h3 className="font-black text-white text-2xl mb-4">Smart Metrics</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Our Verivo Score is a calculated framework for assessing predictive consistency. We track performance so you don&apos;t have to.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="text-white/40 text-sm leading-relaxed glass-card p-6 rounded-2xl border-white/5">
          <span className="font-bold block mb-2 text-white/60 uppercase tracking-widest text-xs">Disclaimer</span>
          Verivo is a platform for tracking prediction credibility and does not provide financial advice.
          We do not guarantee outcomes or specific results. Our mission is to promote transparency
          and accountability through verifiable, historical data.
        </p>
      </div>
    </div>
  )
}



