-- Phase 1: games table, storage buckets, RLS
-- Run in Supabase SQL Editor or via supabase db push

-- Games catalogue (aligns with Data Org schema)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  type text not null check (type in ('2D', '3D')),
  cover_path text,
  trailer_url text,
  demo_path text,
  build_path text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'HKD',
  store_links jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_published_sort_idx
  on public.games (published, sort_order, created_at desc);

create index if not exists games_slug_idx on public.games (slug);

-- updated_at trigger
create or replace function public.set_games_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_games_updated_at();

-- RLS
alter table public.games enable row level security;

-- Public can read published rows only
drop policy if exists "Public read published games" on public.games;
create policy "Public read published games"
  on public.games
  for select
  to anon, authenticated
  using (published = true);

-- Authenticated users can read all (admin list)
drop policy if exists "Authenticated read all games" on public.games;
create policy "Authenticated read all games"
  on public.games
  for select
  to authenticated
  using (true);

-- Writes: authenticated only
drop policy if exists "Authenticated insert games" on public.games;
create policy "Authenticated insert games"
  on public.games
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated update games" on public.games;
create policy "Authenticated update games"
  on public.games
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete games" on public.games;
create policy "Authenticated delete games"
  on public.games
  for delete
  to authenticated
  using (true);

-- Storage buckets: covers / demos / builds
insert into storage.buckets (id, name, public)
values
  ('covers', 'covers', true),
  ('demos', 'demos', true),
  ('builds', 'builds', true)
on conflict (id) do update set public = excluded.public;

-- Public read on all three buckets
drop policy if exists "Public read covers" on storage.objects;
create policy "Public read covers"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'covers');

drop policy if exists "Public read demos" on storage.objects;
create policy "Public read demos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'demos');

drop policy if exists "Public read builds" on storage.objects;
create policy "Public read builds"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'builds');

-- Authenticated write (upload / update / delete)
drop policy if exists "Authenticated write covers" on storage.objects;
create policy "Authenticated write covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "Authenticated update covers" on storage.objects;
create policy "Authenticated update covers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers')
  with check (bucket_id = 'covers');

drop policy if exists "Authenticated delete covers" on storage.objects;
create policy "Authenticated delete covers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'covers');

drop policy if exists "Authenticated write demos" on storage.objects;
create policy "Authenticated write demos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'demos');

drop policy if exists "Authenticated update demos" on storage.objects;
create policy "Authenticated update demos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'demos')
  with check (bucket_id = 'demos');

drop policy if exists "Authenticated delete demos" on storage.objects;
create policy "Authenticated delete demos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'demos');

drop policy if exists "Authenticated write builds" on storage.objects;
create policy "Authenticated write builds"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'builds');

drop policy if exists "Authenticated update builds" on storage.objects;
create policy "Authenticated update builds"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'builds')
  with check (bucket_id = 'builds');

drop policy if exists "Authenticated delete builds" on storage.objects;
create policy "Authenticated delete builds"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'builds');
