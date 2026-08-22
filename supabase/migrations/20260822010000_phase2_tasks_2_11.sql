-- Phase 2 Tasks 2–11: collections, annotations, structure metadata, reuse, paths, spaces.

-- Extend analytics enum for Phase 2 funnel (Task 11)
alter type public.analytics_event_name add value if not exists 'library_save';
alter type public.analytics_event_name add value if not exists 'collection_created';
alter type public.analytics_event_name add value if not exists 'source_added_to_collection';
alter type public.analytics_event_name add value if not exists 'collection_intent_set';
alter type public.analytics_event_name add value if not exists 'annotation_created';
alter type public.analytics_event_name add value if not exists 'space_promoted';
alter type public.analytics_event_name add value if not exists 'reading_path_saved';
alter type public.analytics_event_name add value if not exists 'reading_path_started';

-- ---------------------------------------------------------------------------
-- Collections (Tasks 2, 4, 10)
-- ---------------------------------------------------------------------------

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  intent text,
  promoted_to_space_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_owner_updated_idx
  on public.collections (owner_user_id, updated_at desc);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  source_reference_id uuid not null references public.source_references (id) on delete restrict,
  bound_post_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (collection_id, bound_post_id)
);

create index if not exists collection_items_collection_sort_idx
  on public.collection_items (collection_id, sort_order asc);

-- ---------------------------------------------------------------------------
-- Passage annotations (Task 5)
-- ---------------------------------------------------------------------------

create table if not exists public.passage_annotations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  source_reference_id uuid not null references public.source_references (id) on delete cascade,
  passage jsonb not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists passage_annotations_collection_idx
  on public.passage_annotations (collection_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Post structural metadata (Task 6)
-- ---------------------------------------------------------------------------

create table if not exists public.post_structural_metadata (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  revision_id uuid references public.post_revisions (id) on delete set null,
  revision_number integer not null check (revision_number >= 0),
  sections jsonb not null default '[]'::jsonb,
  citations jsonb not null default '[]'::jsonb,
  referenced_post_ids uuid[] not null default '{}',
  tags text[] not null default '{}',
  author_id uuid,
  published_at timestamptz,
  extracted_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create index if not exists post_structural_metadata_post_idx
  on public.post_structural_metadata (post_id, revision_number desc);

-- ---------------------------------------------------------------------------
-- Author reuse permissions (Task 7)
-- ---------------------------------------------------------------------------

alter table public.posts
  add column if not exists reuse_private_spaces boolean not null default true,
  add column if not exists reuse_public_lineage boolean not null default true,
  add column if not exists reuse_quotation boolean not null default true,
  add column if not exists reuse_synthesis boolean not null default false;

-- ---------------------------------------------------------------------------
-- Reading paths (Task 8)
-- ---------------------------------------------------------------------------

create type public.reading_path_relationship as enum (
  'introduces',
  'extends',
  'applies',
  'challenges'
);

create table if not exists public.reading_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  purpose text not null,
  estimated_minutes integer,
  created_by uuid references public.profiles (id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_path_items (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.reading_paths (id) on delete cascade,
  bound_post_id uuid not null,
  sort_order integer not null default 0,
  relationship_label public.reading_path_relationship,
  transition_note text,
  created_at timestamptz not null default now(),
  unique (path_id, bound_post_id)
);

create index if not exists reading_path_items_path_sort_idx
  on public.reading_path_items (path_id, sort_order asc);

-- ---------------------------------------------------------------------------
-- Knowledge spaces (Task 10)
-- ---------------------------------------------------------------------------

create table if not exists public.knowledge_spaces (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null unique references public.collections (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_space_activity (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.knowledge_spaces (id) on delete cascade,
  kind text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_space_activity_space_idx
  on public.knowledge_space_activity (space_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function private.set_updated_at();

create trigger passage_annotations_set_updated_at
  before update on public.passage_annotations
  for each row execute function private.set_updated_at();

create trigger reading_paths_set_updated_at
  before update on public.reading_paths
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table public.collections to authenticated, service_role;
grant select, insert, update, delete on table public.collection_items to authenticated, service_role;
grant select, insert, update, delete on table public.passage_annotations to authenticated, service_role;
grant select on table public.post_structural_metadata to authenticated, service_role;
grant select, insert, update, delete on table public.post_structural_metadata to service_role;
grant select, insert, update, delete on table public.reading_paths to authenticated, service_role;
grant select, insert, update, delete on table public.reading_path_items to authenticated, service_role;
grant select, insert, update, delete on table public.knowledge_spaces to authenticated, service_role;
grant select, insert on table public.knowledge_space_activity to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.passage_annotations enable row level security;
alter table public.post_structural_metadata enable row level security;
alter table public.reading_paths enable row level security;
alter table public.reading_path_items enable row level security;
alter table public.knowledge_spaces enable row level security;
alter table public.knowledge_space_activity enable row level security;

create policy "collections_owner_all"
  on public.collections for all
  to authenticated
  using (owner_user_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_user_id = (select auth.uid()) or (select private.is_admin()));

create policy "collection_items_via_collection_owner"
  on public.collection_items for all
  to authenticated
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and (c.owner_user_id = (select auth.uid()) or (select private.is_admin()))
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and (c.owner_user_id = (select auth.uid()) or (select private.is_admin()))
    )
  );

create policy "passage_annotations_owner_all"
  on public.passage_annotations for all
  to authenticated
  using (owner_user_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_user_id = (select auth.uid()) or (select private.is_admin()));

create policy "post_structural_metadata_select_published"
  on public.post_structural_metadata for select
  to authenticated, anon
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

create policy "post_structural_metadata_insert_service"
  on public.post_structural_metadata for insert
  to authenticated, service_role
  with check (true);

create policy "reading_paths_select_published"
  on public.reading_paths for select
  to anon, authenticated
  using (is_published = true or created_by = (select auth.uid()) or (select private.is_admin()));

create policy "reading_paths_mutate_author_admin"
  on public.reading_paths for all
  to authenticated
  using (created_by = (select auth.uid()) or (select private.is_admin()))
  with check (created_by = (select auth.uid()) or (select private.is_admin()));

create policy "reading_path_items_select_via_path"
  on public.reading_path_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.reading_paths rp
      where rp.id = path_id
        and (
          rp.is_published = true
          or rp.created_by = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

create policy "reading_path_items_mutate_via_path"
  on public.reading_path_items for all
  to authenticated
  using (
    exists (
      select 1 from public.reading_paths rp
      where rp.id = path_id
        and (rp.created_by = (select auth.uid()) or (select private.is_admin()))
    )
  )
  with check (
    exists (
      select 1 from public.reading_paths rp
      where rp.id = path_id
        and (rp.created_by = (select auth.uid()) or (select private.is_admin()))
    )
  );

create policy "knowledge_spaces_owner_all"
  on public.knowledge_spaces for all
  to authenticated
  using (owner_user_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_user_id = (select auth.uid()) or (select private.is_admin()));

create policy "knowledge_space_activity_via_space"
  on public.knowledge_space_activity for all
  to authenticated
  using (
    exists (
      select 1 from public.knowledge_spaces ks
      where ks.id = space_id
        and (ks.owner_user_id = (select auth.uid()) or (select private.is_admin()))
    )
  )
  with check (
    exists (
      select 1 from public.knowledge_spaces ks
      where ks.id = space_id
        and (ks.owner_user_id = (select auth.uid()) or (select private.is_admin()))
    )
  );
