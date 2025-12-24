-- Create a view to calculate credibility scores based on user prediction outcomes
-- Requirements:
-- 1. Compute user accuracy based on prediction outcome.
-- 2. Split accuracy by duration_minutes buckets: 5, 10, 30, 60.
-- 3. Compute total predictions, correct predictions, and accuracy percentage per bucket.
-- 4. Also compute overall accuracy across all durations.
-- 5. Do not show accuracy for buckets with fewer than 10 predictions.

CREATE OR REPLACE VIEW public.user_credibility_scores AS
WITH bucket_stats AS (
    SELECT
        user_id,
        duration_minutes,
        COUNT(*) AS total_predictions,
        COUNT(*) FILTER (WHERE outcome = 'Correct') AS correct_predictions
    FROM
        public.predictions
    WHERE
        outcome IN ('Correct', 'Incorrect')
        AND duration_minutes IN (5, 10, 30, 60)
    GROUP BY
        user_id,
        duration_minutes
),
overall_stats AS (
    SELECT
        user_id,
        COUNT(*) AS total_predictions,
        COUNT(*) FILTER (WHERE outcome = 'Correct') AS correct_predictions
    FROM
        public.predictions
    WHERE
        outcome IN ('Correct', 'Incorrect')
    GROUP BY
        user_id
)
SELECT
    b.user_id,
    b.duration_minutes,
    b.total_predictions,
    b.correct_predictions,
    ROUND((b.correct_predictions::numeric / b.total_predictions::numeric) * 100, 2) AS accuracy_percentage,
    'bucket' AS type
FROM
    bucket_stats b
WHERE
    b.total_predictions >= 10

UNION ALL

SELECT
    o.user_id,
    NULL AS duration_minutes,
    o.total_predictions,
    o.correct_predictions,
    ROUND((o.correct_predictions::numeric / o.total_predictions::numeric) * 100, 2) AS accuracy_percentage,
    'overall' AS type
FROM
    overall_stats o
WHERE
    o.total_predictions >= 10;

-- Grant access to authenticated users
GRANT SELECT ON public.user_credibility_scores TO authenticated;
GRANT SELECT ON public.user_credibility_scores TO service_role;
