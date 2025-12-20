-- Create the verivo_users table
create table public.verivo_users (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  interests text[],
  geography text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.verivo_users enable row level security;

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.verivo_users for insert
  with check ( auth.uid() = id );

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
  on public.verivo_users for select
  using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
  on public.verivo_users for update
  using ( auth.uid() = id );
