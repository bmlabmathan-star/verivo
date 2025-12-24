import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentExpert } from "@/lib/actions/experts"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PredictionCard } from "@/components/prediction-card"

type CredibilityScore = {
  user_id: string
  duration_minutes: number | null
  total_predictions: number
  correct_predictions: number
  accuracy_percentage: number
  type: 'bucket' | 'overall'
}

const DURATION_BUCKETS = [5, 10, 30, 60]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const expert = await getCurrentExpert()
  // Updated filter param from expert_id to userId to match new action signature
  const predictions = await getPredictions({ userId: user.id })

  // Phase 4: Fetch credibility scores
  const { data: credibilityData } = await supabase
    .from('user_credibility_scores')
    .select('*')
    .eq('user_id', user.id)

  const scores = (credibilityData as unknown as CredibilityScore[]) || []
  const overallScore = scores.find((s) => s.type === 'overall')
  const bucketScores = scores
    .filter((s) => s.type === 'bucket')
    .sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0))

    .filter((s) => s.type === 'bucket')
    .sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0))

  const totalPredictionsCount = predictions.length
  const correctPredictionsCount = predictions.filter((p: any) => p.outcome === 'Correct').length
  const accuracyRate = overallScore?.accuracy_percentage || 0

  const stats = {
    total_predictions: totalPredictionsCount,
    correct_predictions: correctPredictionsCount,
    accuracy_rate: accuracyRate,
    verivo_score: accuracyRate,
  }

  const formatTime = (d: string) => {
    try {
      const date = new Date(d)
      const timeStr = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
        hour12: false
      }).format(date)
      const dateStr = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        timeZone: 'Europe/London'
      }).format(date)
      return `${timeStr} • ${dateStr} (UK)`
    } catch (e) { return "—" }
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
              {stats.accuracy_rate ? `${stats.accuracy_rate.toFixed(1)}%` : 'N/A'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{stats.verivo_score}</CardTitle>
            <div className="space-y-1">
              <p className="text-sm text-white/80">Verivo Score</p>
              <p className="text-xs text-white/60">Composite score based on verified accuracy and activity</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Phase 4: Credibility Scores Display */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Credibility & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {overallScore ? (
            <div className="mb-8">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">Calculated from verified predictions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-primary">{overallScore.accuracy_percentage}%</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
                  <p className="text-2xl font-bold">{overallScore.total_predictions}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Correct Predictions</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{overallScore.correct_predictions}</p>
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

          <div>
            <h3 className="text-lg font-semibold mb-3">Accuracy by Prediction Timeframe</h3>
            <div className="space-y-3">
              {DURATION_BUCKETS.map((duration) => {
                const score = bucketScores.find(s => s.duration_minutes === duration);
                const hasData = !!score;

                return (
                  <div
                    key={duration}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded text-sm">
                        {duration}m
                      </div>
                      <span className="text-sm text-muted-foreground">Duration</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-x-8 w-full sm:w-auto">
                      {hasData ? (
                        <>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Correct/Total</p>
                            <p className="font-mono font-medium">{score.correct_predictions}/{score.total_predictions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</p>
                            <p className={`text-lg font-bold ${score.accuracy_percentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                              {score.accuracy_percentage}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-sm text-muted-foreground italic">Insufficient data (minimum 10 predictions required)</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                const formatTime = (d: string) => {
                  try {
                    const date = new Date(d)
                    const timeStr = new Intl.DateTimeFormat('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Europe/London',
                      hour12: false
                    }).format(date)
                    const dateStr = new Intl.DateTimeFormat('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      timeZone: 'Europe/London'
                    }).format(date)
                    return `${timeStr} • ${dateStr} (UK)`
                  } catch (e) { return "—" }
                }

                const formatDuration = (mins: number | null | undefined) => {
                  if (!mins) return ""
                  if (mins >= 60) {
                    const hours = Math.floor(mins / 60)
                    return `${hours} hour${hours > 1 ? 's' : ''}`
                  }
                  return `${mins} min`
                }

                return (
                  <div key={prediction.id} className="space-y-2">
                    <PredictionCard
                      prediction={prediction as any}
                      showFull={prediction.is_revealed || !!prediction.outcome}
                    />
                    <div className="flex flex-col items-end gap-1 px-1">
                      <div className="flex items-center gap-2">
                        {prediction.duration_minutes && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {formatDuration(prediction.duration_minutes)}
                          </span>
                        )}
                        <div className="text-xs text-white/70 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                          <span className="text-white/40 mr-2">LOCKED</span>
                          {formatTime(prediction.created_at)}
                        </div>
                      </div>
                      {prediction.evaluation_time && (
                        <div className="text-xs text-green-400/90 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                          <span className="text-white/40 mr-2">EVALUATED</span>
                          {formatTime(prediction.evaluation_time)}
                        </div>
                      )}
                    </div>
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
