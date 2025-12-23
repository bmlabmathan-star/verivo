import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentExpert } from "@/lib/actions/experts"
import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PredictionCard } from "@/components/prediction-card"

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

  const stats = expert?.expert_stats?.[0] || {
    total_predictions: 0,
    correct_predictions: 0,
    accuracy_rate: 0,
    verivo_score: 0,
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
            <p className="text-sm text-white/80">Verivo Score</p>
          </CardHeader>
        </Card>
      </div>

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
              {predictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction as any}
                  showFull={prediction.is_revealed || !!prediction.outcome}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
