import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Basic Cron Security
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow local dev testing or if CRON_SECRET is not set (warn)
        if (process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // 1. Fetch pending "Opening" predictions
        // We look for predictions made *before* today's market open (conceptually).
        // Since we run this AT market open (or slightly after), any pending 'opening' prediction is a candidate.
        // We process in batches.
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('prediction_type', 'opening')
            .is('outcome', null)
            .limit(50)

        if (fetchError) throw fetchError
        if (!predictions || predictions.length === 0) {
            return NextResponse.json({ message: 'No pending opening predictions found' })
        }

        const updates = []

        for (const prediction of predictions) {
            // 2. Process Prediction
            let updatesForPrediction = null

            // Check if target date has passed (Market has opened)
            // If target_date is null, we can't reliably validate unless we check market status.
            if (prediction.target_date && new Date() >= new Date(prediction.target_date)) {

                // --- INDICES ---
                if (prediction.market_type === 'index') {
                    try {
                        const finalPrice = await fetchYahooPrice(prediction.asset_symbol)
                        const refPrice = prediction.reference_price // Should be set at creation (Last Close)

                        if (finalPrice !== null && refPrice !== null) {
                            const isUp = finalPrice > refPrice
                            const predictedUp = prediction.direction === 'Up'

                            let outcome = 'Incorrect'
                            // Logic: 
                            // Up Prediction: Correct if Final > Ref
                            // Down Prediction: Correct if Final < Ref
                            if ((predictedUp && isUp) || (!predictedUp && !isUp)) {
                                if (finalPrice !== refPrice) {
                                    outcome = 'Correct'
                                }
                            }

                            updatesForPrediction = {
                                id: prediction.id,
                                final_price: finalPrice,
                                outcome: outcome,
                                evaluation_time: new Date().toISOString()
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to validate index ${prediction.asset_symbol}:`, e)
                    }
                }

                // Add other asset types (Crypto/Forex) logic here if needed
            }

            if (updatesForPrediction) {
                updates.push(updatesForPrediction)
                console.log(`[Opening Validator] Validated ${prediction.asset_symbol}: ${updatesForPrediction.outcome}`)
            }
        }

        // 3. Batch Update
        if (updates.length > 0) {
            for (const update of updates) {
                const { error } = await supabase
                    .from('predictions')
                    .update(update)
                    .eq('id', update.id)
                if (error) console.error("Failed to update", update.id, error)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${updates.length} predictions out of ${predictions.length} pending.`
        })

    } catch (error: any) {
        console.error("Opening Validation Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Helper for Yahoo Finance (Duplicated from create-prediction to be self-contained in Cron)
async function fetchYahooPrice(ticker: string): Promise<number | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            cache: 'no-store'
        })

        if (!response.ok) return null

        const data = await response.json()
        const meta = data?.chart?.result?.[0]?.meta

        if (meta?.regularMarketPrice) {
            return parseFloat(meta.regularMarketPrice)
        }
        return null
    } catch (e) {
        console.error("Yahoo fetch error:", e)
        return null
    }
}
