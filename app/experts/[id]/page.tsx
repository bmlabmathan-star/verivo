import Link from "next/link"
import { notFound } from "next/navigation"
import { getExpertProfile, getExpertPerformance } from "@/lib/actions/profile"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PredictionCard } from "@/components/prediction-card"
import { ShieldCheck, Target, Activity, Clock, PieChart as PieIcon, ArrowLeft, BarChart2, Info } from "lucide-react"

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
        {/* Area Fill (Optional, keeping minimal) */}
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

  const [profile, performance, predictions] = await Promise.all([
    getExpertProfile(id),
    getExpertPerformance(id),
    getPredictions({ userId: id, revealed: true })
  ])

  if (!profile || !profile.stats) {
    notFound()
  }

  const { stats } = profile
  const displayName = `Contributor #${id.slice(0, 4)}`

  return (
    <div className="container py-12 max-w-5xl">
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
      </div >
    </div >
  )
}




