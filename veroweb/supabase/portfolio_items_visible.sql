alter table public.portfolio_items
  add column if not exists visible boolean not null default true;