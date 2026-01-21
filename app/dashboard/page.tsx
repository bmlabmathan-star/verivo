import { redirect } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { getCurrentExpert } from "@/lib/actions/experts"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PredictionCard } from "@/components/prediction-card"
import { ShareScoreButton } from "@/components/share-score-button"
import { DownloadReportButton } from "@/components/download-report-button"

type VerivoScore = {
  user_id: string
  total_predictions: number
  correct_predictions: number
  accuracy_percentage: number
  verivo_score?: number
  confidence_factor?: number
}

// NOTE: DURATION_BUCKETS legacy code removed as new view aggregates per user

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // const expert = await getCurrentExpert() // unused for now? kept for consistency if needed later
  // Updated filter param from expert_id to userId to match new action signature
  const predictions = await getPredictions({ userId: user.id })

  // Fetch expert details for the report (name, username)
  const expertProfile = await getCurrentExpert()

  // Phase 4: Fetch Credibility Scores (New View)
  // Phase 4: Fetch Credibility Scores (New Views)
  // We fetch from specialized views for Verivo Score and Confidence Factor
  // while keeping the main stats from user_credibility_scores
  const [
    { data: credibilityData },
    { data: scoreData },
    { data: confidenceData }
  ] = await Promise.all([
    supabase
      .from('user_credibility_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'overall') // Filter to get the overall score row
      .single(),
    supabase
      .from('user_verivo_scores')
      .select('verivo_score')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_confidence_factor')
      .select('confidence_factor')
      .eq('user_id', user.id)
      .single()
  ])

  const scores = credibilityData

  // Extract values from specialized views
  const verivoScoreVal = scoreData?.verivo_score || 0
  const confidenceFactorVal = confidenceData?.confidence_factor || 0

  // Format stats for display
  const accuracyPercentage = scores?.accuracy_percentage?.toFixed(1) || "0.0"
  const verivoScoreDisplay = verivoScoreVal.toFixed(2)

  const stats = {
    total_predictions: scores?.total_predictions || 0,
    correct_predictions: scores?.correct_predictions || 0,
    accuracy_display: `${accuracyPercentage}%`,
    verivo_score: verivoScoreDisplay,
    // Calculate raw accuracy for display logic if not present in view
    raw_accuracy: (scores?.total_predictions && scores?.total_predictions > 0)
      ? (scores.correct_predictions / scores.total_predictions)
      : 0,
    // Use the explicitly fetched confidence factor
    confidence_factor: confidenceFactorVal
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8 dashboard-header-bg p-8 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <Image
            src="/branding/verivo-logo-light.png"
            alt="Verivo Dashboard"
            width={360}
            height={108}
            className="h-32 w-auto object-contain mb-4"
            priority
          />
          <p className="text-white/60">Manage your predictive portfolio.</p>
        </div>
        <div className="relative z-10">
          <Link href="/predictions/create">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-900/20 supports-[backdrop-filter]:bg-purple-600/20 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:border supports-[backdrop-filter]:border-purple-500/50">
              + Create Forecast
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{stats.total_predictions}</CardTitle>
            <p className="text-sm text-gray-400">Forecasts Made</p>
          </CardHeader>
        </Card>
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{stats.correct_predictions}</CardTitle>
            <p className="text-sm text-gray-400">Correct Forecasts</p>
          </CardHeader>
        </Card>
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              {stats.accuracy_display}
            </CardTitle>
            <p className="text-sm text-gray-400">Credible Accuracy</p>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl text-white">{stats.verivo_score}</CardTitle>
              <ShareScoreButton
                stats={{
                  verivoScore: stats.verivo_score,
                  accuracy: accuracyPercentage, // Pass the raw string e.g. "38.3"
                  totalPredictions: stats.total_predictions,
                  confidenceFactor: stats.confidence_factor
                }}
                profileUrl={`https://verivo.app/experts/${user.id}`}
              />
            </div>
            <div className="space-y-1 mt-1">
              <p className="text-sm text-white/80">Verivo Score</p>
              <p className="text-xs text-white/60">Composite score based on verified accuracy and difficulty</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Performance Detail Card */}
      <Card className="mb-8 glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Your Credibility & Performance</CardTitle>
          <DownloadReportButton
            userData={{
              userId: user.id,
              name: expertProfile?.name || null,
              username: expertProfile?.username || null,
              verivoScore: verivoScoreVal,
              accuracy: parseFloat(accuracyPercentage),
              confidenceFactor: confidenceFactorVal,
              totalPredictions: stats.total_predictions,
              correctPredictions: stats.correct_predictions
            }}
            predictions={predictions}
          />
        </CardHeader>
        <CardContent>
          {scores ? (
            <div className="mb-8">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">Calculated from verified forecasts using Verivo Score v1.0</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-1">Credible Accuracy</p>
                  <p className="text-3xl font-bold text-primary">{accuracyPercentage}%</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-1">Raw Accuracy (Win Rate)</p>
                  {/* raw_accuracy is decimal, e.g. 0.85 -> 85% */}
                  <p className="text-2xl font-bold text-gray-300">
                    {stats.raw_accuracy ? (stats.raw_accuracy * 100).toFixed(1) + '%' : '0%'}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-1">Confidence Factor</p>
                  {/* confidence_factor is average weight e.g. 0.65 */}
                  <p className="text-2xl font-bold text-gray-300">
                    {stats.confidence_factor?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">Calculated from verified forecasts</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center border-dashed border-2">
                <p className="text-sm text-muted-foreground">Insufficient data to calculate overall performance (minimum 10 forecasts required)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Verivo Score Works */}
      <Card className="mb-8 border-purple-500/20 bg-gradient-to-br from-purple-900/5 to-black/50">
        <CardHeader>
          <CardTitle>How Verivo Score Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-300 leading-relaxed">
              Verivo doesn't just measure if you are right or wrong—it measures how <strong>difficult</strong> your forecast was.
              We operate on a simple principle: <span className="text-white font-medium">Longer timeframes require more skill and carry more weight.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weight Table */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-white">Timeframe Weights</h4>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left font-medium text-gray-300">Duration</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-300">Weight Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="px-4 py-2 text-gray-300">5 Minutes</td>
                      <td className="px-4 py-2 text-right text-gray-300">0.1x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-300">10 Minutes</td>
                      <td className="px-4 py-2 text-right text-gray-300">0.2x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-300">30 Minutes</td>
                      <td className="px-4 py-2 text-right text-gray-300">0.5x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-300">1 Hour</td>
                      <td className="px-4 py-2 text-right text-gray-300">0.8x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-blue-300">Opening Forecast</td>
                      <td className="px-4 py-2 text-right font-semibold text-blue-300">0.9x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-purple-400">3 Hours+</td>
                      <td className="px-4 py-2 text-right font-bold text-purple-400">1.0x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example */}
            <div className="bg-slate-900/40 rounded-lg p-5 border border-dashed border-white/20 flex flex-col justify-center">
              <h4 className="text-sm font-semibold mb-2 text-white">Why this matters</h4>
              <p className="text-sm text-gray-400 mb-4">
                Imagine two users calculate the same move:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-mono h-fit">User A</span>
                  <span className="text-gray-400">Predicts a 5-minute swing. Correct outcome gets <strong className="text-white">0.1 points</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-mono h-fit">User B</span>
                  <span className="text-gray-400">Predicts a 3-hour trend. Correct outcome gets <strong className="text-white">1.0 point</strong>.</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-gray-500 italic border-t border-white/10 pt-3">
                "User B is rewarded 10x more because sustaining accuracy over hours is significantly harder than minutes."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Forecasts */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>My Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No forecasts yet. Create your first forecast!
            </p>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction: any) => {
                return (
                  <div key={prediction.id} className="space-y-2">
                    <PredictionCard
                      prediction={prediction as any}
                      showFull={prediction.is_revealed || !!prediction.outcome}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
