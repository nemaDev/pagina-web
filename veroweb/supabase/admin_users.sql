create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Public can read admin user registry"
  on public.admin_users
  for select
  using (true);

create policy "Public can manage admin user registry"
  on public.admin_users
  for all
  using (true)
  with check (true);