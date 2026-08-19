-- Blogen core schema, RLS, admin helper, and profile bootstrap trigger.

create extension if not exists pg_trgm with schema extensions;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text unique,
  bio text,
  facebook_id text,
  linkedin_id text,
  twitter_id text,
  avatar_url text,
  avatar_path text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  summary text not null,
  cover_url text,
  cover_path text,
  author_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id);
create index posts_category_id_idx on public.posts (category_id);
create index posts_tags_gin_idx on public.posts using gin (tags);
create index posts_title_trgm_idx on public.posts using gin (title extensions.gin_trgm_ops);
create index comments_post_id_idx on public.comments (post_id);
create index comments_created_at_idx on public.comments (created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function private.set_updated_at();

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin helper (never read user_metadata for authorization)
-- ---------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_admin = true
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Prevent non-admins from toggling is_admin (defense in depth beyond RLS).
create or replace function private.protect_profile_admin_flag()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and not (select private.is_admin()) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin_flag
  before update on public.profiles
  for each row execute function private.protect_profile_admin_flag();

-- ---------------------------------------------------------------------------
-- Auth bootstrap: create a profiles row for every new auth user
-- ---------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies; Data API no longer auto-exposes new tables)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on table public.categories to anon, authenticated, service_role;
grant select, insert, update, delete on table public.posts to anon, authenticated, service_role;
grant select, insert, update, delete on table public.comments to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using ((select private.is_admin()));

-- categories
create policy "categories_select_public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories_insert_admin"
  on public.categories for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "categories_update_admin"
  on public.categories for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "categories_delete_admin"
  on public.categories for delete
  to authenticated
  using ((select private.is_admin()));

-- posts
create policy "posts_select_public"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "posts_insert_author"
  on public.posts for insert
  to authenticated
  with check (author_id = (select auth.uid()));

create policy "posts_update_author_or_admin"
  on public.posts for update
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select private.is_admin())
  )
  with check (
    author_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "posts_delete_author_or_admin"
  on public.posts for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select private.is_admin())
  );

-- comments
create policy "comments_select_public"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  to authenticated
  with check (author_id = (select auth.uid()));

create policy "comments_update_author_or_admin"
  on public.comments for update
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select private.is_admin())
  )
  with check (
    author_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "comments_delete_author_or_admin"
  on public.comments for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select private.is_admin())
  );
