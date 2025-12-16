-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create experts table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('equity', 'commodity', 'currency', 'crypto')),
  asset_name TEXT NOT NULL,
  prediction TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  direction TEXT CHECK (direction IN ('up', 'down', 'neutral')),
  event_date DATE NOT NULL,
  event_close_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_locked BOOLEAN DEFAULT true,
  is_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create validations table
CREATE TABLE IF NOT EXISTS public.validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  actual_value NUMERIC,
  is_correct BOOLEAN,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create expert_stats table (materialized view or table)
CREATE TABLE IF NOT EXISTS public.expert_stats (
  expert_id UUID PRIMARY KEY REFERENCES public.experts(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy_rate NUMERIC DEFAULT 0,
  verivo_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_expert ON public.predictions(expert_id);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON public.predictions(category);
CREATE INDEX IF NOT EXISTS idx_predictions_event_date ON public.predictions(event_date);
CREATE INDEX IF NOT EXISTS idx_predictions_is_revealed ON public.predictions(is_revealed);
CREATE INDEX IF NOT EXISTS idx_validations_prediction ON public.validations(prediction_id);

-- Enable Row Level Security
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experts
CREATE POLICY "Experts are viewable by everyone" ON public.experts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own expert profile" ON public.experts
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own expert profile" ON public.experts
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for predictions
CREATE POLICY "Predictions are viewable by everyone" ON public.predictions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own predictions" ON public.predictions
  FOR INSERT WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Users can update their own predictions" ON public.predictions
  FOR UPDATE USING (auth.uid() = expert_id);

-- RLS Policies for validations
CREATE POLICY "Validations are viewable by everyone" ON public.validations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert validations" ON public.validations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for expert_stats
CREATE POLICY "Expert stats are viewable by everyone" ON public.expert_stats
  FOR SELECT USING (true);

-- Function to update expert stats
CREATE OR REPLACE FUNCTION update_expert_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.expert_stats (expert_id, total_predictions, correct_predictions, accuracy_rate, verivo_score)
  SELECT 
    p.expert_id,
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE v.is_correct = true) as correct_predictions,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE v.is_correct = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as accuracy_rate,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE v.is_correct = true)::NUMERIC / COUNT(*)::NUMERIC) * 100)
      ELSE 0
    END as verivo_score
  FROM public.predictions p
  LEFT JOIN public.validations v ON p.id = v.prediction_id
  WHERE p.expert_id = NEW.expert_id AND p.is_revealed = true
  GROUP BY p.expert_id
  ON CONFLICT (expert_id) DO UPDATE SET
    total_predictions = EXCLUDED.total_predictions,
    correct_predictions = EXCLUDED.correct_predictions,
    accuracy_rate = EXCLUDED.accuracy_rate,
    verivo_score = EXCLUDED.verivo_score,
    last_updated = TIMEZONE('utc'::text, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when validation is created
CREATE TRIGGER update_stats_on_validation
  AFTER INSERT OR UPDATE ON public.validations
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_stats();



