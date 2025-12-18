import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeedPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
          INTEL FEED
        </h1>
        <p className="text-xl text-white/80 font-medium">
          The chronological ledger of commitment and revelation.
        </p>
      </div>

      <div className="glass-card p-10 rounded-3xl mb-12 border-l-8 border-pink-500">
        <h2 className="text-2xl font-bold text-white mb-4">Feed Protocol: Locked vs. Revealed</h2>
        <p className="text-white/70 leading-relaxed">
          The Verivo Feed tracks the lifecycle of every prediction.
          <span className="text-white font-bold mx-1">Locked</span> entries represent active commitments where the outcome is yet to be determined.
          <span className="text-white font-bold mx-1">Revealed</span> entries are validated records where the predicted outcome has been compared against primary market or event data.
        </p>
      </div>

      {/* Static Timeline Feed */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
        {[
          {
            time: "JUST NOW",
            status: "Locked",
            title: "US Federal Reserve Interest Rate Decision",
            contributor: "Contributor #842",
            domain: "Finance",
            color: "text-yellow-400",
            icon: "🔒"
          },
          {
            time: "2 HOURS AGO",
            status: "Revealed",
            title: "NVIDIA (NVDA) Q4 Performance Forecast",
            contributor: "Contributor #102",
            domain: "Finance",
            result: "Validated vs Market Data",
            color: "text-green-400",
            icon: "✅"
          },
          {
            time: "YESTERDAY",
            status: "Locked",
            title: "2026 Global Tech Index Forecast",
            contributor: "Contributor #119",
            domain: "Public Events",
            color: "text-yellow-400",
            icon: "🔒"
          }
        ].map((item, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background text-white shadow absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>

            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border-white/10 group-hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black tracking-widest uppercase ${item.color}`}>{item.status}</span>
                <span className="text-[10px] text-white/40 font-mono">{item.time}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Contributor</div>
                  <div className="text-sm font-medium text-white/80">{item.contributor}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Domain</div>
                  <div className="text-sm font-medium text-white/80">{item.domain}</div>
                </div>
              </div>
              {item.result && (
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-mono text-green-400/80">
                  {item.result}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 glass-card rounded-2xl border border-white/5 text-center bg-white/5 italic text-white/40 text-sm">
        Entries shown above are conceptual system examples designed to demonstrate the feed protocol.
        Live data streaming will be enabled in a future release.
      </div>
    </div>
  )
}
