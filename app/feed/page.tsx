import Link from "next/link"
import { getVerifiedFeed, getTopPerformers } from "@/lib/actions/feed"
import { getFollowedUserIds } from "@/lib/actions/follow"
import { FollowButton } from "@/components/follow-button"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Filter, ListFilter, Trophy, LogIn } from "lucide-react"

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const resolvedParams = await searchParams; // Awaiting the promise
  const filter = resolvedParams.filter || "All"
  const sort = resolvedParams.sort || "recency"

  const feedItems = await getVerifiedFeed({ filter, sort })
  const topPerformers = await getTopPerformers()
  const followedIds = await getFollowedUserIds()

  const formatUser = (id: string) => `User #${id.slice(0, 4)}`

  // ... (date formatting remains same)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  // ... (difficulty helper remains same)
  const getDifficulty = (mins: number) => {
    if (mins < 30) return { label: "Short Term", color: "bg-blue-500/20 text-blue-300" }
    if (mins < 180) return { label: "Medium Term", color: "bg-purple-500/20 text-purple-300" }
    return { label: "Long Term", color: "bg-pink-500/20 text-pink-300" }
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
          VERIFIED FEED
        </h1>
        <p className="text-gray-400 font-medium max-w-2xl">
          The immutable ledger of validated predictions. Filtering noise from signal.
        </p>
      </div>

      {/* Sign In Banner (Only for guests) */}
      {!user && (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Join the Protocol</h3>
            <p className="text-purple-200/80 text-sm max-w-lg">
              Unlock your own credibility score. Sign in to start building your verified track record on the blockchain of truth.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Link href="/login">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-bold px-8">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Contribute
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Top Performers Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Top Credibility Scores</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {topPerformers.length > 0 ? (
            topPerformers.map((user: any, i: number) => (
              <div
                key={user.user_id}
                className="flex-shrink-0 w-64 glass-card p-4 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-all cursor-default"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-700" : "bg-white/10"
                    }`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{formatUser(user.user_id)}</div>
                    <div className="text-xs text-gray-400">{user.total_predictions} verified forecasts</div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-3">
                  <div className="text-xs text-gray-500 uppercase font-bold">Verivo Score</div>
                  <div className="text-xl font-black text-white">{user.verivo_score?.toFixed(2) || "0.00"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
              No ranked performers data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["All", "Crypto", "Stocks", "Forex", "Commodities", "Indices"].map((f) => (
            <Link key={f} href={`/feed?filter=${f}&sort=${sort}`} scroll={false}>
              <Badge
                variant="outline"
                className={`cursor-pointer px-4 py-2 text-sm border-white/10 ${filter === f
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {f}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Sort Dropdown simulated with links for simplicity in server component */}
        <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg p-1 border border-white/10">
          <span className="px-2 text-gray-500 text-xs uppercase font-bold">Sort By</span>
          <Link
            href={`/feed?filter=${filter}&sort=recency`}
            className={`px-3 py-1 rounded-md transition-colors ${sort === 'recency' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Recency
          </Link>
          <Link
            href={`/feed?filter=${filter}&sort=timeframe`}
            className={`px-3 py-1 rounded-md transition-colors ${sort === 'timeframe' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Duration
          </Link>
        </div>
      </div>

      {/* Main Feed Grid */}
      <div className="grid grid-cols-1 gap-4">
        {feedItems.length > 0 ? (
          feedItems.map((item: any) => {
            const isCorrect = item.outcome === "Correct"
            const difficulty = getDifficulty(item.duration_minutes || 0)

            return (
              <Card key={item.id} className="glass-card border-white/10 overflow-hidden group hover:border-white/20 transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row p-5 gap-6">
                    {/* Status Column */}
                    <div className="flex items-start md:items-center min-w-[100px]">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isCorrect
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-500 mb-2">
                        <span className="font-mono text-purple-400 uppercase tracking-wider">{item.category}</span>
                        <span>•</span>
                        <span>{formatDate(item.evaluation_time)}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded ${difficulty.color} text-[10px] uppercase font-bold`}>
                          {difficulty.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                        {item.title}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white/5 rounded-lg p-3 border border-white/5">
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Asset</p>
                          <p className="text-gray-300 font-medium">{item.asset_name || item.globalIdentifier || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Direction</p>
                          <p className={`font-medium flex items-center gap-1 ${item.direction === 'Up' ? 'text-green-400' : 'text-red-400'}`}>
                            {item.direction === 'Up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {item.direction}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Reference Price</p>
                          <p className="text-gray-300 font-mono">{item.reference_price?.toFixed(2) || "---"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Final Price</p>
                          <p className="text-gray-300 font-mono">{item.final_price?.toFixed(2) || "---"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score Impact Column */}
                    <div className="md:border-l border-white/10 md:pl-6 flex flex-col justify-center min-w-[140px]">
                      <div className="mb-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Writer</p>
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-white font-medium">{formatUser(item.user_id)}</p>
                          <div className="scale-90 origin-left">
                            <FollowButton
                              expertId={item.user_id}
                              initialIsFollowing={followedIds.includes(item.user_id)}
                              isOwnProfile={user?.id === item.user_id}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Score Impact</p>
                        <p className={`text-2xl font-black ${isCorrect ? "text-white" : "text-gray-600"}`}>
                          {isCorrect ? "+" : ""}{isCorrect ? (item.duration_minutes ? (0.1).toFixed(2) : "0.00") : "0.00"}
                          {/* Note: Simplified score display. Ideally fetch stored score delta */}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Verified Forecasts Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              There are no forecasts that match your current filters. Try adjusting the category or check back later once more predictions are verified.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-16 pt-8 border-t border-white/10 text-center">
        <p className="text-gray-500 text-xs max-w-3xl mx-auto leading-relaxed italic">
          Disclaimer: This feed represents a historical record of verified user predictions on the Verivo protocol.
          It does not constitute financial advice, signals, or recommendations to buy or sell any asset.
          Past performance of any contributor is not indicative of future results.
        </p>
      </div>
    </div>
  )
}

