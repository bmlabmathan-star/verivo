import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentExpert } from "@/lib/actions/experts"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PredictionCard } from "@/components/prediction-card"

type VerivoScore = {
  user_id: string
  total_predictions: number
  correct_predictions: number
  raw_accuracy: number
  weighted_accuracy: number
  confidence_factor: number
  credible_accuracy: number
  verivo_score: number
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

  // Phase 4: Fetch Verivo Scores (New View)
  const { data: verivoData } = await supabase
    .from('user_verivo_scores')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const scores = verivoData as unknown as VerivoScore | null

  // No client-side calculation needed. Trust the server view.

  // Format stats for display
  // Credible Accuracy -> Accuracy % (User facing)
  const accuracyAbs = scores?.credible_accuracy || 0
  const accuracyPercentage = (accuracyAbs * 100).toFixed(1)

  // Verivo Score -> Verivo Score
  const verivoScoreDisplay = scores?.verivo_score?.toFixed(2) || "0.00"

  const stats = {
    total_predictions: scores?.total_predictions || 0,
    correct_predictions: scores?.correct_predictions || 0,
    accuracy_display: `${accuracyPercentage}%`,
    verivo_score: verivoScoreDisplay,
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Expert Dashboard</h1>
        <Link href="/predictions/create">
          <Button>+ Create Prediction</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{stats.total_predictions}</CardTitle>
            <p className="text-sm text-muted-foreground">Predictions Made</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{stats.correct_predictions}</CardTitle>
            <p className="text-sm text-muted-foreground">Correct Predictions</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {stats.accuracy_display}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Credible Accuracy</p>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{stats.verivo_score}</CardTitle>
            <div className="space-y-1">
              <p className="text-sm text-white/80">Verivo Score</p>
              <p className="text-xs text-white/60">Composite score based on verified accuracy and difficulty</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Performance Detail Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Credibility & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {scores ? (
            <div className="mb-8">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">Calculated from verified predictions using Verivo Score v1.0</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Credible Accuracy</p>
                  <p className="text-3xl font-bold text-primary">{accuracyPercentage}%</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Raw Accuracy (Win Rate)</p>
                  {/* raw_accuracy is decimal, e.g. 0.85 -> 85% */}
                  <p className="text-2xl font-bold text-muted-foreground">
                    {scores.raw_accuracy ? (scores.raw_accuracy * 100).toFixed(1) + '%' : '0%'}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Confidence Factor</p>
                  {/* confidence_factor is average weight e.g. 0.65 */}
                  <p className="text-2xl font-bold text-muted-foreground">
                    {scores.confidence_factor?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">Calculated from verified predictions</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center border-dashed border-2">
                <p className="text-sm text-muted-foreground">Insufficient data to calculate overall performance (minimum 10 predictions required)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>My Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No predictions yet. Create your first prediction!
            </p>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => {
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
