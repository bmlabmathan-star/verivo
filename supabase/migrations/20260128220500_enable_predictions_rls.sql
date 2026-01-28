alter table public.predictions enable row level security;

create policy "Predictions are publicly readable"
on public.predictions
for select
using (true);
