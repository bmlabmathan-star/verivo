import { getPredictions } from "@/lib/actions/predictions"
import { Card, CardContent } from "@/components/ui/card"
import { PredictionCard } from "@/components/prediction-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function PredictionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const predictions = await getPredictions()
  const prediction = predictions.find((p) => p.id === params.id)

  if (!prediction) {
    notFound()
  }

  const eventCloseTime = new Date(prediction.event_close_time)
  const now = new Date()
  const canValidate = user && now >= eventCloseTime && !prediction.is_revealed

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/feed">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>
        
        <PredictionCard prediction={prediction as any} showFull={prediction.is_revealed} />
        
        {canValidate && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <Link href={`/predictions/${params.id}/validate`}>
                <Button className="w-full">Validate This Prediction</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}



