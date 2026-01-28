
import { Card, CardContent } from "@/components/ui/card"
import { getExperts } from "@/lib/actions/experts"
import { getFollowedUserIds } from "@/lib/actions/follow"
import { FollowButton } from "@/components/follow-button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

const getStatus = (score: number) => {
  if (score >= 90) return "Top Tier"
  if (score >= 80) return "Elite"
  if (score >= 70) return "Consistent"
  if (score >= 50) return "Ranking"
  return "New"
}

// Helper to generate a consistent color based on string
const getAvatarColor = (str: string) => {
  const colors = [
    "from-yellow-500 to-orange-600",
    "from-purple-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-green-600",
    "from-red-500 to-rose-600",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const experts = await getExperts()
  const followedIds = await getFollowedUserIds()

  const rankedExperts = experts.map((e: any, i: number) => {
    const stats = e.expert_stats?.[0] || {}
    const score = stats.verivo_score || 0
    return {
      ...e,
      rank: i + 1,
      score,
      status: getStatus(score),
      displayName: e.username || `User #${e.id.slice(0, 4)}`,
      initials: (e.username?.[0] || "#").toUpperCase()
    }
  }).sort((a: any, b: any) => b.score - a.score) // Ensure sorted by score if query didn't

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

      {/* Leaderboard List */}
      <div className="space-y-4 mb-16">
        {rankedExperts.length === 0 ? (
          <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-gray-500">No ranked contributors yet.</p>
          </div>
        ) : (
          rankedExperts.map((expert: any) => (
            <Card key={expert.id} className="glass-card card-hover border-white/10 group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                  <div className="text-4xl font-black text-white/20 w-12 group-hover:text-white/40 transition-colors text-center sm:text-left">
                    #{expert.rank}
                  </div>

                  <Link href={`/experts/${expert.id}`}>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarColor(expert.displayName)} text-white flex items-center justify-center text-2xl font-black shadow-lg mx-auto sm:mx-0`}>
                      {expert.initials}
                    </div>
                  </Link>

                  <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                    <Link href={`/experts/${expert.id}`}>
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                        {expert.displayName}
                      </h3>
                    </Link>
                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Status: {expert.status}</div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right pr-4">
                      <div className="text-3xl font-black text-white group-hover:text-yellow-400 transition-all">
                        {expert.score.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Verivo Score</div>
                    </div>
                    <div className="scale-90 flex-shrink-0">
                      <FollowButton
                        expertId={expert.id}
                        initialIsFollowing={followedIds.includes(expert.id)}
                        isOwnProfile={user?.id === expert.id}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Disclaimer Section */}
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>⚠️</span> Informational Disclaimer
        </h3>
        <p className="text-xs text-white/40 leading-relaxed">
          The rankings presented above are calculated via unalterable platform data
          and do not constitute a financial endorsement or professional recommendation. Verivo serves as a transparency
          protocol for historical data tracking.
        </p>
      </div>
    </div>
  )
}
