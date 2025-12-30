import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isIndexMarketOpen, getNextMarketOpenTime } from '@/lib/market-hours'

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


        // --- Generate Normalized Asset Key ---
        let assetKey = ""

        if (marketType === 'stock') {
            // stock:country:symbol
            // normalize: remove special chars? Or just trim/lower?
            // "asset_key is always generated deterministically"
            const c = (region || body.country || "").trim().toLowerCase()
            const s = (globalIdentifier || body.assetName || "").trim().toLowerCase()
            assetKey = `stock:${c}:${s}`
        } else if (marketType === 'index') {
            const s = globalIdentifier.trim().toLowerCase()
            assetKey = `index:${s}`
            // We set globalAsset for consistency in checks involving 'category'
        } else if (marketType === 'global') {
            if (globalAsset === 'Crypto') {
                const s = globalIdentifier.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
                assetKey = `crypto:${s.toLowerCase()}`
            } else if (globalAsset === 'Forex') {
                const s = globalIdentifier.trim().toUpperCase().substring(0, 3)
                assetKey = `forex:${s.toLowerCase()}_usd`
            } else if (globalAsset === 'Commodities') {
                let symbol = globalIdentifier.trim().toUpperCase()
                if (symbol === 'GOLD' || symbol.includes('GOLD')) symbol = 'XAU'
                else if (symbol === 'SILVER' || symbol.includes('SILVER')) symbol = 'XAG'
                else if (['CRUDE', 'OIL', 'WTI'].some(s => symbol.includes(s))) symbol = 'WTI'
                else if (['GAS', 'NATURAL', 'NG'].some(s => symbol.includes(s))) symbol = 'NG'

                assetKey = `commodity:${symbol.toLowerCase()}`
            } else {
                assetKey = `global:${globalIdentifier.trim().toLowerCase()}`
            }
        }

        // Check for duplicate active predictions
        if (user?.id && assetKey) {
            // Check based on asset_key uniqueness for active predictions
            let query = supabase
                .from('predictions')
                .select('id')
                .eq('user_id', user.id)
                .eq('asset_key', assetKey)
                .is('outcome', null)

            if (prediction_type === 'opening') {
                query = query.eq('prediction_type', 'opening')
            } else {
                query = query.eq('duration_minutes', duration_minutes)
            }

            const { data: existingPrediction, error: duplicateCheckError } = await query.maybeSingle()

            if (existingPrediction) {
                return NextResponse.json({
                    error: "You already have an active prediction for this asset and timeframe. Please wait until it is evaluated.",
                    code: 'ACTIVE_PREDICTION_EXISTS'
                }, { status: 400 })
            }
        }

        // Reference Price Logic
        if (marketType === 'global' && globalIdentifier) {

            // --- FOREX (Frankfurter) ---
            if (globalAsset === 'Forex') {
                if (prediction_type === 'opening') {
                    // Start of Day / Opening Logic
                    try {
                        const openingTime = getLondonOpeningReference()
                        reference_time = openingTime
                        reference_price = null // Will be filled by validator at 08:00
                        data_source = 'Frankfurter (Delayed)'

                        // If duration_minutes is set (e.g. user picked "1h" for "1h after open")
                        // then we can set target_date now.
                        if (duration_minutes > 0) {
                            const opTime = new Date(openingTime).getTime()
                            target_date = new Date(opTime + (duration_minutes * 60000)).toISOString()
                        }
                    } catch (e: any) {
                        return NextResponse.json({ error: e.message }, { status: 400 })
                    }
                } else {
                    // Intraday Logic (Existing)
                    try {
                        // Logic: User enters 'EUR', 'GBP', etc.
                        let symbol = globalIdentifier.trim().toUpperCase().substring(0, 3)

                        // Fetch from Frankfurter
                        const response = await fetch(`https://api.frankfurter.app/latest?from=${symbol}&to=USD`, {
                            method: 'GET',
                            cache: 'no-store'
                        })

                        if (response.ok) {
                            const data = await response.json()
                            if (data?.rates?.USD) {
                                reference_price = data.rates.USD
                                reference_time = new Date().toISOString()
                                data_source = 'Frankfurter'
                            }
                        }
                    } catch (e) {
                        console.error("Failed to fetch forex price:", e)
                    }
                }
            }

            // --- CRYPTO (Coinbase) ---
            else if (globalAsset === 'Crypto') {
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

            // --- COMMODITIES (US Market) ---
            else if (globalAsset === 'Commodities') {
                // Symbol Normalization
                let symbol = globalIdentifier.trim().toUpperCase()
                if (symbol === 'GOLD' || symbol.includes('GOLD')) symbol = 'XAU'
                else if (symbol === 'SILVER' || symbol.includes('SILVER')) symbol = 'XAG'
                else if (['CRUDE', 'OIL', 'WTI'].some(s => symbol.includes(s))) symbol = 'WTI'
                else if (['GAS', 'NATURAL', 'NG'].some(s => symbol.includes(s))) symbol = 'NG'

                if (prediction_type === 'opening') {
                    // Opening Logic (US Market Open: 09:30 ET)
                    try {
                        const openingTime = getUSOpeningReference()
                        reference_time = openingTime
                        reference_price = null // Filled by validator
                        data_source = symbol === 'WTI' || symbol === 'NG' ? 'Yahoo Finance (NYMEX)' : 'US Market (COMEX)'

                        if (duration_minutes > 0) {
                            const opTime = new Date(openingTime).getTime()
                            target_date = new Date(opTime + (duration_minutes * 60000)).toISOString()
                        }
                    } catch (e: any) {
                        return NextResponse.json({ error: e.message }, { status: 400 })
                    }
                } else {
                    // Intraday
                    try {
                        let price = null
                        let source = ""

                        if (symbol === 'XAU') {
                            // Gold -> PAXG (Coinbase)
                            const response = await fetch(`https://api.coinbase.com/v2/prices/PAXG-USD/spot`, { cache: 'no-store' })
                            if (response.ok) {
                                const data = await response.json()
                                price = parseFloat(data?.data?.amount)
                                source = 'Coinbase (PAXG Proxy)'
                            }
                        }
                        else if (symbol === 'XAG') {
                            // Silver -> XAG (Coinbase)
                            const response = await fetch(`https://api.coinbase.com/v2/prices/XAG-USD/spot`, { cache: 'no-store' })
                            if (response.ok) {
                                const data = await response.json()
                                price = parseFloat(data?.data?.amount)
                                source = 'Coinbase (Spot)'
                            }
                        }
                        else if (symbol === 'WTI') {
                            // Crude Oil -> CL=F (Yahoo)
                            price = await fetchYahooPrice('CL=F')
                            source = 'Yahoo Finance (Future)'
                        }
                        else if (symbol === 'NG') {
                            // Natural Gas -> NG=F (Yahoo)
                            price = await fetchYahooPrice('NG=F')
                            source = 'Yahoo Finance (Future)'
                            source = 'Yahoo Finance (Future)'
                        }

                        if (price !== null) {
                            reference_price = price
                            reference_time = new Date().toISOString()
                            data_source = source
                        } else {
                            // Fallback generic check if user manually typed a detectable crypto
                            // Not strictly required for WTI/NG but good safety
                        }
                    } catch (e) {
                        console.error(`Failed to fetch commodity price for ${symbol}:`, e)
                    }
                }
            }
        } else if (marketType === 'index' && globalIdentifier) {
            // --- INDICES (Yahoo Finance) ---

            const symbol = globalIdentifier.trim().toUpperCase()

            if (prediction_type === 'opening') {
                // Opening Prediction Logic
                // 1. Set Reference Price (Last Traded/Previous Close)
                // We fetch the current price which, if market is closed, is the last close.
                try {
                    const price = await fetchYahooPrice(symbol)
                    if (price !== null) {
                        reference_price = price
                        reference_time = new Date().toISOString()
                        data_source = 'Yahoo Finance'
                    }
                } catch (e) {
                    console.error("Failed to fetch index reference price:", e)
                }

                // 2. Set Target Date to Next Market Open
                // Use the helper from market-hours
                target_date = getNextMarketOpenTime(symbol)
                duration_minutes = 0

            } else {
                // Intraday Logic
                // Market Hours Validation
                try {
                    const check = isIndexMarketOpen(symbol)
                    if (!check.isOpen) {
                        return NextResponse.json({
                            error: check.message,
                            code: 'MARKET_CLOSED'
                        }, { status: 400 })
                    }

                } catch (e) {
                    console.error("Time validation error:", e)
                    return NextResponse.json({ error: "Unable to validate market hours." }, { status: 500 })
                }

                // Fetch Price
                try {
                    const price = await fetchYahooPrice(symbol)

                    if (price !== null) {
                        reference_price = price
                        reference_time = new Date().toISOString()
                        data_source = 'Yahoo Finance'
                    } else {
                        console.warn(`Could not fetch index price for ${symbol} at creation.`)
                    }
                } catch (e) {
                    console.error("Failed to fetch index price:", e)
                }
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
                duration_minutes: duration_minutes > 0 ? duration_minutes : null, // Store null for Opening (0) if not calc
                market_type: marketType,
                asset_symbol: globalIdentifier,
                asset_key: assetKey,
                prediction_type: prediction_type || 'intraday'
            })

        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Create Prediction Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

// Helper for London Time Construction
function getLondonOpeningReference() {
    // 1. Get Current London Time
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    })

    // Parse
    const parts = formatter.formatToParts(now)
    const getP = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0')
    const ly = getP('year'), lm = getP('month'), ld = getP('day'), lh = getP('hour'), lmin = getP('minute')

    // 2. Check Cutoff (Strictly before 08:00)
    // If hour > 8, or (hour == 8 and min >= 0) -> Late.
    // So if hour >= 8, it's late.
    if (lh >= 8) {
        throw new Error("Prediction window closed. Forex opening predictions must be placed before 08:00 UK time.")
    }

    // 3. Construct 08:00 London Time in UTC
    // We assume 08:00 London. In Winter = 08:00 UTC. In Summer = 07:00 UTC.
    // Construction Strategy: Create UTC date at 08:00, check London hour. Adjust.
    const attempt = new Date(Date.UTC(ly, lm - 1, ld, 8, 0, 0))
    // Check what time 'attempt' is in London
    const checkFmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: 'numeric',
        hour12: false
    })
    const checkHour = parseInt(checkFmt.format(attempt))

    if (checkHour === 9) {
        // It's BST (Summer), 08:00 UTC is 09:00 London.
        // We want 08:00 London, so subtract 1 hour.
        attempt.setUTCHours(7)
    }
    // If checkHour === 8, it matches (Winter/GMT).

    return attempt.toISOString()
}

// Helper for US Market Time (09:30 ET)
function getUSOpeningReference() {
    // 1. Get Current US Time
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    })

    // Parse
    const parts = formatter.formatToParts(now)
    const getP = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0')
    const uy = getP('year'), um = getP('month'), ud = getP('day'), uh = getP('hour'), umin = getP('minute')

    // 2. Check Cutoff (Strictly before 09:30 ET)
    // If hour > 9, OR (hour == 9 and min >= 30) -> Late
    if (uh > 9 || (uh === 9 && umin >= 30)) {
        throw new Error("Prediction window closed. US Opening predictions must be placed before 09:30 ET.")
    }

    // 3. Construct 09:30 ET in UTC
    // We assume 09:30 ET.
    // Base UTC construction on US date components, then adjust offset?
    // Harder because we don't know the exact offset (EST=-5, EDT=-4) easily without library.
    // TRICK: Create a Date object from the string "YYYY-MM-DD 09:30:00" in US time zone? 
    // JS Date constructor is browser dependent or UTC.
    // Better strategy:
    // Create Date.UTC(uy, um-1, ud, 13, 30, 0) -- 13:30 is 09:30 EDT (-4).
    // Check if that results in 09:30 ET. If it is 08:30 ET, then it was EST (-5), so add hour.

    const attempt = new Date(Date.UTC(uy, um - 1, ud, 13, 30, 0)) // Try 13:30 UTC (09:30 EDT)

    const checkFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    })
    const checkStr = checkFmt.format(attempt) // e.g. "9:30" or "8:30"
    const [ch, cm] = checkStr.split(':').map(Number)

    if (ch === 8) {
        // It was 08:30 ET, meaning offset is -5 (EST). We need 09:30.
        // Add 1 hour.
        attempt.setUTCHours(14)
    }

    // Now attempt is 09:30 ET.
    return attempt.toISOString()
}

// Helper for Yahoo Finance
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
