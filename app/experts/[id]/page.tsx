import Link from "next/link"
import { notFound } from "next/navigation"
import { getExpertProfile, getExpertPerformance } from "@/lib/actions/profile"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PredictionCard } from "@/components/prediction-card"
import { ShieldCheck, Trophy, Target, Activity, Clock, PieChart as PieIcon, ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return {
    title: `Verivo Expert #${resolvedParams.id.slice(0, 4)} | Credibility Profile`,
    description: `View the verified performance track record of User ${resolvedParams.id.slice(0, 4)} on Verivo.`,
  }
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams

  // 1. Fetch Profile Data (Stats) and Performance Breakdown parallelly
  const [profile, performance, predictions] = await Promise.all([
    getExpertProfile(id),
    getExpertPerformance(id),
    getPredictions({ userId: id, revealed: true }) // Only fetch verified/revealed
  ])

  if (!profile || !profile.stats) {
    // If user doesn't exist or has no stats, show 404 or empty state
    notFound()
  }

  const { stats } = profile
  const displayName = `User #${id.slice(0, 4)}`

  return (
    <div className="container py-12 max-w-5xl">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link href="/feed" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-900 border-2 border-white/10 flex items-center justify-center shadow-2xl flex-shrink-0">
          <span className="text-3xl md:text-5xl font-black text-white/20">
            {displayName.charAt(displayName.length - 1)}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white tracking-tighter">{displayName}</h1>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
            </Badge>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Started Contributing: 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>{stats.total_predictions} Total Inputs</span>
            </div>
          </div>
        </div>

        {/* Hero Score */}
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Verivo Score</div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
            {stats.verivo_score.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card className="glass-card border-white/10 bg-white/5">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Credible Accuracy</div>
            <div className="text-3xl font-bold text-white">{(stats.accuracy_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10 bg-white/5">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Win Rate (Raw)</div>
            <div className="text-3xl font-bold text-gray-300">
              {stats.accuracy_rate ? (stats.accuracy_rate * 100).toFixed(1) + '%' : 'N/A'}
              {/* Note: Simplified, assuming raw~credible loop for now if not separate in view */}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10 bg-white/5">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Correct Calls</div>
            <div className="text-3xl font-bold text-green-400">{stats.correct_predictions}</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10 bg-white/5">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Rank Tier</div>
            <div className="text-3xl font-bold text-purple-400">Top 10%</div>
            {/* Hardcoded for now, would come from rank query */}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Asset Class Breakdown */}
        <Card className="glass-card border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <PieIcon className="w-5 h-5 text-blue-400" /> Asset Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {performance.byAsset.length > 0 ? performance.byAsset.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500">{item.count} calls</span>
                    <span className="text-white font-mono font-bold">{item.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              )) : <div className="text-gray-500 italic text-sm">No asset data yet.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Timeframe Breakdown */}
        <Card className="glass-card border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-pink-400" /> Duration Mastery
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {performance.byTimeframe.length > 0 ? performance.byTimeframe.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.name === 'Long Term' ? 'bg-purple-500' : 'bg-pink-500'}`} />
                    <span className="text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500">{item.count} calls</span>
                    <span className="text-white font-mono font-bold">{item.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              )) : <div className="text-gray-500 italic text-sm">No duration data yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verified Feed */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-black text-white tracking-tight">VERIFIED RECORD</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-4">
          {predictions.length > 0 ? (
            predictions.map((p) => (
              // Reusing PredictionCard but ensuring logic handles read-only view cleanly
              // In a real 'Read Only' mode, we might disable clicking through or editing
              <div key={p.id} className="pointer-events-none">
                <PredictionCard prediction={p as any} showFull={true} />
              </div>
            ))
          ) : (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-gray-500">No verified history available for this user.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




