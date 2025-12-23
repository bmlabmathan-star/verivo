import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Note: This function is triggered via an HTTP POST request.
// In a real production setup, you would set up a Cron Job (e.g. GitHub Actions, Vercel Cron, 
// or a simple uptime monitor) to hit this endpoint every X minutes.

export async function POST(request: Request) {
    try {
        // Authenticate the cron job (Optional but recommended: check for a secret header)
        const authHeader = request.headers.get('Authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // For now, allowing open access for testing or simple setup, 
            // but normally we'd return 401. 
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key to bypass RLS for admin tasks
        )

        const now = new Date().toISOString()

        // 1. Query pending crypto predictions
        // condition: category = 'Crypto', outcome IS NULL, target_date <= now
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Crypto')
            .is('outcome', null)
            .lte('target_date', now)
            .limit(50) // Process in batches

        if (fetchError) throw fetchError

        if (!predictions || predictions.length === 0) {
            return NextResponse.json({ message: 'No pending predictions found.' })
        }

        const results = []

        // 2. Process each prediction
        for (const pred of predictions) {
            try {
                // Ensure we have necessary data
                // The title usually contains the identifier like "Crypto: BTC - Up..."
                // But relying on title parsing is brittle.
                // Ideally we should have stored 'asset_symbol' separately. 
                // For now, we'll try to parse the title or re-use logic if we had stored it.
                // Re-parsing logic from the creation format: "Crypto: [IDENTIFIER] - [Direction] ..."

                let symbol = ""
                const titleParts = pred.title.split(':')
                if (titleParts.length > 1) {
                    const afterCategory = titleParts[1].trim() // "BTC - Up (1h)"
                    const identifierParts = afterCategory.split(' - ')
                    if (identifierParts.length > 0) {
                        symbol = identifierParts[0].trim().toUpperCase() // "BTC"
                    }
                }

                // Fallback or skip if symbol invalid
                if (!symbol) {
                    console.log(`Skipping prediction ${pred.id}: Could not parse symbol from title '${pred.title}'`)
                    continue
                }

                // Clean symbol for API
                // Assuming stored symbol is like "BTC", "ETH"
                const cleanSymbol = symbol.replace(/[^A-Z0-9]/g, '')
                const pair = `${cleanSymbol}-USD`

                // 3. Fetch Final Price
                const response = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store'
                })

                if (!response.ok) {
                    console.error(`Failed to fetch price for ${pair}`)
                    continue
                }

                const priceData = await response.json()
                const final_price = parseFloat(priceData?.data?.amount)

                if (isNaN(final_price)) {
                    continue
                }

                // 4. Compare and Determine Outcome
                // Logic:
                // Up: Final > Reference
                // Down: Final < Reference
                // (Tie usually Void or Incorrect depending on strictness. Let's say Incorrect for now if exact match)

                const refPrice = Number(pred.reference_price)
                if (!refPrice) {
                    // Cannot evaluate without reference price
                    // Maybe mark as 'Error' or 'Void'? For now, skip.
                    continue
                }

                let outcome = 'Incorrect'
                const direction = pred.direction // "Up" or "Down"

                if (direction === 'Up' && final_price > refPrice) {
                    outcome = 'Correct'
                } else if (direction === 'Down' && final_price < refPrice) {
                    outcome = 'Correct'
                }

                // 5. Update Prediction
                const { error: updateError } = await supabase
                    .from('predictions')
                    .update({
                        final_price: final_price,
                        outcome: outcome,
                        evaluation_time: new Date().toISOString()
                    })
                    .eq('id', pred.id)

                if (!updateError) {
                    results.push({ id: pred.id, symbol, outcome, final_price })
                }

            } catch (err) {
                console.error(`Error processing prediction ${pred.id}:`, err)
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        })

    } catch (error: any) {
        console.error("Cron Job Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
