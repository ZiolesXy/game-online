-- Create public storage bucket for games and policies
-- Create bucket if not exists
insert into storage.buckets (id, name, public)
values ('games', 'games', true)
on conflict (id) do nothing;

-- Policies on storage.objects for bucket 'games'
-- Allow anyone to read/list objects in games bucket
drop policy if exists "Public read games bucket" on storage.objects;
create policy "Public read games bucket" on storage.objects
  for select using (bucket_id = 'games');

-- Allow authenticated users to insert (upload) to games bucket
drop policy if exists "Authenticated upload to games bucket" on storage.objects;
create policy "Authenticated upload to games bucket" on storage.objects
  for insert with check (
    bucket_id = 'games' and auth.uid() is not null
  );

-- Allow authenticated users to update their objects in games bucket
drop policy if exists "Authenticated update games bucket" on storage.objects;
create policy "Authenticated update games bucket" on storage.objects
  for update using (
    bucket_id = 'games' and auth.uid() is not null
  );

-- Allow authenticated users to delete their objects in games bucket
drop policy if exists "Authenticated delete games bucket" on storage.objects;
create policy "Authenticated delete games bucket" on storage.objects
  for delete using (
    bucket_id = 'games' and auth.uid() is not null
  );
