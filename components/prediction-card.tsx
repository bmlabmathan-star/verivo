"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/types/database.types"
import { TrendingUp, TrendingDown, Clock, Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type Prediction = Database['public']['Tables']['predictions']['Row'] & {
  experts?: { name: string; username: string } | null
  validations?: Array<{
    actual_value: number | null
    is_correct: boolean | null
    validated_at: string
  }> | null
  duration_minutes?: number | null
  timeframe?: string | null // Add timeframe if missing in DB types but existing in usage
}

interface PredictionCardProps {
  prediction: Prediction
  showFull?: boolean
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  // Parsing State
  const outcomeText = prediction.outcome || (prediction.validations?.[0]?.is_correct === true ? 'Correct' : prediction.validations?.[0]?.is_correct === false ? 'Incorrect' : null)
  const isPending = !outcomeText

  // Countdown State
  const [countdown, setCountdown] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!isPending) {
      setCountdown(null)
      return
    }

    // Determine target time
    // Priority: target_date > (reference_time + duration)
    let targetTimeMs = 0
    if (prediction.target_date) {
      targetTimeMs = new Date(prediction.target_date).getTime()
    } else if (prediction.reference_time && prediction.duration_minutes && prediction.duration_minutes > 0) {
      targetTimeMs = new Date(prediction.reference_time).getTime() + (prediction.duration_minutes * 60000)
    } else {
      // Cannot calculate countdown (e.g. Opening prediction without target_date yet)
      return
    }

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetTimeMs - now

      if (diff <= 0) {
        setIsEvaluating(true)
        setCountdown(null)
        // Ideally stop timer, but we keep checking in case target_date updates? 
        // Actually, just clear interval if we consider it "done" until refresh.
        // But prompt says: "When countdown reaches zero: Show ⏱ Evaluating…"
        clearInterval(timer)
      } else {
        setIsEvaluating(false)
        // Under 30s check
        setIsUrgent(diff < 30000)

        // Format MM:SS or HH:MM:SS
        const hours = Math.floor((diff / (1000 * 60 * 60)))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        const mStr = minutes.toString().padStart(2, '0')
        const sStr = seconds.toString().padStart(2, '0')

        if (hours > 0) {
          const hStr = hours.toString().padStart(2, '0')
          setCountdown(`${hStr}:${mStr}:${sStr}`)
        } else {
          setCountdown(`${mStr}:${sStr}`)
        }
      }
    }, 1000)

    // Initial call
    return () => clearInterval(timer)
  }, [isPending, prediction.target_date, prediction.reference_time, prediction.duration_minutes])

  // Prices
  const refPrice = prediction.reference_price ? Number(prediction.reference_price).toFixed(2) : "—"
  const finalPriceRaw = prediction.final_price ?? prediction.validations?.[0]?.actual_value
  const finalPrice = finalPriceRaw ? Number(finalPriceRaw).toFixed(2) : "Pending"

  // Duration
  const durationDisplay = prediction.duration_minutes
    ? (prediction.duration_minutes >= 60 ? `${prediction.duration_minutes / 60}h` : `${prediction.duration_minutes}m`)
    : prediction.timeframe || "Until Open" // Fallback for Opening

  // Direction Logic
  const isUp = prediction.direction?.toLowerCase() === 'up'
  const isDown = prediction.direction?.toLowerCase() === 'down'

  // Styles based on status
  const getStatusBadge = () => {
    if (outcomeText === 'Correct') {
      return (
        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Correct</span>
        </div>
      )
    }
    if (outcomeText === 'Incorrect') {
      return (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full border border-red-500/30">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Incorrect</span>
        </div>
      )
    }

    // Pending State
    if (isEvaluating) {
      return (
        <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30 animate-pulse">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">⏱ Evaluating…</span>
        </div>
      )
    }

    if (countdown) {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${isUrgent
          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          }`}>
          <Activity className={`w-4 h-4 ${isUrgent ? 'animate-ping' : 'animate-pulse'}`} />
          <span className="text-sm font-bold uppercase tracking-wider tabular-nums">
            ⏳ Evaluates in {countdown}
          </span>
        </div>
      )
    }

    // Default Pending (No countdown available)
    return (
      <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30">
        <Activity className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-bold uppercase tracking-wider">Pending Verification</span>
      </div>
    )
  }

  // Category Colors
  const categoryColors: Record<string, string> = {
    Stocks: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Crypto: 'bg-green-500/20 text-green-300 border-green-500/30',
    Global: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Forex: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Commodities: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Indices: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  }

  const catColor = categoryColors[prediction.category || ''] || 'bg-white/10 text-white/60 border-white/10'

  // Time Formatter
  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return "—"
    try {
      const date = new Date(dateString)
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
    } catch (e) {
      return "—"
    }
  }

  const lockedAt = formatTimestamp(prediction.reference_time || prediction.created_at)
  const evaluatedAt = prediction.evaluation_time ? formatTimestamp(prediction.evaluation_time) : null

  return (
    <Card className={`glass-card border-white/10 overflow-hidden transition-all hover:border-white/20 hover:bg-white/5`}>
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white leading-tight">
              {prediction.asset_name || prediction.title || "Prediction Asset"}
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${catColor}`}>
                {prediction.category || "General"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-white/60" />
            <span className="text-xs font-medium text-white/80">{durationDisplay}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Core Prediction Details */}
        <div className="flex items-stretch gap-4">
          {/* Direction Box */}
          <div className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[80px] ${isUp ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            isDown ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-white/5 border-white/10 text-white/60'
            }`}>
            {isUp ? <TrendingUp className="w-6 h-6 mb-1" /> :
              isDown ? <TrendingDown className="w-6 h-6 mb-1" /> :
                <AlertCircle className="w-6 h-6 mb-1" />}
            <span className="text-xs font-bold uppercase">{prediction.direction || "Neutral"}</span>
          </div>

          {/* Price Metrics */}
          <div className="grid grid-cols-2 flex-1 gap-2">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Ref Price</p>
              <p className="text-lg font-mono font-medium text-white/90">{refPrice}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Final Price</p>
              <p className={`text-lg font-mono font-medium ${isPending ? 'text-white/50 italic text-sm pt-1' : 'text-white/90'}`}>
                {finalPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Forex Data Source Attribution */}
        {prediction.category === 'Forex' && (
          <div className="text-[10px] text-white/30 text-center font-mono -mt-2">
            Data Reference: ECB via Frankfurter (USD base)
          </div>
        )}

        {/* Indices Data Source Attribution */}
        {prediction.category === 'Indices' && (
          <div className="text-[10px] text-white/30 text-center font-mono -mt-2">
            Data Reference: Yahoo Finance (Delayed)
          </div>
        )}

        {/* Footer actions / Status */}
        <div className="flex items-center justify-between pt-2">
          {getStatusBadge()}
          {prediction.experts && (
            <Link href={`/expert/${prediction.experts.username || prediction.experts.name}`} className="text-xs text-white/40 hover:text-white transition-colors">
              by {prediction.experts.name}
            </Link>
          )}
        </div>

        {/* Timestamps & Duration */}
        <div className="pt-3 mt-3 border-t border-slate-800/60">
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3 relative group-hover:border-purple-500/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Timeline</span>
              {prediction.duration_minutes && (
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {prediction.duration_minutes} MIN
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm font-medium font-mono text-slate-300">
                <span className="text-slate-500 text-xs uppercase tracking-wide">Locked</span>
                <span>{lockedAt}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-medium font-mono text-slate-300">
                <span className="text-slate-500 text-xs uppercase tracking-wide">Evaluated</span>
                {evaluatedAt ? (
                  <span>{evaluatedAt}</span>
                ) : (
                  <span className="text-yellow-500/80 italic text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
