"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/follow-button"

// Helper for avatar colors
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
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [followedIds, setFollowedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        console.log("Fetching experts...")

        // 1. Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setCurrentUserId(user?.id ?? null)

        // 2. Fetch profiles with predictions (inner join)
        const { data, error } = await supabase
          .from("profiles")
          .select(`
          id,
          username,
          avatar_url,
          predictions!inner(id)
        `)

        if (error) {
          console.error("Supabase error:", error)
          return
        }

        console.log("Raw data:", data)

        // 3. Normalize data → ADD prediction_count
        const experts =
          data?.map((p) => ({
            id: p.id,
            username: p.username,
            avatar_url: p.avatar_url,
            prediction_count: p.predictions?.length ?? 0,
          })) ?? []

        // 4. Safety filter (extra protection)
        const filteredExperts = experts.filter(
          (e) => e.prediction_count > 0
        )

        // Sort by prediction count descending
        filteredExperts.sort((a, b) => b.prediction_count - a.prediction_count)

        console.log("Final experts:", filteredExperts)

        setExperts(filteredExperts)

        // 5. Fetch Follows if user exists
        if (user) {
          const { data: followData } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)

          if (followData) {
            setFollowedIds(followData.map((f: any) => f.following_id))
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [])


  // Loading State
  if (loading) {
    return (
      <div className="container py-12 max-w-6xl text-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/10 rounded"></div>
        </div>
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
        // Empty State - Only shown when not loading and 0 experts
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
        // Experts List
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experts.map((expert) => {
            const name = expert.username || "Contributor"
            const initials = name.slice(0, 1).toUpperCase()
            const color = getAvatarColor(name)
            const isOwnProfile = currentUserId === expert.id

            return (
              <Card key={expert.id} className="glass-card card-hover h-full border-white/10 overflow-hidden relative group">
                <CardHeader>
                  <div className="flex items-center gap-6">
                    <Link href={`/experts/${expert.id}`}>
                      {expert.avatar_url ? (
                        <img
                          src={expert.avatar_url}
                          alt={name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-3xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {initials}
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/experts/${expert.id}`}>
                        <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all duration-300 truncate">
                          {name}
                        </h3>
                      </Link>
                      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                        Active Contributor
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Status</div>
                        <div className="text-lg font-bold text-white/90">
                          Active
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Forecasts</div>
                        <div className="text-lg font-bold text-white/90">{expert.prediction_count}</div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <FollowButton
                        expertId={expert.id}
                        initialIsFollowing={followedIds.includes(expert.id)}
                        isOwnProfile={isOwnProfile}
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
