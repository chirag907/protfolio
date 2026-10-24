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
