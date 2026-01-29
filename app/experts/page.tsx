"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/follow-button"
import { createClient } from "@/lib/supabase/client"
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

export default function ExpertsPage() {
  const [experts, setExperts] = useState<any[]>([])
  const [followedIds, setFollowedIds] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        // Fetch experts with predictions (Left Join to populate all, then filter)
        // Using 'experts' table per codebase convention.
        const { data: expertsData, error: expertsError } = await supabase
          .from("experts")
          .select(`
            id,
            username,
            name,
            predictions (
              id
            ),
            expert_stats (
              total_predictions,
              verivo_score
            )
          `)

        if (expertsError) {
          console.error("Error fetching experts:", expertsError)
        }

        // Process experts
        const expertList = (expertsData || []).map((expert: any) => {
          // Count predictions from the array (Left Join returns array of objects)
          const count = expert.predictions?.length || 0

          return {
            ...expert,
            computed_prediction_count: count
          }
        })
          // Filter: Expert = user with >= 1 prediction
          .filter((e: any) => e.computed_prediction_count > 0)
          // Sort by prediction count DESC
          .sort((a: any, b: any) => b.computed_prediction_count - a.computed_prediction_count)

        setExperts(expertList)

        // Fetch followed IDs only if user is logged in
        if (user) {
          const { data: followData, error: followError } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)

          if (!followError && followData) {
            setFollowedIds(followData.map((f: any) => f.following_id))
          }
        }
      } catch (error) {
        console.error("Unexpected error in ExpertsPage:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container py-12 max-w-6xl text-center text-white">
        <div className="animate-pulse">Loading contributors...</div>
      </div>
    )
  }

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
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 px-6">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-white mb-2">Discovery Begins Here</h3>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Expertise on Verivo is earned, not given. Be the first to start building a verified track record, or invite others to contribute.
          </p>
          <Link href="/predictions/create">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              Start Contributing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experts.map((expert: any) => {
            const stats = expert.expert_stats?.[0] || {}
            const rawScore = stats.verivo_score || 0
            const scoreDisplay = rawScore > 0 ? rawScore.toFixed(2) : "New"
            const scoreLabel = rawScore > 0 ? "Verivo Score" : "Status"
            const totalForecasts = expert.computed_prediction_count || stats.total_predictions || 0

            const name = expert.username || expert.name || "Contributor"
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
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                        {totalForecasts > 0 ? "Active Contributor" : "New Member"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">{scoreLabel}</div>
                        <div className={`text-lg font-bold ${rawScore > 0 ? "text-white/90" : "text-purple-300"}`}>
                          {scoreDisplay}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Forecasts</div>
                        <div className="text-lg font-bold text-white/90">{totalForecasts}</div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <FollowButton
                        expertId={expert.id}
                        initialIsFollowing={followedIds.includes(expert.id)}
                        isOwnProfile={currentUserId === expert.id}
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
