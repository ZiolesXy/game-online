-- games table and policies
create type public.game_visibility as enum ('public', 'private');

create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  author text,
  category text check (category in ('Strategi','Aksi','Horor','Arcade','Puzzle')) default 'Arcade',
  storage_prefix text not null, -- e.g., games/nightmare-house
  entry_file text not null default 'index.html',
  cover_path text, -- e.g., games/nightmare-house/cover.jpg
  visibility public.game_visibility not null default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.games enable row level security;

create index if not exists idx_games_slug on public.games(slug);
create index if not exists idx_games_category on public.games(category);

-- updated_at trigger
create or replace function public.handle_games_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_games_updated_at
  before update on public.games
  for each row execute function public.handle_games_updated_at();

-- RLS policies
create policy "Anyone can read public games" on public.games
  for select using (visibility = 'public');

create policy "Only authenticated can insert games" on public.games
  for insert with check (auth.uid() is not null);

create policy "Only authenticated can update games" on public.games
  for update using (auth.uid() is not null);

create policy "Only authenticated can delete games" on public.games
  for delete using (auth.uid() is not null);
