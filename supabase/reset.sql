-- reset.sql — Complete database reset for Game Online app
-- WARNING: This will delete ALL data including users, games, messages, etc.
-- Only run this on development databases, never on production!

-- ===============
-- Drop all tables and functions in reverse dependency order
-- ===============

-- Drop storage policies first
drop policy if exists "Public read games bucket" on storage.objects;
drop policy if exists "Authenticated upload to games bucket" on storage.objects;
drop policy if exists "Authenticated update games bucket" on storage.objects;
drop policy if exists "Authenticated delete games bucket" on storage.objects;
drop policy if exists "Users can upload to requests bucket" on storage.objects;
drop policy if exists "Users can read their own requests" on storage.objects;
drop policy if exists "Admins can read all requests" on storage.objects;
drop policy if exists "Admins can delete requests" on storage.objects;

-- Remove storage buckets
-- First delete all objects belonging to those buckets to satisfy FK constraints
-- Handle both possible column names: bucket_id (standard) and bucketId (legacy)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'objects' AND column_name = 'bucket_id'
  ) THEN
    DELETE FROM storage.objects WHERE bucket_id IN ('games', 'requests');
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'objects' AND column_name = 'bucketId'
  ) THEN
    DELETE FROM storage.objects WHERE bucketId IN ('games', 'requests');
  END IF;
END $$;
delete from storage.buckets where id in ('games', 'requests');

-- Drop all triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_google on auth.users;
drop trigger if exists handle_users_updated_at on public.users;
drop trigger if exists handle_friends_updated_at on public.friends;
drop trigger if exists handle_conversations_updated_at on public.conversations;
drop trigger if exists handle_messages_updated_at on public.messages;
drop trigger if exists handle_games_updated_at on public.games;
drop trigger if exists handle_game_requests_updated_at on public.game_requests;
drop trigger if exists on_message_created on public.messages;

-- Drop all RLS policies
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can search other users" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;

drop policy if exists "Users can view their own friendships" on public.friends;
drop policy if exists "Users can create friend requests" on public.friends;
drop policy if exists "Users can update their own friend requests" on public.friends;
drop policy if exists "Users can delete their own friendships" on public.friends;

drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;
drop policy if exists "Users can update their own conversations" on public.conversations;

drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can send messages in their conversations" on public.messages;
drop policy if exists "Users can update their own messages" on public.messages;

drop policy if exists "Anyone can read public games" on public.games;
drop policy if exists "Only authenticated can insert games" on public.games;
drop policy if exists "Only authenticated can update games" on public.games;
drop policy if exists "Only authenticated can delete games" on public.games;

drop policy if exists "Users can view their own requests" on public.game_requests;
drop policy if exists "Users can create requests" on public.game_requests;
drop policy if exists "Users can update their own requests" on public.game_requests;
drop policy if exists "Admins can view all requests" on public.game_requests;
drop policy if exists "Admins can update all requests" on public.game_requests;

-- Drop all tables in reverse dependency order
drop table if exists public.game_requests cascade;
drop table if exists public.games cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.friends cascade;
drop table if exists public.users cascade;

-- Drop custom types
drop type if exists public.game_visibility cascade;

-- Drop all functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_google_oauth_user() cascade;
drop function if exists public.create_user_profile(uuid, text, text, text, text, text, text) cascade;
drop function if exists public.generate_unique_username(text) cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.handle_games_updated_at() cascade;
drop function if exists public.update_conversation_last_message() cascade;
drop function if exists public.assert_admin() cascade;
drop function if exists public.ban_user(uuid) cascade;
drop function if exists public.unban_user(uuid) cascade;
drop function if exists public.kick_user(uuid) cascade;
drop function if exists public.set_user_role(uuid, text) cascade;

-- Clean up any remaining auth users (CAREFUL: This deletes all user accounts!)
-- Uncomment the next line only if you want to completely reset authentication
-- delete from auth.users;

-- ===============
-- Reset complete
-- ===============
-- Database is now clean and ready for fresh setup
-- Run start.sql to recreate all tables, functions, and policies
