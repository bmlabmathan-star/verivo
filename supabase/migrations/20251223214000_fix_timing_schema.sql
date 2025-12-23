-- Change target_date to allow precise timestamps (needed for minutes/hours duration)
ALTER TABLE public.predictions
ALTER COLUMN target_date TYPE TIMESTAMPTZ USING target_date::TIMESTAMPTZ;

-- Add column to store the duration in minutes
ALTER TABLE public.predictions
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
