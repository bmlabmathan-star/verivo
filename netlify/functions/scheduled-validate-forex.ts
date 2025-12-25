
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const scheduledTask = async (event: any, context: any) => {
    try {
        console.log("Running scheduled forex validation...");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Query pending Forex predictions
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Forex')
            .is('outcome', null)
            .not('duration_minutes', 'is', null) // Ensure valid duration
            .limit(50);

        if (fetchError) {
            console.error("Error fetching predictions:", fetchError);
            return { statusCode: 500 };
        }

        if (!predictions || predictions.length === 0) {
            console.log("No pending forex predictions found.");
            return { statusCode: 200 };
        }

        const now = new Date();

        // 2. Process
        for (const pred of predictions) {
            try {
                if (!pred.reference_time || !pred.duration_minutes) continue;

                const refTime = new Date(pred.reference_time).getTime();
                const durationMs = pred.duration_minutes * 60000;
                const unlockTime = refTime + durationMs;

                // Skip if not yet time to evaluate
                if (now.getTime() < unlockTime) {
                    continue;
                }

                // Determine Symbol
                // Try from asset_symbol first, else parse title
                let symbol = pred.asset_symbol ? pred.asset_symbol.trim().toUpperCase() : "";

                if (!symbol && pred.title) {
                    // Fallback parse: "Forex: EUR - Up..."
                    const titleParts = pred.title.split(':');
                    if (titleParts.length > 1) {
                        const afterCategory = titleParts[1].trim();
                        // "EUR - Up (5m)"
                        const identifierParts = afterCategory.split(' - ');
                        if (identifierParts.length > 0) {
                            symbol = identifierParts[0].trim().toUpperCase();
                        }
                    }
                }

                // Extract Base Code (first 3 chars)
                // e.g. "EUR" or "EURUSD" -> "EUR"
                if (!symbol || symbol.length < 3) continue;
                const base = symbol.substring(0, 3);

                // Fetch Price from Frankfurter
                // URL: https://api.frankfurter.app/latest?from=EUR&to=USD
                const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=USD`, {
                    method: 'GET',
                    keepalive: true
                });

                if (!response.ok) {
                    console.error(`Failed to fetch forex price for ${base}`);
                    continue;
                }

                const priceData = await response.json();
                // { amount: 1.0, base: "EUR", date: "...", rates: { USD: 1.045 } }
                const final_price = priceData?.rates?.USD;

                if (typeof final_price !== 'number' || isNaN(final_price)) continue;
                if (!pred.reference_price) continue;

                // Determine Outcome
                let outcome = 'Incorrect';
                const refPrice = Number(pred.reference_price);
                const direction = pred.direction; // 'Up' or 'Down'

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

                console.log(`Validated Forex ${pred.id} (${base}): ${outcome}. Ref: ${refPrice}, Final: ${final_price}`);

            } catch (err) {
                console.error(`Error processing pred ${pred.id}:`, err);
            }
        }

        return { statusCode: 200 };

    } catch (e) {
        console.error("Critical error in forex scheduled function:", e);
        return { statusCode: 500 };
    }
};

// Rate: Every 1 minute
export const handler = schedule('* * * * *', scheduledTask);
