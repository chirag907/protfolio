-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

create table if not exists public.links (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, url text not null, created_at timestamptz not null default now());
create table if not exists public.contacts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, phone text, email text, note text,
  starred boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.notes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, body text,
  pinned boolean not null default false, created_at timestamptz not null default now());

alter table public.links enable row level security;
alter table public.contacts enable row level security;
alter table public.notes enable row level security;

drop policy if exists "owner manages links" on public.links;
create policy "owner manages links" on public.links for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "owner manages contacts" on public.contacts;
create policy "owner manages contacts" on public.contacts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "owner manages notes" on public.notes;
create policy "owner manages notes" on public.notes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('files', 'files', false) on conflict (id) do nothing;
drop policy if exists "owner reads files" on storage.objects;
create policy "owner reads files" on storage.objects for select to authenticated using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owner uploads files" on storage.objects;
create policy "owner uploads files" on storage.objects for insert to authenticated with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owner deletes files" on storage.objects;
create policy "owner deletes files" on storage.objects for delete to authenticated using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);


-- ===== Portfolio (public to read, editable only by you) =====
create table if not exists public.site_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.site_admins enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.site_admins where user_id = auth.uid()) $$;

create table if not exists public.portfolio (
  id bigint generated always as identity primary key,
  kind text not null default 'project' check (kind in ('project','profile')),
  title text not null, summary text, url text, tags text, image text,
  sort_order int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now());
alter table public.portfolio enable row level security;
drop policy if exists "public reads portfolio" on public.portfolio;
create policy "public reads portfolio" on public.portfolio for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "admin edits portfolio" on public.portfolio;
create policy "admin edits portfolio" on public.portfolio for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict (id) do nothing;
drop policy if exists "admin uploads portfolio images" on storage.objects;
create policy "admin uploads portfolio images" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and public.is_admin());
drop policy if exists "admin changes portfolio images" on storage.objects;
create policy "admin changes portfolio images" on storage.objects for update to authenticated using (bucket_id = 'portfolio' and public.is_admin());
drop policy if exists "admin deletes portfolio images" on storage.objects;
create policy "admin deletes portfolio images" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());

-- Make YOUR account the owner. Create/sign in to your account on the site first, then run this line
-- (it is safe to run again; it does nothing if the account does not exist yet):
insert into public.site_admins (user_id) select id from auth.users where email = 'chiraglakhera3@gmail.com' on conflict do nothing;

-- ===== Version 3 additions (safe to run again) =====
alter table public.contacts add column if not exists deleted_at timestamptz;
alter table public.links add column if not exists deleted_at timestamptz;
alter table public.notes add column if not exists deleted_at timestamptz;

create table if not exists public.file_pins (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  path text not null, primary key (user_id, path));
alter table public.file_pins enable row level security;
drop policy if exists "owner manages file pins" on public.file_pins;
create policy "owner manages file pins" on public.file_pins for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- let each person move their own files into / out of their recycle bin folder
drop policy if exists "owner moves files" on storage.objects;
create policy "owner moves files" on storage.objects for update to authenticated
  using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);

-- editable website text (public read, owner write)
create table if not exists public.site_text (key text primary key, value text not null default '', updated_at timestamptz not null default now());
alter table public.site_text enable row level security;
drop policy if exists "public reads site text" on public.site_text;
create policy "public reads site text" on public.site_text for select to anon, authenticated using (true);
drop policy if exists "admin edits site text" on public.site_text;
create policy "admin edits site text" on public.site_text for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- public pinboard (public read, owner write)
create table if not exists public.pinboard (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('link','note','image','video','yt','file')),
  title text, body text, url text, media text,
  x numeric not null default 0, y numeric not null default 0, w numeric not null default 260, h numeric not null default 180, z int not null default 0,
  created_at timestamptz not null default now());
alter table public.pinboard enable row level security;
drop policy if exists "public reads pinboard" on public.pinboard;
create policy "public reads pinboard" on public.pinboard for select to anon, authenticated using (true);
drop policy if exists "admin edits pinboard" on public.pinboard;
create policy "admin edits pinboard" on public.pinboard for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('pinboard', 'pinboard', true) on conflict (id) do nothing;
drop policy if exists "admin adds pinboard media" on storage.objects;
create policy "admin adds pinboard media" on storage.objects for insert to authenticated with check (bucket_id = 'pinboard' and public.is_admin());
drop policy if exists "admin removes pinboard media" on storage.objects;
create policy "admin removes pinboard media" on storage.objects for delete to authenticated using (bucket_id = 'pinboard' and public.is_admin());

-- owner-only user list: names, emails and dates. Passwords are never stored or shown by this site.
create or replace function public.admin_list_users()
returns table (id uuid, email text, name text, created_at timestamptz, last_sign_in_at timestamptz)
language sql stable security definer set search_path = public, auth
as $$ select u.id, u.email::text, coalesce(u.raw_user_meta_data->>'display_name','')::text, u.created_at, u.last_sign_in_at
      from auth.users u where public.is_admin() order by u.created_at desc $$;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
