import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            title,
            category,
            region,
            direction,
            marketType,
            globalAsset,
            globalIdentifier,
            timeframe, // passed from frontend e.g. "5m", "1h", or "opening"
            prediction_type // "intraday" or "opening"
        } = body

        // Get Auth Token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Create Supabase Client with User Auth
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: authHeader } }
            }
        )

        // Get User
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let reference_price = null
        let reference_time = new Date().toISOString()
        let data_source = null
        let target_date = null
        let duration_minutes = 0

        // Parse Duration
        if (prediction_type === 'opening') {
            // Opening prediction logic
            duration_minutes = 0 // Represents "Until Open" or special handling
            // Target date is "Next Market Open". Difficult to precise without market schedule API.
            // We can set a placeholder or leave null to be handled by Cron.
            // For duplicate check, we rely on 'opening' type + symbol.
        } else {
            // Prefer explicit duration_minutes from body
            if (body.duration_minutes !== undefined && body.duration_minutes !== null) {
                duration_minutes = parseInt(body.duration_minutes)
            } else {
                // Fallback to timeframe mapping
                if (timeframe === '5m') duration_minutes = 5
                else if (timeframe === '10m') duration_minutes = 10
                else if (timeframe === '30m') duration_minutes = 30
                else if (timeframe === '1h') duration_minutes = 60
                else if (timeframe === '3h') duration_minutes = 180
                else {
                    if (body.target_date) {
                        const tDate = new Date(body.target_date)
                        const now = new Date()
                        const diffMs = tDate.getTime() - now.getTime()
                        duration_minutes = Math.floor(diffMs / 60000)
                        if (duration_minutes < 1) duration_minutes = 1
                    }
                }
            }
        }

        // Calculate Target Date based on Duration (if fixed type)
        // If duration_minutes is set, we prefer calculating target_date from now or reference_time
        if (duration_minutes > 0) {
            const nowTime = new Date().getTime()
            const targetTime = nowTime + (duration_minutes * 60000)
            target_date = new Date(targetTime).toISOString()
        } else if (prediction_type !== 'opening') {
            // EOD or Custom fallback if duration was 0 or invalid and not opening
            if (body.target_date) {
                target_date = body.target_date
            } else {
                target_date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        }

        // Check for duplicate active predictions
        if (user?.id && marketType && globalIdentifier) {
            // For Opening: Check if one exists for same symbol
            // For Intraday: Check if one exists for same symbol + duration
            let query = supabase
                .from('predictions')
                .select('id')
                .eq('user_id', user.id)
                .eq('market_type', marketType)
                .eq('asset_symbol', globalIdentifier)
                .is('outcome', null)

            if (prediction_type === 'opening') {
                query = query.eq('prediction_type', 'opening')
            } else {
                query = query.eq('duration_minutes', duration_minutes)
            }

            const { data: existingPrediction, error: duplicateCheckError } = await query.maybeSingle()

            if (existingPrediction) {
                return NextResponse.json({
                    error: "You already have an active prediction for this asset and timeframe. Please wait until it is evaluated."
                }, { status: 400 })
            }
        }

        // Reference Price Logic - Crypto Only (Existing)
        if (marketType === 'global' && globalAsset === 'Crypto' && globalIdentifier) {
            try {
                const symbol = globalIdentifier.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
                const pair = `${symbol}-USD`

                const response = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store'
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data?.data?.amount) {
                        reference_price = parseFloat(data.data.amount)
                        reference_time = new Date().toISOString() // refresh exact fetch time
                        data_source = 'Coinbase'
                    }
                }
            } catch (e) {
                console.error("Failed to fetch crypto price:", e)
            }
        }

        // For Opening Predictions (Non-Crypto), we ideally fetch "Previous Close".
        // WITHOUT a stock API key in this context (e.g. AlphaVantage), we can't reliably fetch it now.
        // We will leave reference_price as NULL for now, and let the Validator fill it if it has access,
        // OR we assume the user accepts it will be filled later.

        // Recalculate target date precisely from reference_time if we successfully fetched price
        if (reference_price && duration_minutes > 0) {
            const refTimeMs = new Date(reference_time).getTime()
            target_date = new Date(refTimeMs + (duration_minutes * 60000)).toISOString()
        }

        // Insert Prediction
        const { error: insertError } = await supabase
            .from('predictions')
            .insert({
                user_id: user.id,
                title,
                category,
                region,
                direction,
                target_date,
                reference_price,
                reference_time,
                data_source,
                duration_minutes: duration_minutes > 0 ? duration_minutes : null, // Store null for Opening (0)
                market_type: marketType,
                asset_symbol: globalIdentifier,
                prediction_type: prediction_type || 'intraday'
            })

        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Create Prediction Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
