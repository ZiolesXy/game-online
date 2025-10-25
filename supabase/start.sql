-- start.sql — Initialize Supabase database from scratch for Game Online app
-- Safe to run on a fresh project. Includes auth profiles, friends, chat, games, and storage policies.
-- Updated with Google OAuth support and safe user creation

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
  username text, -- Allow NULL temporarily for safe OAuth signup
  full_name text,
  avatar_url text,
  provider text default 'email',
  provider_id text,
  profile_completed boolean default true,
  banned boolean not null default false,
  banned_reason text,
  banned_at timestamptz,
  banned_by uuid references public.users(id) on delete set null,
  role text check (role in ('user','admin')) default 'user',
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

-- Optional: prevent banned users from selecting others via a view/RLS adjustment (app may also enforce at auth layer)

-- ===============
-- Admin RPCs: assert_admin, ban_user, unban_user, kick_user
-- ===============

-- Helper to ensure caller is an admin
create or replace function public.assert_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  ) then
    raise exception 'Forbidden: admin only';
  end if;
end;
$$;

-- Ban user: set banned=true
create or replace function public.ban_user(p_user_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  update public.users
     set banned = true,
         banned_reason = p_reason,
         banned_at = now(),
         banned_by = auth.uid(),
         updated_at = now()
   where id = p_user_id;
end;
$$;

-- Unban user: set banned=false
create or replace function public.unban_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  update public.users
     set banned = false,
         banned_reason = null,
         banned_at = null,
         banned_by = null,
         updated_at = now()
   where id = p_user_id;
end;
$$;


grant execute on function public.assert_admin() to authenticated;
grant execute on function public.ban_user(uuid, text) to authenticated;
grant execute on function public.unban_user(uuid) to authenticated;

-- Change role RPC
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_admin();
  if p_role not in ('user','admin') then
    raise exception 'Invalid role %', p_role;
  end if;
  update public.users
     set role = p_role,
         updated_at = now()
   where id = p_user_id;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

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

-- Safe user profile creation function (no automatic triggers)
create or replace function public.create_user_profile(
  user_id uuid,
  user_email text,
  base_username text default null,
  user_full_name text default null,
  user_provider text default 'email',
  user_provider_id text default null,
  user_avatar_url text default null
)
returns public.users as $$
declare
  final_username text;
  result public.users;
begin
  -- Generate unique username
  if base_username is null or base_username = '' then
    base_username := split_part(user_email, '@', 1);
  end if;
  
  final_username := lower(regexp_replace(base_username, '[^a-z0-9_]+', '_', 'g'));
  
  -- Try with suffix if needed
  while exists (select 1 from public.users where username = final_username) loop
    final_username := base_username || '_' || substr(md5(random()::text), 1, 6);
  end loop;

  -- Insert user
  insert into public.users (
    id, email, username, full_name, provider, provider_id, avatar_url, 
    profile_completed, created_at, updated_at
  ) values (
    user_id, user_email, final_username, user_full_name, user_provider, 
    user_provider_id, user_avatar_url, false, now(), now()
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    full_name = coalesce(excluded.full_name, users.full_name),
    provider = excluded.provider,
    provider_id = excluded.provider_id,
    avatar_url = coalesce(excluded.avatar_url, users.avatar_url),
    updated_at = now()
  returning * into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- Note: No automatic triggers for user creation to avoid OAuth conflicts
-- App will call create_user_profile() manually via AuthService.ensureUserRecord()

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
-- Game Requests table
-- ===============
create table if not exists public.game_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text check (category in ('Strategi','Aksi','Horor','Arcade','Puzzle')) default 'Arcade',
  file_path text not null, -- path to uploaded zip file in requests bucket
  status text check (status in ('waiting','accepted','declined')) default 'waiting',
  admin_notes text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_game_requests_user_id on public.game_requests(user_id);
create index if not exists idx_game_requests_status on public.game_requests(status);
create index if not exists idx_game_requests_created_at on public.game_requests(created_at);

alter table public.game_requests enable row level security;

-- updated_at trigger for game_requests
drop trigger if exists handle_game_requests_updated_at on public.game_requests;
create trigger handle_game_requests_updated_at
  before update on public.game_requests
  for each row execute function public.handle_updated_at();

-- RLS policies for game_requests
drop policy if exists "Users can view their own requests" on public.game_requests;
drop policy if exists "Users can create requests" on public.game_requests;
drop policy if exists "Users can update their own requests" on public.game_requests;
drop policy if exists "Admins can view all requests" on public.game_requests;
drop policy if exists "Admins can update all requests" on public.game_requests;

create policy "Users can view their own requests" on public.game_requests
  for select using (auth.uid() = user_id);

create policy "Users can create requests" on public.game_requests
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own requests" on public.game_requests
  for update using (auth.uid() = user_id and status = 'waiting');

create policy "Admins can view all requests" on public.game_requests
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from public.users u 
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Admins can update all requests" on public.game_requests
  for update using (
    exists (
      select 1 from public.users u 
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ===============
-- Storage buckets: games and requests
-- ===============
insert into storage.buckets (id, name, public)
values ('games','games', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('requests','requests', false)
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

-- Storage policies for bucket 'requests'
drop policy if exists "Users can upload to requests bucket" on storage.objects;
create policy "Users can upload to requests bucket" on storage.objects
  for insert with check (bucket_id = 'requests' and auth.uid() is not null);

drop policy if exists "Users can read their own requests" on storage.objects;
create policy "Users can read their own requests" on storage.objects
  for select using (
    bucket_id = 'requests' and 
    auth.uid() is not null and
    (auth.uid()::text = (storage.foldername(name))[1])
  );

drop policy if exists "Admins can read all requests" on storage.objects;
create policy "Admins can read all requests" on storage.objects
  for select using (
    bucket_id = 'requests' and
    exists (
      select 1 from public.users u 
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

drop policy if exists "Admins can delete requests" on storage.objects;
create policy "Admins can delete requests" on storage.objects
  for delete using (
    bucket_id = 'requests' and
    exists (
      select 1 from public.users u 
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
