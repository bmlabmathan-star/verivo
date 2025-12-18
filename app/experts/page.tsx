import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExpertsPage() {
  return (
    <div className="container py-12 max-w-6xl">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          CONTRIBUTORS
        </h1>
        <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
          The Verivo credibility model: where performance outweighs titles and data speaks louder than credentials.
        </p>
      </div>

      <div className="glass-card p-10 rounded-3xl mb-16 border-l-8 border-cyan-500">
        <h2 className="text-2xl font-bold text-white mb-4">Earned Credibility</h2>
        <p className="text-white/70 leading-relaxed text-lg">
          On Verivo, "Expertise" is not a granted status—it is a calculated metric derived from historical performance.
          Our contributor model allows anyone to build a track record. Over time, the platform identifies the most consistent
          analytical minds through rigorous data validation across all domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            id: "Analyst #102",
            focus: "Macro-Finance",
            trackRecord: "84% Consistency",
            initials: "A",
            color: "from-purple-500 to-pink-600"
          },
          {
            id: "Predictor #49",
            focus: "Emerging Tech",
            trackRecord: "72% Accuracy",
            initials: "P",
            color: "from-blue-500 to-cyan-600"
          },
          {
            id: "Strategist #21",
            focus: "Global Sports",
            trackRecord: "Pending Validation",
            initials: "S",
            color: "from-green-500 to-emerald-600"
          }
        ].map((profile, i) => (
          <Card key={i} className="glass-card card-hover h-full border-white/10 overflow-hidden relative group">
            <CardHeader>
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${profile.color} text-white flex items-center justify-center text-3xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {profile.initials}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all duration-300">{profile.id}</h3>
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Status: Active</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Primary Focus</div>
                  <div className="text-lg font-bold text-white/90">{profile.focus}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Track Record</div>
                  <div className="text-xl font-black text-white">{profile.trackRecord}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-white/40 text-sm italic">
          Profile data shown above is for conceptual illustration of the contributor model.
          Registration and track-record building will be enabled in the next protocol update.
        </p>
      </div>
    </div>
  )
}
