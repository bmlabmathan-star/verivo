-- Create the predictions table
create table public.predictions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  category text,
  region text,
  direction text,
  target_date date,
  is_locked boolean default true,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.predictions enable row level security;

-- Policy: Users can insert their own predictions
create policy "Users can insert their own predictions"
  on public.predictions for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can view their own predictions
create policy "Users can view their own predictions"
  on public.predictions for select
  using ( auth.uid() = user_id );

-- Note: No UPDATE policy is created to enforce immutability.
