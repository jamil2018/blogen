-- Phase 2 Task 1: revision-safe source references, tombstones, library pinning.

-- ---------------------------------------------------------------------------
-- Source references (provenance primitive for library, collections, annotations)
-- ---------------------------------------------------------------------------

create table if not exists public.source_references (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  bound_post_id uuid not null,
  post_revision_id uuid references public.post_revisions (id) on delete set null,
  revision_number integer not null check (revision_number >= 0),
  passage jsonb,
  frozen_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists source_references_owner_idx
  on public.source_references (owner_user_id, created_at desc);

create index if not exists source_references_bound_post_idx
  on public.source_references (bound_post_id);

create index if not exists source_references_revision_idx
  on public.source_references (post_revision_id)
  where post_revision_id is not null;

-- ---------------------------------------------------------------------------
-- Tombstones for deleted posts (library + future derived artifacts)
-- ---------------------------------------------------------------------------

create table if not exists public.post_source_tombstones (
  post_id uuid primary key,
  title text not null,
  author_id uuid,
  reason text not null default 'deleted'
    check (reason in ('deleted')),
  frozen_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Library items: survive post deletion; pin revision at first save
-- ---------------------------------------------------------------------------

alter table public.library_items
  add column if not exists id uuid,
  add column if not exists bound_post_id uuid,
  add column if not exists source_reference_id uuid references public.source_references (id) on delete set null;

update public.library_items
set
  id = coalesce(id, gen_random_uuid()),
  bound_post_id = coalesce(bound_post_id, post_id)
where id is null or bound_post_id is null;

alter table public.library_items
  alter column id set default gen_random_uuid(),
  alter column id set not null,
  alter column bound_post_id set not null;

-- Replace composite PK with surrogate id; one save per user/post identity.
alter table public.library_items drop constraint if exists library_items_pkey;

alter table public.library_items
  add constraint library_items_pkey primary key (id);

create unique index if not exists library_items_user_bound_post_unique
  on public.library_items (user_id, bound_post_id);

-- Allow library rows to outlive deleted posts.
alter table public.library_items drop constraint if exists library_items_post_id_fkey;

alter table public.library_items
  add constraint library_items_post_id_fkey
  foreign key (post_id) references public.posts (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Backfill source references for existing library saves
-- ---------------------------------------------------------------------------

insert into public.source_references (
  owner_user_id,
  bound_post_id,
  post_revision_id,
  revision_number,
  created_at
)
select
  li.user_id,
  li.bound_post_id,
  pr.id,
  pr.revision_number,
  li.created_at
from public.library_items li
join lateral (
  select id, revision_number
  from public.post_revisions
  where post_id = li.bound_post_id
  order by revision_number desc
  limit 1
) pr on true
where li.source_reference_id is null;

insert into public.source_references (
  owner_user_id,
  bound_post_id,
  revision_number,
  created_at
)
select
  li.user_id,
  li.bound_post_id,
  0,
  li.created_at
from public.library_items li
where li.source_reference_id is null;

update public.library_items li
set source_reference_id = sr.id
from public.source_references sr
where li.source_reference_id is null
  and sr.owner_user_id = li.user_id
  and sr.bound_post_id = li.bound_post_id
  and sr.created_at = li.created_at;

-- ---------------------------------------------------------------------------
-- Freeze references before post hard-delete
-- ---------------------------------------------------------------------------

create or replace function private.freeze_source_references_on_post_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest_rev record;
  snap jsonb;
begin
  select pr.id, pr.revision_number, pr.title, pr.summary, pr.slug, pr.published_at
  into latest_rev
  from public.post_revisions pr
  where pr.post_id = old.id
  order by pr.revision_number desc
  limit 1;

  snap := jsonb_build_object(
    'title', coalesce(latest_rev.title, old.title),
    'summary', coalesce(latest_rev.summary, old.summary),
    'revisionNumber', coalesce(latest_rev.revision_number, 0),
    'revisionId', latest_rev.id,
    'slug', coalesce(latest_rev.slug, old.slug),
    'publishedAt', coalesce(latest_rev.published_at, old.published_at)
  );

  insert into public.post_source_tombstones (post_id, title, author_id, reason, frozen_snapshot)
  values (
    old.id,
    coalesce(latest_rev.title, old.title),
    old.author_id,
    'deleted',
    snap
  )
  on conflict (post_id) do update
  set
    title = excluded.title,
    author_id = excluded.author_id,
    frozen_snapshot = excluded.frozen_snapshot;

  update public.source_references sr
  set
    frozen_snapshot = coalesce(
      (
        select jsonb_build_object(
          'title', pr.title,
          'summary', pr.summary,
          'revisionNumber', pr.revision_number,
          'revisionId', pr.id,
          'slug', pr.slug,
          'publishedAt', pr.published_at
        )
        from public.post_revisions pr
        where pr.id = sr.post_revision_id
      ),
      snap
    ),
    post_revision_id = null
  where sr.bound_post_id = old.id;

  return old;
end;
$$;

drop trigger if exists posts_freeze_source_references_before_delete on public.posts;

create trigger posts_freeze_source_references_before_delete
  before delete on public.posts
  for each row execute function private.freeze_source_references_on_post_delete();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table public.source_references to authenticated, service_role;
grant select on table public.post_source_tombstones to authenticated, service_role;
grant select, insert, update, delete on table public.post_source_tombstones to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.source_references enable row level security;
alter table public.post_source_tombstones enable row level security;

create policy "source_references_select_own_or_admin"
  on public.source_references for select
  to authenticated
  using (
    owner_user_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "source_references_insert_own"
  on public.source_references for insert
  to authenticated
  with check (owner_user_id = (select auth.uid()));

create policy "source_references_update_own_or_admin"
  on public.source_references for update
  to authenticated
  using (
    owner_user_id = (select auth.uid())
    or (select private.is_admin())
  )
  with check (
    owner_user_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "source_references_delete_own"
  on public.source_references for delete
  to authenticated
  using (owner_user_id = (select auth.uid()));

create policy "post_source_tombstones_select_authenticated"
  on public.post_source_tombstones for select
  to authenticated
  using (true);
