-- Verivo Score v1.1 View Definition (Corrected Confidence Logic)
-- This view calculates user performance metrics based on prediction history.

CREATE OR REPLACE VIEW public.user_verivo_scores AS
WITH prediction_weights AS (
  SELECT
    user_id,
    outcome,
    -- Assign weights based on duration tiers
    CASE
      WHEN duration_minutes <= 5 THEN 0.1
      WHEN duration_minutes <= 10 THEN 0.2
      WHEN duration_minutes <= 30 THEN 0.5
      WHEN duration_minutes <= 60 THEN 0.8
      ELSE 1.0 -- Covers 3 hours (180 mins) and longer durations
    END as weight
  FROM
    predictions
  WHERE
    outcome IS NOT NULL
),
user_aggregates AS (
  SELECT
    user_id,
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN outcome = 'Correct' THEN 1 END) as correct_predictions,
    SUM(CASE WHEN outcome = 'Correct' THEN weight ELSE 0 END) as verivo_score,
    SUM(weight) as total_possible_weight
  FROM
    prediction_weights
  GROUP BY
    user_id
)
SELECT
  user_id,
  total_predictions,
  correct_predictions,
  
  -- Raw Accuracy: Correct / Total
  ROUND((correct_predictions::numeric / total_predictions), 4) as raw_accuracy,
  
  -- Weighted Accuracy: Weighted Score / Total Possible Weight
  ROUND((verivo_score::numeric / NULLIF(total_possible_weight, 0)), 4) as weighted_accuracy,
  
  -- Confidence Factor: Timeframe Quality Based (Average Difficulty/Weight)
  -- Logic: Total Weight Potential / Total Count
  -- This creates a factor between 0.1 and 1.0 representing the "average difficulty" of predictions attempted.
  ROUND((total_possible_weight::numeric / NULLIF(total_predictions, 0)), 4) as confidence_factor,
  
  -- Credible Accuracy: Weighted Accuracy scaled by Confidence
  -- Logic: (Weighted Score / Total Weight) * (Total Weight / Total Count) = Weighted Score / Total Count
  -- This represents the "Value per Prediction"
  ROUND(
    (
      (verivo_score::numeric / NULLIF(total_possible_weight, 0)) * 
      (total_possible_weight::numeric / NULLIF(total_predictions, 0))
    ), 4
  ) as credible_accuracy,
  
  -- Verivo Score: Sum of weights for correct predictions
  ROUND(verivo_score::numeric, 2) as verivo_score

FROM
  user_aggregates
WHERE
  total_predictions >= 10;
