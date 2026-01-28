
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getExperts } from "@/lib/actions/experts"
import { getFollowedUserIds } from "@/lib/actions/follow"
import { FollowButton } from "@/components/follow-button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

// Helper to generate a consistent color based on string
const getAvatarColor = (str: string) => {
  const colors = [
    "from-purple-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-600",
    "from-indigo-500 to-purple-600",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default async function ExpertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const experts = await getExperts()
  const followedIds = await getFollowedUserIds()

  // Filter out the current user from the list if desired, or keep them to show your own card
  // Usually lists show everyone.

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
          On Verivo, &quot;Expertise&quot; is not a granted status—it is a calculated metric derived from historical performance.
          Our contributor model allows anyone to build a track record. Over time, the platform identifies the most consistent
          analytical minds through rigorous data validation across all domains.
        </p>
      </div>

      {experts.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-gray-400">No active contributors found. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experts.map((expert: any) => {
            const stats = expert.expert_stats?.[0] || {}
            const accuracy = stats.accuracy_rate ? (stats.accuracy_rate * 100).toFixed(0) + "%" : "N/A"
            const score = stats.verivo_score ? stats.verivo_score.toFixed(2) : "0.00"
            const name = expert.username || "Contributor"
            const initials = name.slice(0, 1).toUpperCase()
            const color = getAvatarColor(name)

            return (
              <Card key={expert.id} className="glass-card card-hover h-full border-white/10 overflow-hidden relative group">
                <CardHeader>
                  <div className="flex items-center gap-6">
                    <Link href={`/experts/${expert.id}`}>
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-3xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {initials}
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/experts/${expert.id}`}>
                        <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all duration-300 truncate">
                          {name}
                        </h3>
                      </Link>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Status: Active</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Verivo Score</div>
                        <div className="text-lg font-bold text-white/90">{score}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Accuracy</div>
                        <div className="text-lg font-bold text-white/90">{accuracy}</div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <FollowButton
                        expertId={expert.id}
                        initialIsFollowing={followedIds.includes(expert.id)}
                        isOwnProfile={user?.id === expert.id}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
