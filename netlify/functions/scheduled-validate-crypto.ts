
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const scheduledTask = async (event: any, context: any) => {
    try {
        console.log("Running scheduled crypto validation with enforced timing...");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Query pending crypto predictions
        // Strict Criteria:
        // - Category = 'Crypto'
        // - Outcome is NULL (not evaluated)
        // - duration_minutes IS NOT NULL (must have duration)
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Crypto')
            .is('outcome', null)
            .not('duration_minutes', 'is', null) // Skip legacy/bugged rows
            .limit(50);

        if (fetchError) {
            console.error("Error fetching predictions:", fetchError);
            return { statusCode: 500 };
        }

        if (!predictions || predictions.length === 0) {
            console.log("No pending crypto predictions found.");
            return { statusCode: 200 };
        }

        const now = new Date();

        // 2. Process
        for (const pred of predictions) {
            try {
                // Determine eligibility strictly
                if (!pred.reference_time || !pred.duration_minutes) continue;

                const refTime = new Date(pred.reference_time).getTime();
                const durationMs = pred.duration_minutes * 60000;
                const unlockTime = refTime + durationMs;

                // Skip if not yet time to evaluate
                if (now.getTime() < unlockTime) {
                    continue;
                }

                // Proceed with evaluation
                // Parse symbol
                let symbol = "";
                const titleParts = pred.title.split(':');
                if (titleParts.length > 1) {
                    const afterCategory = titleParts[1].trim();
                    const identifierParts = afterCategory.split(' - ');
                    if (identifierParts.length > 0) {
                        symbol = identifierParts[0].trim().toUpperCase();
                    }
                }

                if (!symbol) continue;

                // Clean symbol
                const cleanSymbol = symbol.replace(/[^A-Z0-9]/g, '');
                const pair = `${cleanSymbol}-USD`;

                // Fetch Price
                const response = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    keepalive: true
                });

                if (!response.ok) continue;

                const priceData = await response.json();
                const final_price = parseFloat(priceData?.data?.amount);

                if (isNaN(final_price)) continue;
                if (!pred.reference_price) continue;

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

                console.log(`Validated ${pred.id} (${symbol}): ${outcome}. Ref: ${refPrice}, Final: ${final_price}`);

            } catch (err) {
                console.error(`Error processing pred ${pred.id}:`, err);
            }
        }

        return { statusCode: 200 };

    } catch (e) {
        console.error("Critical error in scheduled function:", e);
        return { statusCode: 500 };
    }
};

// Rate: Every 1 minute
export const handler = schedule('* * * * *', scheduledTask);
