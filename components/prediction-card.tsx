import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import { Database } from "@/types/database.types"

type Prediction = Database['public']['Tables']['predictions']['Row'] & {
  // Joined fields from legacy/full query
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
  // Determine if we should show the full details
  // Legacy: is_revealed is true.
  // New: outcome is set (automated validation).
  const isRevealed = prediction.is_revealed || !!prediction.outcome
  const isLocked = !isRevealed

  // Validation Data Source: New (outcome) vs Old (validations table)
  const outcomeText = prediction.outcome || (prediction.validations?.[0]?.is_correct === true ? 'Correct' : prediction.validations?.[0]?.is_correct === false ? 'Incorrect' : null)
  const finalPrice = prediction.final_price ?? prediction.validations?.[0]?.actual_value
  const evalTime = prediction.evaluation_time ?? prediction.validations?.[0]?.validated_at

  const eventCloseTime = new Date(prediction.event_close_time || prediction.target_date || Date.now())
  const displayTitle = prediction.title || prediction.asset_name || "Prediction"

  const getDirectionIcon = (direction: string | null) => {
    // Normalize string case
    const d = direction?.toLowerCase()
    switch (d) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'neutral': return '➡️'
      default: return '📊'
    }
  }

  const getDirectionColor = (direction: string | null) => {
    const d = direction?.toLowerCase()
    switch (d) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const categoryColors: Record<string, string> = {
    equity: 'bg-blue-100 text-blue-800',
    commodity: 'bg-yellow-100 text-yellow-800',
    currency: 'bg-cyan-100 text-cyan-800',
    crypto: 'bg-green-100 text-green-800',
    Stocks: 'bg-blue-100 text-blue-800',
    Global: 'bg-purple-100 text-purple-800',
    Crypto: 'bg-green-100 text-green-800'
  }

  // Determine Category Color
  // Handle case sensitivity or new categories
  const catKey = Object.keys(categoryColors).find(k => k.toLowerCase() === prediction.category.toLowerCase())
  const catColor = catKey ? categoryColors[catKey] : 'bg-gray-100 text-gray-800'

  return (
    <Card className="glass-card card-hover border-white/10 overflow-hidden group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">{displayTitle}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${catColor}`}>
                {prediction.category}
              </span>

              {/* Direction Badge */}
              {isLocked && prediction.direction && (
                <span className={`badge border ${getDirectionColor(prediction.direction)}`}>
                  {getDirectionIcon(prediction.direction)} {prediction.direction.toUpperCase()}
                </span>
              )}

              {/* Status Badge */}
              {isLocked && (
                <span className="badge badge-warning">🔒 Locked</span>
              )}
              {isRevealed && (
                <span className={`badge ${outcomeText === 'Correct' ? 'badge-success' : outcomeText === 'Incorrect' ? 'badge-danger' : 'bg-gray-200 text-gray-800'}`}>
                  {outcomeText === 'Correct' ? '✓ Correct' : outcomeText === 'Incorrect' ? '✗ Incorrect' : 'Pending / Void'}
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
            {/* Locked UI */}
            <div className="text-5xl mb-6 animate-pulse">🔒</div>
            <p className="text-white/90 text-xl font-semibold mb-8">
              Vault-Secured Prediction
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white/50 uppercase mb-1 tracking-widest">Target Date</div>
                <div className="text-lg font-bold text-white">{eventCloseTime.toLocaleString()}</div>
              </div>
              {prediction.reference_price && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-white/50 uppercase mb-1 tracking-widest">Entry Price</div>
                  <div className="text-lg font-bold text-white gradient-text">{prediction.reference_price}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unlocked / Revealed UI */}

            {/* Logic for Title/Statement */}
            {(prediction.prediction || prediction.title) && (
              <div className="text-white/90 text-lg leading-relaxed p-6 bg-white/5 rounded-2xl border-l-8 border-purple-500 backdrop-blur-sm">
                {prediction.prediction || prediction.title}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

              {/* Entry / Reference */}
              <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Entry Price</div>
                <div className="text-white font-black text-xl">
                  {prediction.reference_price ?? prediction.current_value ?? "—"}
                </div>
              </div>

              {/* Target / Final */}
              <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">
                  {outcomeText ? "Final Price" : "Target / Current"}
                </div>
                <div className="text-white font-black text-xl">
                  {finalPrice ?? prediction.target_value ?? "—"}
                </div>
              </div>

              {/* Status Outcome */}
              {outcomeText && (
                <div className={`p-4 rounded-xl border ${outcomeText === 'Correct' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className={`text-xs font-bold uppercase mb-1 tracking-widest ${outcomeText === 'Correct' ? 'text-green-400' : 'text-red-400'}`}>Outcome</div>
                  <div className={`font-black text-xl ${outcomeText === 'Correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {outcomeText}
                  </div>
                </div>
              )}

              <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-white/40 uppercase mb-1 tracking-widest">Direction</div>
                <div className="text-white font-semibold flex items-center gap-2">
                  {getDirectionIcon(prediction.direction)}
                  {prediction.direction?.toUpperCase()}
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40 flex justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1">🕒 Created: {formatDateTime(prediction.created_at)}</span>
          {evalTime && (
            <span className="flex items-center gap-1">🏁 Evaluated: {formatDateTime(evalTime)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
