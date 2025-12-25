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
            timeframe // passed from frontend e.g. "5m", "1h"
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
        // Prefer explicit duration_minutes from body if available (Fix for NULL bug)
        if (body.duration_minutes !== undefined && body.duration_minutes !== null) {
            duration_minutes = parseInt(body.duration_minutes)
        } else {
            // Fallback to timeframe mapping
            if (timeframe === '5m') duration_minutes = 5
            else if (timeframe === '10m') duration_minutes = 10
            else if (timeframe === '30m') duration_minutes = 30
            else if (timeframe === '1h') duration_minutes = 60
            else {
                // For 'eod' or 'custom', duration is variable. 
                // We'll calculate it from user provided target_date if present
                if (body.target_date) {
                    const tDate = new Date(body.target_date)
                    const now = new Date()
                    const diffMs = tDate.getTime() - now.getTime()
                    duration_minutes = Math.floor(diffMs / 60000)
                    if (duration_minutes < 1) duration_minutes = 1 // Min 1 min
                }
            }
        }

        // Calculate Target Date based on Duration (if fixed type)
        // If duration_minutes is set, we prefer calculating target_date from now or reference_time
        if (duration_minutes > 0) {
            const nowTime = new Date().getTime()
            const targetTime = nowTime + (duration_minutes * 60000)
            target_date = new Date(targetTime).toISOString()
        } else {
            // EOD or Custom fallback if duration was 0 or invalid
            if (body.target_date) {
                target_date = body.target_date
            } else {
                target_date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        }

        // Check for duplicate active predictions
        // Prevent creating multiple pending predictions for the exact same parameters
        if (user?.id && marketType && globalIdentifier && duration_minutes) {
            const { data: existingPrediction, error: duplicateCheckError } = await supabase
                .from('predictions')
                .select('id')
                .eq('user_id', user.id)
                .eq('market_type', marketType)
                .eq('asset_symbol', globalIdentifier)
                .eq('duration_minutes', duration_minutes)
                .is('outcome', null)
                .maybeSingle()

            if (duplicateCheckError) {
                console.error("Duplicate check error:", duplicateCheckError)
                // Proceed cautiously, or fail? Failing safe is better, but if column missing, it blocks everything.
                // Assuming columns exist as per request.
            }

            if (existingPrediction) {
                return NextResponse.json({
                    error: "You already have an active prediction for this asset and timeframe. Please wait until it is evaluated."
                }, { status: 400 })
            }
        }

        // Reference Price Logic - Crypto Only
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

        // Recalculate target date precisely from reference_time if we successfully fetched price
        // ensuring "Evaluation must occur only after: reference_time + (timeframe in minutes)"
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
                duration_minutes, // Store integer minutes
                market_type: marketType,
                asset_symbol: globalIdentifier
            })

        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Create Prediction Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
