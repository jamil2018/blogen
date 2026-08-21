-- Phase 1 Stage A: post lifecycle, library, revisions, reports, aggregates, richer profiles.

-- ---------------------------------------------------------------------------
-- Post status + publishing metadata
-- ---------------------------------------------------------------------------

create type public.post_status as enum (
  'draft',
  'scheduled',
  'published',
  'archived'
);

alter table public.posts
  add column if not exists status public.post_status not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists scheduled_at timestamptz,
  add column if not exists slug text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text;

-- Backfill existing rows as published
update public.posts
set
  status = 'published',
  published_at = coalesce(published_at, created_at),
  slug = coalesce(
    nullif(slug, ''),
    lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
      || '-' || substr(id::text, 1, 8)
  )
where status = 'draft' and published_at is null;

-- Unique slug among published posts (partial unique index)
create unique index if not exists posts_slug_published_unique
  on public.posts (slug)
  where status = 'published' and slug is not null;

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc nulls last);

create index if not exists posts_author_status_idx
  on public.posts (author_id, status);

-- ---------------------------------------------------------------------------
-- Profile enrichment
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists expertise_topics text[] not null default '{}',
  add column if not exists website_url text;

-- ---------------------------------------------------------------------------
-- Library
-- ---------------------------------------------------------------------------

create table if not exists public.library_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists library_items_user_created_idx
  on public.library_items (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Post revisions (append-only on publish)
-- ---------------------------------------------------------------------------

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  revision_number integer not null,
  title text not null,
  description text not null,
  summary text not null,
  cover_url text,
  cover_path text,
  tags text[] not null default '{}',
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text,
  seo_title text,
  seo_description text,
  canonical_url text,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create index if not exists post_revisions_post_id_idx
  on public.post_revisions (post_id, revision_number desc);

-- ---------------------------------------------------------------------------
-- Reports + moderation audit
-- ---------------------------------------------------------------------------

create type public.report_target_type as enum ('post', 'comment');
create type public.report_status as enum ('open', 'reviewed', 'dismissed', 'actioned');

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_created_idx
  on public.reports (status, created_at desc);

create table if not exists public.moderation_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete cascade,
  report_id uuid references public.reports (id) on delete set null,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Aggregate RPCs (published-only)
-- ---------------------------------------------------------------------------

create or replace function public.public_post_counts_by_author(p_author_id uuid default null)
returns table (author_id uuid, post_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.author_id, count(*)::bigint as post_count
  from public.posts p
  where p.status = 'published'
    and (p_author_id is null or p.author_id = p_author_id)
  group by p.author_id;
$$;

create or replace function public.public_post_counts_by_category(p_category_id uuid default null)
returns table (category_id uuid, post_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.category_id, count(*)::bigint as post_count
  from public.posts p
  where p.status = 'published'
    and (p_category_id is null or p.category_id = p_category_id)
  group by p.category_id;
$$;

create or replace function public.public_platform_stats()
returns table (
  published_posts bigint,
  authors_with_posts bigint,
  categories_with_posts bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::bigint from public.posts where status = 'published') as published_posts,
    (select count(distinct author_id)::bigint from public.posts where status = 'published') as authors_with_posts,
    (select count(distinct category_id)::bigint from public.posts where status = 'published') as categories_with_posts;
$$;

revoke all on function public.public_post_counts_by_author(uuid) from public;
revoke all on function public.public_post_counts_by_category(uuid) from public;
revoke all on function public.public_platform_stats() from public;
grant execute on function public.public_post_counts_by_author(uuid) to anon, authenticated, service_role;
grant execute on function public.public_post_counts_by_category(uuid) to anon, authenticated, service_role;
grant execute on function public.public_platform_stats() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table public.library_items to authenticated, service_role;
grant select on table public.library_items to anon;

grant select, insert on table public.post_revisions to authenticated, service_role;
grant select on table public.post_revisions to anon;

grant select, insert, update on table public.reports to authenticated, service_role;
grant select, insert on table public.moderation_audit_log to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: posts — public sees published only; authors see own; admins full
-- ---------------------------------------------------------------------------

drop policy if exists "posts_select_public" on public.posts;

create policy "posts_select_published_or_owner_or_admin"
  on public.posts for select
  to anon, authenticated
  using (
    status = 'published'
    or author_id = (select auth.uid())
    or (select private.is_admin())
  );

-- ---------------------------------------------------------------------------
-- RLS: library_items — owner only
-- ---------------------------------------------------------------------------

alter table public.library_items enable row level security;

create policy "library_items_select_own"
  on public.library_items for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "library_items_insert_own"
  on public.library_items for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "library_items_delete_own"
  on public.library_items for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: post_revisions — public can read revisions of published posts
-- ---------------------------------------------------------------------------

alter table public.post_revisions enable row level security;

create policy "post_revisions_select_published_or_owner_or_admin"
  on public.post_revisions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.status = 'published'
          or p.author_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

create policy "post_revisions_insert_author_or_admin"
  on public.post_revisions for insert
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

-- ---------------------------------------------------------------------------
-- RLS: reports
-- ---------------------------------------------------------------------------

alter table public.reports enable row level security;
alter table public.moderation_audit_log enable row level security;

create policy "reports_insert_authenticated"
  on public.reports for insert
  to authenticated
  with check (reporter_id = (select auth.uid()));

create policy "reports_select_own_or_admin"
  on public.reports for select
  to authenticated
  using (
    reporter_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "reports_update_admin"
  on public.reports for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "moderation_audit_select_admin"
  on public.moderation_audit_log for select
  to authenticated
  using ((select private.is_admin()));

create policy "moderation_audit_insert_admin"
  on public.moderation_audit_log for insert
  to authenticated
  with check (
    actor_id = (select auth.uid())
    and (select private.is_admin())
  );
