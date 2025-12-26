
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
                const nowMs = now.getTime();

                // Determine Symbol (Common logic)
                let symbol = pred.asset_symbol ? pred.asset_symbol.trim().toUpperCase() : "";
                if (!symbol && pred.title) {
                    const titleParts = pred.title.split(':');
                    if (titleParts.length > 1) {
                        const afterCategory = titleParts[1].trim();
                        const identifierParts = afterCategory.split(' - ');
                        if (identifierParts.length > 0) {
                            symbol = identifierParts[0].trim().toUpperCase();
                        }
                    }
                }
                const base = (symbol && symbol.length >= 3) ? symbol.substring(0, 3) : "";
                if (!base) continue;

                // --- Case A: Populate Reference Price (for Opening Predictions) ---
                if (!pred.reference_price) {
                    // Only populate if we have reached the reference time (08:00 UK)
                    if (nowMs >= refTime) {
                        // Fetch Open Price
                        try {
                            const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=USD`, { method: 'GET', keepalive: true });
                            if (response.ok) {
                                const priceData = await response.json();
                                const currentPrice = priceData?.rates?.USD;
                                if (currentPrice) {
                                    // Update DB
                                    await supabase.from('predictions').update({ reference_price: currentPrice }).eq('id', pred.id);
                                    console.log(`Set Opening Price for ${pred.id} (${base}): ${currentPrice}`);

                                    // Update local object to allow evaluation in same tick if ready
                                    pred.reference_price = currentPrice;
                                }
                            }
                        } catch (e) {
                            console.error(`Failed to set opening price for ${pred.id}`, e);
                        }
                    } else {
                        // Not yet time to set open price
                        continue;
                    }
                }

                // --- Case B: Evaluate Outcome ---
                // Requires reference_price to be set
                if (!pred.reference_price) continue;

                // Check if duration has passed
                if (nowMs < unlockTime) continue;

                // Fetch Final Price
                const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=USD`, {
                    method: 'GET',
                    keepalive: true
                });

                if (!response.ok) continue;

                const priceData = await response.json();
                const final_price = priceData?.rates?.USD;

                if (typeof final_price !== 'number' || isNaN(final_price)) continue;

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
