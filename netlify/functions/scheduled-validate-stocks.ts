
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const scheduledTask = async (event: any, context: any) => {
    try {
        console.log("Running scheduled stocks validation...");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Query pending Stock predictions
        const { data: predictions, error: fetchError } = await supabase
            .from('predictions')
            .select('*')
            .eq('category', 'Stocks')
            .is('outcome', null)
            .limit(50); // Batch size

        if (fetchError) {
            console.error("Error fetching predictions:", fetchError);
            return { statusCode: 500 };
        }

        if (!predictions || predictions.length === 0) {
            console.log("No pending stock predictions found.");
            return { statusCode: 200 };
        }

        const now = new Date();
        const nowMs = now.getTime();

        // 2. Process
        for (const pred of predictions) {
            try {
                // Determine Symbol
                // Try asset_symbol first (correct path), fallback to parsing asset_key (repair path)
                let symbol = pred.asset_symbol;

                if (!symbol && pred.asset_key) {
                    // asset_key format: 'stock:country:symbol'
                    const parts = pred.asset_key.split(':');
                    if (parts.length >= 3) {
                        symbol = parts[2];
                        console.log(`Recovered symbol ${symbol} from asset_key for pred ${pred.id}`);

                        // Optional: Self-heal the record? 
                        // We won't do it here to keep it simple, but we use it for lookup.
                    }
                }

                if (!symbol) {
                    console.log(`Skipping pred ${pred.id}: No symbol found.`);
                    continue;
                }

                // Normalization
                symbol = symbol.toUpperCase();

                // 2a. Heuristic Repair for India (NSE/BSE)
                // If the symbol lacks suffix and we know it's India, we append it.
                if (pred.asset_key && pred.asset_key.toLowerCase().includes(':india:')) {
                    if (/^\d+$/.test(symbol)) {
                        symbol += '.BO'; // Numeric -> BSE
                    } else if (/^[A-Z]+$/.test(symbol)) {
                        symbol += '.NS'; // Alphabetic -> NSE
                    }
                }

                // Check Timimg / Unlock
                let unlockTime = 0;

                // Handle Opening Predictions (duration_minutes is null or 0)
                // For Opening, we really need a logical target_date. 
                // If target_date is set, we use it. 
                // If duration is set (Intraday), strictly calculate unlock time.
                // Priority: reference_time + duration_minutes.
                // We ignore target_date because it might be mis-calculated or drifting.
                if (pred.duration_minutes && pred.duration_minutes > 0 && pred.reference_time) {
                    const refTime = new Date(pred.reference_time).getTime();
                    unlockTime = refTime + (pred.duration_minutes * 60000);
                } else if (pred.target_date) {
                    // Fallback for Opening predictions or if duration is 0
                    unlockTime = new Date(pred.target_date).getTime();
                }

                // If we still don't have a valid unlock time, we might skip
                // BUT for 'opening' predictions created without a target_date (relying on cron),
                // we might need to check if "market has opened".
                // However, the current architecture sets target_date at creation (mostly).
                // If target_date is missing, it's safer to skip than to guess.
                if (!unlockTime) {
                    // Last ditch: if it's very old?
                    continue;
                }

                if (nowMs < unlockTime) continue;

                const isOverdue = (nowMs - unlockTime) > (60 * 60 * 1000); // 1 hour past unlock

                // --- Helper Fetch Logic (Yahoo) ---
                const getPrice = async () => {
                    try {
                        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
                        const res = await fetch(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            },
                        });

                        if (res.ok) {
                            const d = await res.json();
                            const meta = d?.chart?.result?.[0]?.meta;
                            if (meta?.regularMarketPrice) return parseFloat(meta.regularMarketPrice);
                        }
                    } catch (e) { console.error("Yahoo error", e); }
                    return null;
                };

                // Fetch Final Price
                const final_price = await getPrice();

                if (final_price === null || isNaN(final_price)) {
                    console.log(`Final price unavailable for ${symbol}`);
                    if (isOverdue) {
                        console.log(`Marking ${pred.id} as Data Unavailable (Price fetch failed, overdue)`);
                        await supabase.from('predictions').update({
                            outcome: 'Data Unavailable',
                            evaluation_time: now.toISOString()
                        }).eq('id', pred.id);
                    }
                    continue;
                }

                // Reference Price Check
                // If prediction was 'opening' and has no reference_price, we MIGHT need to fill it?
                // But typically reference_price should be set at creation or by an 'opening-validator'.
                // If null, we can't judge direction.
                if (pred.reference_price === null) {
                    console.log(`Skipping pred ${pred.id}: No reference price.`);
                    if (isOverdue) {
                        console.log(`Marking ${pred.id} as Data Unavailable (No Reference Price, overdue)`);
                        await supabase.from('predictions').update({
                            outcome: 'Data Unavailable',
                            evaluation_time: now.toISOString()
                        }).eq('id', pred.id);
                    }
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

                console.log(`Validated Stock ${pred.id} (${symbol}): ${outcome}. Ref: ${refPrice}, Final: ${final_price}`);

            } catch (err) {
                console.error(`Error processing pred ${pred.id}:`, err);
            }
        }

        return { statusCode: 200 };

    } catch (e) {
        console.error("Critical error in stocks scheduled function:", e);
        return { statusCode: 500 };
    }
};

export const handler = schedule('* * * * *', scheduledTask);
