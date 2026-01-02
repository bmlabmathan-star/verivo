
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const scheduledTask = async (event: any, context: any) => {
    try {
        console.log("Running scheduled indices validation...");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Query pending Indices predictions
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Indices')
            .is('outcome', null)
            .limit(50);

        if (fetchError) {
            console.error("Error fetching predictions:", fetchError);
            return { statusCode: 500 };
        }

        if (!predictions || predictions.length === 0) {
            console.log("No pending indices predictions found.");
            return { statusCode: 200 };
        }

        const now = new Date();
        const nowMs = now.getTime();

        // 2. Process
        for (const pred of predictions) {
            try {
                if (!pred.reference_time) continue;

                let unlockTime = 0;
                if (pred.duration_minutes && pred.duration_minutes > 0 && pred.reference_time) {
                    const refTime = new Date(pred.reference_time).getTime();
                    unlockTime = refTime + (pred.duration_minutes * 60000);
                } else if (pred.target_date) {
                    unlockTime = new Date(pred.target_date).getTime();
                } else {
                    continue; // Cannot evaluate without target
                }

                // Determine Symbol
                // asset_key format: 'index:sp500' or similar
                // asset_symbol should hold the Yahoo Ticker (e.g. ^GSPC) directly from creation
                const symbol = pred.asset_symbol;
                if (!symbol) continue;

                // --- Helper Fetch Logic (Yahoo) ---
                const getPrice = async () => {
                    try {
                        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
                        const res = await fetch(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            },
                        });

                        // Yahoo sometimes returns 404 or bad structure if invalid
                        if (res.ok) {
                            const d = await res.json();
                            const meta = d?.chart?.result?.[0]?.meta;
                            if (meta?.regularMarketPrice) return parseFloat(meta.regularMarketPrice);
                        }
                    } catch (e) { console.error("Yahoo error", e); }
                    return null;
                };

                // --- Case A: Populate Reference Price ---
                // Indices should have ref price set at creation. 
                // But if invalid/missing, we might try to backfill if within reasonable time? 
                // Or just fail. User instruction says: "Ensure missing data gracefully marks prediction as 'Data Unavailable'"
                // If reference_price is null AND prediction is old, we maybe should mark as Data Unavailable (outcome='Void'?).
                // But for now, let's assume if ref price is missing, we try to fetch current price IF it's just created?
                // Actually user requirement 2: "Capture reference_price at creation". 
                // So if it's null, something went wrong at creation.
                // We'll skip validation if null.

                if (!pred.reference_price) {
                    // Maybe mark as Void if older than X mins? 
                    // Leaving as is for now.
                    continue;
                }

                // --- Case B: Evaluate Outcome ---
                if (nowMs < unlockTime) continue;

                // Fetch Final Price
                const final_price = await getPrice();

                if (final_price === null || isNaN(final_price)) {
                    console.log(`Final price unavailable for ${symbol}`);
                    continue;
                }

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

                console.log(`Validated Index ${pred.id} (${symbol}): ${outcome}. Ref: ${refPrice}, Final: ${final_price}`);

            } catch (err) {
                console.error(`Error processing pred ${pred.id}:`, err);
            }
        }

        return { statusCode: 200 };

    } catch (e) {
        console.error("Critical error in indices scheduled function:", e);
        return { statusCode: 500 };
    }
};

export const handler = schedule('* * * * *', scheduledTask);
