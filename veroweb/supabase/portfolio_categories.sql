create table if not exists public.portfolio_categories (
  name text primary key,
  visible boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.portfolio_categories enable row level security;

create policy "Public can read portfolio categories"
  on public.portfolio_categories
  for select
  using (true);

create policy "Public can manage portfolio categories"
  on public.portfolio_categories
  for all
  using (true)
  with check (true);