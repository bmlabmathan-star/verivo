
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const scheduledTask = async (event: any, context: any) => {
    try {
        console.log("Running scheduled commodities validation...");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Query pending Commodities predictions
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Commodities')
            .is('outcome', null)
            .limit(50);

        if (fetchError) {
            console.error("Error fetching predictions:", fetchError);
            return { statusCode: 500 };
        }

        if (!predictions || predictions.length === 0) {
            console.log("No pending commodities predictions found.");
            return { statusCode: 200 };
        }

        const now = new Date();
        const nowMs = now.getTime();

        // 2. Process
        for (const pred of predictions) {
            try {
                if (!pred.reference_time) continue;

                // Duration might be null for Opening until processed/locked? 
                // Actually duration_minutes should be set if intraday, or if opening it might have target date or special logic.
                // In our route.ts logic for Opening, we set reference_time = Open Time.

                const refTime = new Date(pred.reference_time).getTime();

                // For Opening, duration_minutes might be null or specific. 
                // If null, we might treat it as "Evaluate at Close" or similar?
                // But simplified requirement: "Evaluation logic should reuse existing Verivo framework".
                // Existing framework relies on duration_minutes or target_date.

                let unlockTime = 0;
                if (pred.duration_minutes && pred.duration_minutes > 0) {
                    unlockTime = refTime + (pred.duration_minutes * 60000);
                } else if (pred.target_date) {
                    unlockTime = new Date(pred.target_date).getTime();
                } else {
                    // Fallback check
                    continue;
                }

                // Determine Symbol
                let symbol = pred.asset_symbol ? pred.asset_symbol.trim().toUpperCase() : "";

                // Mappings
                let pair = "";
                let source = "coinbase"; // default
                let yahooTicker = "";

                if (symbol === 'XAU' || symbol === 'GOLD' || symbol.includes('GOLD')) {
                    pair = "PAXG-USD";
                    source = "coinbase";
                } else if (symbol === 'XAG' || symbol === 'SILVER' || symbol.includes('SILVER')) {
                    pair = "XAG-USD";
                    source = "coinbase";
                } else if (['CRUDE', 'OIL', 'WTI'].some(s => symbol.includes(s)) || symbol === 'WTI') {
                    yahooTicker = "CL=F";
                    source = "yahoo";
                } else if (['GAS', 'NATURAL', 'NG'].some(s => symbol.includes(s)) || symbol === 'NG') {
                    yahooTicker = "NG=F";
                    source = "yahoo";
                } else {
                    // Fallback
                    if (symbol.length === 3) {
                        pair = `${symbol}-USD`;
                        source = "coinbase";
                    } else {
                        continue;
                    }
                }

                // --- Helper Fetch Logic ---
                const getPrice = async () => {
                    if (source === 'coinbase') {
                        try {
                            const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
                                headers: { 'Accept': 'application/json' },
                                keepalive: true
                            });
                            if (res.ok) {
                                const d = await res.json();
                                return parseFloat(d?.data?.amount);
                            }
                        } catch (e) { console.error("CB error", e); }
                    } else if (source === 'yahoo') {
                        // Yahoo Fetch
                        try {
                            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1m&range=1d`;
                            const res = await fetch(url, {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                },
                                keepalive: true
                            });
                            if (res.ok) {
                                const d = await res.json();
                                const meta = d?.chart?.result?.[0]?.meta;
                                if (meta?.regularMarketPrice) return parseFloat(meta.regularMarketPrice);
                            }
                        } catch (e) { console.error("Yahoo error", e); }
                    }
                    return null;
                };

                // --- Case A: Populate Reference Price ---
                if (!pred.reference_price) {
                    if (nowMs >= refTime) {
                        const currentPrice = await getPrice();
                        if (currentPrice) {
                            await supabase.from('predictions').update({ reference_price: currentPrice }).eq('id', pred.id);
                            console.log(`Set Opening Price for Comm ${pred.id} (${symbol}): ${currentPrice}`);
                            pred.reference_price = currentPrice;
                        }
                    } else {
                        continue;
                    }
                }

                // --- Case B: Evaluate Outcome ---
                if (!pred.reference_price) continue;
                if (nowMs < unlockTime) continue;

                // Fetch Final Price
                const final_price = await getPrice();

                if (!final_price || isNaN(final_price)) continue;

                // Determine Outcome
                let outcome = 'Incorrect';
                const refPrice = Number(pred.reference_price);
                const direction = pred.direction;

                if (direction === 'Up' && final_price > refPrice) {
                    outcome = 'Correct';
                } else if (direction === 'Down' && final_price < refPrice) {
                    outcome = 'Correct';
                }

                // Update
                await supabase
                    .from('predictions')
                    .update({
                        final_price: final_price,
                        outcome: outcome,
                        evaluation_time: now.toISOString()
                    })
                    .eq('id', pred.id);

                console.log(`Validated Commodity ${pred.id} (${symbol}): ${outcome}. Ref: ${refPrice}, Final: ${final_price}`);

            } catch (err) {
                console.error(`Error processing pred ${pred.id}:`, err);
            }
        }

        return { statusCode: 200 };

    } catch (e) {
        console.error("Critical error in commodities scheduled function:", e);
        return { statusCode: 500 };
    }
};

export const handler = schedule('* * * * *', scheduledTask);

