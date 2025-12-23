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
            target_date,
            marketType,
            globalAsset,
            globalIdentifier
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
        let reference_time = null
        let data_source = null

        // Reference Price Logic - Crypto Only
        if (marketType === 'global' && globalAsset === 'Crypto' && globalIdentifier) {
            try {
                // Simple mapping: assume identifier is symbol like "BTC" -> "BTC-USD"
                // Using Coinbase Public API
                // Clean identifier
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
                        reference_time = new Date().toISOString()
                        data_source = 'Coinbase'
                    }
                }
            } catch (e) {
                console.error("Failed to fetch crypto price:", e)
                // We continue creation even if price fetch fails, or we could error out.
                // User requirements: "Store the fetched value...". If fetch fails, we store null.
            }
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
                // Added columns
                reference_price,
                reference_time,
                data_source
            })

        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Create Prediction Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
