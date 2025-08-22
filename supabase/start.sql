-- start.sql — Initialize Supabase database from scratch for Game Online app
-- Safe to run on a fresh project. Includes auth profiles, friends, chat, games, and storage policies.

-- ===============
-- Extensions
-- ===============
create extension if not exists pgcrypto;

-- Optional hardening, matches existing schema
alter default privileges revoke execute on functions from public;

-- ===============
-- Profiles (public.users) and Friends
-- ===============
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.friends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  friend_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending','accepted','blocked')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, friend_id)
);

create index if not exists idx_friends_user_id on public.friends(user_id);
create index if not exists idx_friends_friend_id on public.friends(friend_id);
create index if not exists idx_friends_status on public.friends(status);

alter table public.users enable row level security;
alter table public.friends enable row level security;

-- Drop policies if they already exist (for idempotency)
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can search other users" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;

create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can search other users" on public.users
  for select using (auth.uid() is not null and auth.uid() <> id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- Friends policies

drop policy if exists "Users can view their own friendships" on public.friends;
drop policy if exists "Users can create friend requests" on public.friends;
drop policy if exists "Users can update their own friend requests" on public.friends;
drop policy if exists "Users can delete their own friendships" on public.friends;

create policy "Users can view their own friendships" on public.friends
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create friend requests" on public.friends
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own friend requests" on public.friends
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can delete their own friendships" on public.friends
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- updated_at common function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Auto profile creation on new auth user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers

drop trigger if exists handle_users_updated_at on public.users;
create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();


drop trigger if exists handle_friends_updated_at on public.friends;
create trigger handle_friends_updated_at
  before update on public.friends
  for each row execute function public.handle_updated_at();

-- ===============
-- Chat: conversations and messages
-- ===============
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  participant_1 uuid references public.users(id) on delete cascade not null,
  participant_2 uuid references public.users(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(participant_1, participant_2),
  check (participant_1 <> participant_2)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  message_type text check (message_type in ('text','image','file')) default 'text',
  is_read boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_conversations_participant_1 on public.conversations(participant_1);
create index if not exists idx_conversations_participant_2 on public.conversations(participant_2);
create index if not exists idx_conversations_last_message_at on public.conversations(last_message_at);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies (drop-if-exists for idempotency)
drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;
drop policy if exists "Users can update their own conversations" on public.conversations;

drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can send messages in their conversations" on public.messages;
drop policy if exists "Users can update their own messages" on public.messages;

create policy "Users can view their own conversations" on public.conversations
  for select using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Users can create conversations" on public.conversations
  for insert with check (auth.uid() = participant_1);

create policy "Users can update their own conversations" on public.conversations
  for update using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Users can view messages in their conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Users can send messages in their conversations" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Users can update their own messages" on public.messages
  for update using (auth.uid() = sender_id);

-- Update conversation timestamp on new message
create or replace function public.update_conversation_last_message()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = new.created_at, updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- updated_at triggers for chat

drop trigger if exists handle_conversations_updated_at on public.conversations;
create trigger handle_conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();


drop trigger if exists handle_messages_updated_at on public.messages;
create trigger handle_messages_updated_at
  before update on public.messages
  for each row execute function public.handle_updated_at();

-- ===============
-- Games catalog + storage bucket policies
-- ===============
-- Create enum type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_visibility') THEN
    CREATE TYPE public.game_visibility AS ENUM ('public','private');
  END IF;
END$$;

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

-- updated_at trigger for games
create or replace function public.handle_games_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_games_updated_at on public.games;
create trigger handle_games_updated_at
  before update on public.games
  for each row execute function public.handle_games_updated_at();

-- RLS policies for games (drop-if-exists for idempotency)
drop policy if exists "Anyone can read public games" on public.games;
drop policy if exists "Only authenticated can insert games" on public.games;
drop policy if exists "Only authenticated can update games" on public.games;
drop policy if exists "Only authenticated can delete games" on public.games;

create policy "Anyone can read public games" on public.games
  for select using (visibility = 'public');

create policy "Only authenticated can insert games" on public.games
  for insert with check (auth.uid() is not null);

create policy "Only authenticated can update games" on public.games
  for update using (auth.uid() is not null);

create policy "Only authenticated can delete games" on public.games
  for delete using (auth.uid() is not null);

-- ===============
-- Storage bucket: games
-- ===============
insert into storage.buckets (id, name, public)
values ('games','games', true)
on conflict (id) do nothing;

-- Storage policies for bucket 'games'
drop policy if exists "Public read games bucket" on storage.objects;
create policy "Public read games bucket" on storage.objects
  for select using (bucket_id = 'games');
  
drop policy if exists "Authenticated upload to games bucket" on storage.objects;
create policy "Authenticated upload to games bucket" on storage.objects
  for insert with check (bucket_id = 'games' and auth.uid() is not null);
  
drop policy if exists "Authenticated update games bucket" on storage.objects;
create policy "Authenticated update games bucket" on storage.objects
  for update using (bucket_id = 'games' and auth.uid() is not null);
  
drop policy if exists "Authenticated delete games bucket" on storage.objects;
create policy "Authenticated delete games bucket" on storage.objects
  for delete using (bucket_id = 'games' and auth.uid() is not null);
