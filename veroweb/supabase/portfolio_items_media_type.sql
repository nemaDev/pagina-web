alter table public.portfolio_items
  add column if not exists media_type text not null default 'image';