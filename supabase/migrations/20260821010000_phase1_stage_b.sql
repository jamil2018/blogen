-- Phase 1 Stage B: follows, reading progress, slug redirects, distribution prefs, content hash.

-- ---------------------------------------------------------------------------
-- Follows (author | category | publication — pubs arrive in Stage C)
-- ---------------------------------------------------------------------------

create type public.follow_target_type as enum (
  'author',
  'category',
  'publication'
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, target_type, target_id)
);

create index if not exists follows_follower_created_idx
  on public.follows (follower_id, created_at desc);

create index if not exists follows_target_idx
  on public.follows (target_type, target_id);

-- ---------------------------------------------------------------------------
-- Reading continuity
-- ---------------------------------------------------------------------------

create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  position numeric(5, 2) not null default 0
    check (position >= 0 and position <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists reading_progress_user_updated_idx
  on public.reading_progress (user_id, updated_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  reading_progress_enabled boolean not null default true,
  notify_email boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function private.set_updated_at();

create trigger reading_progress_set_updated_at
  before update on public.reading_progress
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Writer distribution + import hash + slug redirects
-- ---------------------------------------------------------------------------

alter table public.posts
  add column if not exists distribute_web boolean not null default true,
  add column if not exists distribute_followers boolean not null default true,
  add column if not exists distribute_email boolean not null default false,
  add column if not exists content_hash text;

create table if not exists public.post_slug_redirects (
  old_slug text primary key,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists post_slug_redirects_post_id_idx
  on public.post_slug_redirects (post_id);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, delete on table public.follows to authenticated, service_role;
grant select on table public.follows to anon;

grant select, insert, update, delete on table public.reading_progress to authenticated, service_role;

grant select, insert, update, delete on table public.user_preferences to authenticated, service_role;

grant select on table public.post_slug_redirects to anon, authenticated, service_role;
grant insert, delete on table public.post_slug_redirects to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.follows enable row level security;

create policy "follows_select_own"
  on public.follows for select
  to authenticated
  using (follower_id = (select auth.uid()));

create policy "follows_insert_own"
  on public.follows for insert
  to authenticated
  with check (follower_id = (select auth.uid()));

create policy "follows_delete_own"
  on public.follows for delete
  to authenticated
  using (follower_id = (select auth.uid()));

-- Public count of followers is optional; allow anon to count via RPC only.
-- Authors can see follower count for themselves via select on own follows only.

alter table public.reading_progress enable row level security;

create policy "reading_progress_select_own"
  on public.reading_progress for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "reading_progress_insert_own"
  on public.reading_progress for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "reading_progress_update_own"
  on public.reading_progress for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "reading_progress_delete_own"
  on public.reading_progress for delete
  to authenticated
  using (user_id = (select auth.uid()));

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own"
  on public.user_preferences for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "user_preferences_update_own"
  on public.user_preferences for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_preferences_delete_own"
  on public.user_preferences for delete
  to authenticated
  using (user_id = (select auth.uid()));

alter table public.post_slug_redirects enable row level security;

create policy "post_slug_redirects_select_public"
  on public.post_slug_redirects for select
  to anon, authenticated
  using (true);

create policy "post_slug_redirects_insert_author_or_admin"
  on public.post_slug_redirects for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.author_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

create policy "post_slug_redirects_delete_author_or_admin"
  on public.post_slug_redirects for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.author_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );
