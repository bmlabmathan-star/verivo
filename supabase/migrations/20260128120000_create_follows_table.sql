-- Create follows table for Follow/Following feature
create table if not exists public.follows (
  id uuid not null default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  expert_id uuid not null references public.experts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (id),
  unique (follower_id, expert_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- Policies
create policy "Anyone can read follows"
  on public.follows for select
  using (true);

create policy "Users can follow experts"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow experts"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- Instructions: Run this in Supabase SQL Editor to enable the feature.
