-- Create verified_reports table
create table if not exists verified_reports (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verivo_score numeric(10, 2) not null,
  credible_accuracy numeric(10, 1) not null,
  confidence_factor numeric(10, 2) not null,
  total_predictions integer not null,
  correct_predictions integer not null
);

-- RLS
alter table verified_reports enable row level security;

-- Allow public read (anyone can verify a report if they have the ID)
create policy "Public read access" 
on verified_reports for select 
using (true);

-- Allow users to insert via function only (no direct insert)
-- We do NOT create an insert policy for users.

-- Function to generate report
create or replace function create_verified_report()
returns verified_reports
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
  v_score numeric;
  v_accuracy numeric;
  v_confidence numeric;
  v_total int;
  v_correct int;
  new_report_id text;
  new_report verified_reports;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Fetch Metrics
  select 
    coalesce(accuracy_percentage, 0),
    coalesce(total_predictions, 0),
    coalesce(correct_predictions, 0)
  into v_accuracy, v_total, v_correct
  from user_credibility_scores
  where user_id = current_user_id and type = 'overall'
  limit 1;

  -- Verivo Score
  select coalesce(verivo_score, 0)
  into v_score
  from user_verivo_scores
  where user_id = current_user_id
  limit 1;

  -- Confidence Factor
  select coalesce(confidence_factor, 0)
  into v_confidence
  from user_confidence_factor
  where user_id = current_user_id
  limit 1;

  -- Generate ID: VR-YYYY-XXXXXX
  new_report_id := 'VR-' || to_char(now(), 'YYYY') || '-' || upper(substring(md5(random()::text), 1, 6));

  -- Insert
  insert into verified_reports (
    id, user_id, verivo_score, credible_accuracy, confidence_factor, total_predictions, correct_predictions
  ) values (
    new_report_id, current_user_id, v_score, v_accuracy, v_confidence, v_total, v_correct
  )
  returning * into new_report;

  return new_report;
end;
$$;

-- Grant execute to authenticated users
grant execute on function create_verified_report to authenticated;
