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
    <Card className="card-hover">
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
              {!isLocked && validation?.is_correct !== null && (
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-600 mb-6">
              This prediction is locked and will be revealed after the event closes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="bg-white p-3 rounded">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Reveal Date</div>
                <div className="text-sm font-medium">{eventCloseTime.toLocaleDateString()}</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Reveal Time</div>
                <div className="text-sm font-medium">{eventCloseTime.toLocaleTimeString()}</div>
              </div>
              {prediction.target_value && (
                <div className="bg-white p-3 rounded">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Target</div>
                  <div className="text-sm font-medium">{prediction.target_value}</div>
                </div>
              )}
            </div>
            <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600">
              🔓 Unlock this prediction (coming soon)
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
              {prediction.prediction}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Event Date</div>
                <div className="text-sm">{new Date(prediction.event_date).toLocaleDateString()}</div>
              </div>
              {prediction.target_value && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Target</div>
                  <div className="text-sm">{prediction.target_value}</div>
                </div>
              )}
              {prediction.current_value && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Current</div>
                  <div className="text-sm">{prediction.current_value}</div>
                </div>
              )}
              {validation?.actual_value !== null && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Actual</div>
                  <div className="text-sm">{validation.actual_value}</div>
                </div>
              )}
              {prediction.confidence !== null && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Confidence</div>
                  <div className="text-sm">{prediction.confidence}%</div>
                </div>
              )}
              {prediction.direction && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Direction</div>
                  <div className="text-sm">{getDirectionIcon(prediction.direction)} {prediction.direction.toUpperCase()}</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex justify-between">
          <span>Created: {formatDateTime(prediction.created_at)}</span>
          {validation?.validated_at && (
            <span>Validated: {formatDateTime(validation.validated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}



