alter table public.portfolio_items
  add column if not exists carousel_visible boolean not null default true;