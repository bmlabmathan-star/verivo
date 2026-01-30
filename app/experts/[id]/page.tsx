import Link from "next/link"
import { notFound } from "next/navigation"
import { getExpertProfile, getExpertPerformance } from "@/lib/actions/profile"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PredictionCard } from "@/components/prediction-card"
import { FollowButton } from "@/components/follow-button"
import { getFollowStatus, getFollowerCount } from "@/lib/actions/follow"
import { ShieldCheck, Target, Activity, Clock, PieChart as PieIcon, ArrowLeft, BarChart2, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return {
    title: `Verivo Profile | User #${resolvedParams.id.slice(0, 4)}`,
    description: `Verified performance metrics and credibility score for User ${resolvedParams.id.slice(0, 4)}.`,
  }
}

// Simple SVG Line Chart Component
function ScoreChart({ data }: { data: { date: string, score: number }[] }) {
  if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-xs text-gray-500">Insufficient data for graph</div>

  const height = 120
  const width = 600
  const padding = 10

  const maxScore = Math.max(...data.map(d => d.score), 10)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - (padding * 2)) + padding
    const y = height - ((d.score / maxScore) * (height - (padding * 2))) - padding
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="w-full h-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
        {/* Gradient Defs */}
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Line */}
        <polyline
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, performance, predictions, isFollowing, followerCount] = await Promise.all([
    getExpertProfile(id),
    getExpertPerformance(id),
    getPredictions({ userId: id, revealed: true }),
    getFollowStatus(id),
    getFollowerCount(id)
  ])

  if (!profile || !profile.stats) {
    notFound()
  }

  const { stats } = profile
  const displayName = `Contributor #${id.slice(0, 4)}`

  return (
    <div className="container py-12 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/feed" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
          <ArrowLeft className="w-3 h-3" /> Back to Intel Feed
        </Link>
      </div>

      {/* 1. Header Section: Identity & Primary Score */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 expert-banner-bg p-8 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-10 h-10 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{displayName}</h1>
            </div>
            <p className="text-gray-300 text-sm max-w-md font-medium text-shadow-sm flex items-center gap-3">
              <span>Member since 2024</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <span className="text-white font-bold">{followerCount} Followers</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 relative z-10 mt-6 md:mt-0">
          <FollowButton expertId={id} initialIsFollowing={isFollowing} isOwnProfile={profile.id === user?.id} />
          <div className="text-right">
            <div className="text-[10px] text-purple-200 uppercase font-black tracking-widest mb-1 opacity-80">Verivo Credibility Score</div>
            <div className="text-6xl font-black text-white tracking-tighter drop-shadow-xl flex items-center gap-2 justify-end">
              {stats.verivo_score.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400 font-bold uppercase">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-white">{(stats.accuracy_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400 font-bold uppercase">Forecasts</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_predictions}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-bold uppercase">Correct</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.correct_predictions}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400 font-bold uppercase">Conf. Factor</span>
            </div>
            <div className="text-2xl font-bold text-white">{(performance.confidenceFactor || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Deep Dive Section: Graph & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Main Column: Graph */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/10 h-80">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm uppercase tracking-widest text-gray-400 font-bold flex items-center justify-between">
                <span>Credibility Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)] p-6">
              <ScoreChart data={performance.scoreHistory} />
            </CardContent>
          </Card>

          {/* Recent Feed */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/50" /> verified record
            </h3>
            <div className="space-y-3">
              {predictions.length > 0 ? (
                predictions.slice(0, 5).map((p) => (
                  <div key={p.id} className="pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
                    <PredictionCard prediction={p as any} showFull={true} />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-gray-500 text-sm">No verified data points available.</p>
                </div>
              )}
              {predictions.length > 5 && (
                <div className="text-center pt-4">
                  <span className="text-xs text-gray-500">Showing recent 5 of {predictions.length} verified items</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Breakdowns */}
        <div className="space-y-6">
          {/* Assets */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieIcon className="w-4 h-4" /> Asset Discipline
            </h4>
            <div className="space-y-4">
              {performance.byAsset.map((item: any) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${item.accuracy}%` }} />
                    </div>
                    <span className="font-mono text-white text-xs">{item.accuracy.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
              {performance.byAsset.length === 0 && <p className="text-gray-600 italic text-xs">No data.</p>}
            </div>
          </div>

          {/* Timeframe */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeframe Mastery
            </h4>
            <div className="space-y-4">
              {performance.byTimeframe.map((item: any) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${item.accuracy}%` }} />
                    </div>
                    <span className="font-mono text-white text-xs">{item.accuracy.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
              {performance.byTimeframe.length === 0 && <p className="text-gray-600 italic text-xs">No data.</p>}
            </div>
          </div>

          {/* Static Methodology */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Methodology</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
              Scores are calculated using a weighted average of validated outcomes. Longer timeframes carry higher weights (Confidence Factor).
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Scalp</span> <span>0.1x</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Short</span> <span>0.5x</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Swing</span> <span>0.8x</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Long</span> <span>1.0x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
