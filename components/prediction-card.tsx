import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import { Database } from "@/types/database.types"

type Prediction = Database['public']['Tables']['predictions']['Row'] & {
  experts?: { name: string; username: string } | null
  validations?: Array<{
    actual_value: number | null
    is_correct: boolean | null
    validated_at: string
  }> | null
}

interface PredictionCardProps {
  prediction: Prediction
  showFull?: boolean
}

export function PredictionCard({ prediction, showFull = false }: PredictionCardProps) {
  const isLocked = !prediction.is_revealed
  const validation = prediction.validations?.[0]
  const eventCloseTime = new Date(prediction.event_close_time)

  const getDirectionIcon = (direction: string | null) => {
    switch (direction) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'neutral': return '➡️'
      default: return '📊'
    }
  }

  const getDirectionColor = (direction: string | null) => {
    switch (direction) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-gray-600 bg-gray-50 border-gray-200'
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const categoryColors: Record<string, string> = {
    equity: 'bg-blue-100 text-blue-800',
    commodity: 'bg-yellow-100 text-yellow-800',
    currency: 'bg-cyan-100 text-cyan-800',
    crypto: 'bg-green-100 text-green-800',
  }

  return (
    <Card className="glass-card card-hover border-white/10 overflow-hidden group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">{prediction.asset_name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${categoryColors[prediction.category] || 'bg-gray-100 text-gray-800'}`}>
                {prediction.category}
              </span>
              {isLocked && prediction.direction && (
                <span className={`badge border ${getDirectionColor(prediction.direction)}`}>
                  {getDirectionIcon(prediction.direction)} {prediction.direction.toUpperCase()}
                </span>
              )}
              {isLocked && prediction.confidence !== null && (
                <span className={`badge border ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}% Confidence
                </span>
              )}
              {isLocked && (
                <span className="badge badge-warning">🔒 Locked</span>
              )}
              {!isLocked && validation && validation.is_correct !== null && (
                <span className={`badge ${validation.is_correct ? 'badge-success' : 'badge-danger'}`}>
                  {validation.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              )}
            </div>
          </div>
          {prediction.experts && (
            <Link
              href={`/experts/${prediction.expert_id}`}
              className="text-sm text-purple-600 hover:underline"
            >
              by {prediction.experts.name}
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLocked ? (
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
            <div className="text-5xl mb-6 animate-pulse">🔒</div>
            <p className="text-white/90 text-xl font-semibold mb-8">
              This prediction is vault-secured.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white/50 uppercase mb-1 tracking-widest">Reveal Date</div>
                <div className="text-lg font-bold text-white">{eventCloseTime.toLocaleDateString()}</div>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white/50 uppercase mb-1 tracking-widest">Reveal Time</div>
                <div className="text-lg font-bold text-white">{eventCloseTime.toLocaleTimeString()}</div>
              </div>
              {prediction.target_value && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-white/50 uppercase mb-1 tracking-widest">Target</div>
                  <div className="text-lg font-bold text-white gradient-text">{prediction.target_value}</div>
                </div>
              )}
            </div>
            <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black py-6 rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]">
              UNLOCK PREDICTIONS
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-white/90 text-lg leading-relaxed p-6 bg-white/5 rounded-2xl border-l-8 border-purple-500 backdrop-blur-sm">
              {prediction.prediction}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Event Date</div>
                <div className="text-white font-semibold">{new Date(prediction.event_date).toLocaleDateString()}</div>
              </div>
              {prediction.target_value && (
                <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Target</div>
                  <div className="text-white font-black text-xl">{prediction.target_value}</div>
                </div>
              )}
              {prediction.current_value && (
                <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Current</div>
                  <div className="text-white font-black text-xl">{prediction.current_value}</div>
                </div>
              )}
              {validation && validation.actual_value !== null && (
                <div className="bg-white/10 p-4 rounded-xl border border-green-500/30">
                  <div className="text-xs font-bold text-green-400 uppercase mb-1 tracking-widest">Actual</div>
                  <div className="text-green-400 font-black text-xl">{validation.actual_value}</div>
                </div>
              )}
              {prediction.confidence !== null && (
                <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Confidence</div>
                  <div className="text-white font-semibold">{prediction.confidence}%</div>
                </div>
              )}
              {prediction.direction && (
                <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Direction</div>
                  <div className="text-white font-semibold">{getDirectionIcon(prediction.direction)} {prediction.direction.toUpperCase()}</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40 flex justify-between">
          <span className="flex items-center gap-1">🕒 Created: {formatDateTime(prediction.created_at)}</span>
          {validation?.validated_at && (
            <span className="flex items-center gap-1">🏁 Validated: {formatDateTime(validation.validated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}



