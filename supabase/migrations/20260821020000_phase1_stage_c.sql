-- Phase 1 Stage C: publications, editorial workflow, subscriptions, newsletters.

-- ---------------------------------------------------------------------------
-- C1. Publications
-- ---------------------------------------------------------------------------

create type public.publication_member_role as enum (
  'owner',
  'editor',
  'contributor'
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text not null default '',
  tagline text,
  about text,
  logo_url text,
  logo_path text,
  cover_url text,
  cover_path text,
  accent_color text,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  welcome_email_subject text,
  welcome_email_body text,
  welcome_email_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publications_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create unique index if not exists publications_slug_unique
  on public.publications (slug);

create index if not exists publications_owner_id_idx
  on public.publications (owner_id);

create trigger publications_set_updated_at
  before update on public.publications
  for each row execute function private.set_updated_at();

create table if not exists public.publication_members (
  publication_id uuid not null references public.publications (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.publication_member_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (publication_id, user_id)
);

create index if not exists publication_members_user_id_idx
  on public.publication_members (user_id);

create trigger publication_members_set_updated_at
  before update on public.publication_members
  for each row execute function private.set_updated_at();

create table if not exists public.publication_sections (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publication_id, slug)
);

create index if not exists publication_sections_pub_sort_idx
  on public.publication_sections (publication_id, sort_order);

create trigger publication_sections_set_updated_at
  before update on public.publication_sections
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- C2. Editorial workflow
-- ---------------------------------------------------------------------------

create type public.submission_status as enum (
  'submitted',
  'changes_requested',
  'accepted',
  'rejected',
  'scheduled',
  'published'
);

create type public.distribution_mode as enum (
  'web_only',
  'email_only',
  'web_and_email'
);

alter table public.posts
  add column if not exists publication_id uuid references public.publications (id) on delete set null,
  add column if not exists section_id uuid references public.publication_sections (id) on delete set null,
  add column if not exists submission_status public.submission_status,
  add column if not exists distribution_mode public.distribution_mode not null default 'web_only';

create index if not exists posts_publication_id_idx
  on public.posts (publication_id)
  where publication_id is not null;

create index if not exists posts_publication_submission_idx
  on public.posts (publication_id, submission_status)
  where publication_id is not null;

create table if not exists public.publication_audit_log (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete set null,
  action text not null,
  from_status public.submission_status,
  to_status public.submission_status,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists publication_audit_log_pub_created_idx
  on public.publication_audit_log (publication_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link_path text,
  publication_id uuid references public.publications (id) on delete set null,
  post_id uuid references public.posts (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- C3. Subscriptions + newsletters
-- ---------------------------------------------------------------------------

create type public.subscription_target_type as enum (
  'publication',
  'author'
);

create type public.subscription_status as enum (
  'pending',
  'active',
  'unsubscribed',
  'suppressed'
);

create type public.subscription_source as enum (
  'web',
  'import',
  'welcome',
  'admin'
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  target_type public.subscription_target_type not null,
  target_id uuid not null,
  email text not null,
  user_id uuid references public.profiles (id) on delete set null,
  status public.subscription_status not null default 'pending',
  source public.subscription_source not null default 'web',
  consent_at timestamptz,
  consent_attestation text,
  unsubscribed_at timestamptz,
  confirmed_at timestamptz,
  welcome_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_email_format check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create unique index if not exists subscriptions_target_email_unique
  on public.subscriptions (target_type, target_id, lower(email));

create index if not exists subscriptions_target_status_idx
  on public.subscriptions (target_type, target_id, status);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id)
  where user_id is not null;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();

create table if not exists public.email_suppressions (
  email text primary key,
  reason text not null,
  source text not null default 'resend_webhook',
  resend_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger email_suppressions_set_updated_at
  before update on public.email_suppressions
  for each row execute function private.set_updated_at();

create type public.newsletter_status as enum (
  'draft',
  'preview',
  'scheduled',
  'sending',
  'sent',
  'failed',
  'cancelled'
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references public.publications (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete set null,
  subject text not null,
  preview_text text,
  html_body text not null default '',
  distribution_mode public.distribution_mode not null default 'web_and_email',
  status public.newsletter_status not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletters_owner_present check (
    publication_id is not null or author_id is not null
  )
);

create index if not exists newsletters_publication_status_idx
  on public.newsletters (publication_id, status)
  where publication_id is not null;

create index if not exists newsletters_scheduled_idx
  on public.newsletters (scheduled_at)
  where status = 'scheduled';

create trigger newsletters_set_updated_at
  before update on public.newsletters
  for each row execute function private.set_updated_at();

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  email text not null,
  resend_message_id text,
  status text not null default 'queued',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_deliveries_newsletter_idx
  on public.newsletter_deliveries (newsletter_id, created_at desc);

create unique index if not exists newsletter_deliveries_resend_message_unique
  on public.newsletter_deliveries (resend_message_id)
  where resend_message_id is not null;

create table if not exists public.resend_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id)
);

-- ---------------------------------------------------------------------------
-- Membership helpers (security definer for RLS)
-- ---------------------------------------------------------------------------

create or replace function private.publication_role(p_publication_id uuid)
returns public.publication_member_role
language sql
stable
security definer
set search_path = ''
as $$
  select pm.role
  from public.publication_members pm
  where pm.publication_id = p_publication_id
    and pm.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function private.is_publication_member(
  p_publication_id uuid,
  p_roles public.publication_member_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.publication_members pm
    where pm.publication_id = p_publication_id
      and pm.user_id = (select auth.uid())
      and (
        p_roles is null
        or pm.role = any (p_roles)
      )
  );
$$;

revoke all on function private.publication_role(uuid) from public;
revoke all on function private.is_publication_member(uuid, public.publication_member_role[]) from public;
grant execute on function private.publication_role(uuid) to authenticated;
grant execute on function private.is_publication_member(uuid, public.publication_member_role[]) to authenticated;

-- Keep owner membership in sync when a publication is created/owner changes.
create or replace function private.ensure_publication_owner_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.publication_members (publication_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (publication_id, user_id) do update
    set role = 'owner', updated_at = now();

  if tg_op = 'UPDATE'
     and old.owner_id is distinct from new.owner_id then
    update public.publication_members
    set role = 'editor', updated_at = now()
    where publication_id = new.id
      and user_id = old.owner_id
      and role = 'owner';
  end if;

  return new;
end;
$$;

drop trigger if exists publications_ensure_owner_member on public.publications;
create trigger publications_ensure_owner_member
  after insert or update of owner_id on public.publications
  for each row execute function private.ensure_publication_owner_member();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on table public.publications to anon, authenticated, service_role;
grant insert, update, delete on table public.publications to authenticated, service_role;

grant select on table public.publication_members to anon, authenticated, service_role;
grant insert, update, delete on table public.publication_members to authenticated, service_role;

grant select on table public.publication_sections to anon, authenticated, service_role;
grant insert, update, delete on table public.publication_sections to authenticated, service_role;

grant select, insert on table public.publication_audit_log to authenticated, service_role;

grant select, insert, update, delete on table public.notifications to authenticated, service_role;

grant select, insert, update on table public.subscriptions to anon, authenticated, service_role;
grant delete on table public.subscriptions to authenticated, service_role;

grant select on table public.email_suppressions to authenticated, service_role;
grant insert, update, delete on table public.email_suppressions to service_role;

grant select on table public.newsletters to anon, authenticated, service_role;
grant insert, update, delete on table public.newsletters to authenticated, service_role;

grant select on table public.newsletter_deliveries to authenticated, service_role;
grant insert, update on table public.newsletter_deliveries to authenticated, service_role;

grant select, insert, update on table public.resend_webhook_events to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.publications enable row level security;
alter table public.publication_members enable row level security;
alter table public.publication_sections enable row level security;
alter table public.publication_audit_log enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.email_suppressions enable row level security;
alter table public.newsletters enable row level security;
alter table public.newsletter_deliveries enable row level security;
alter table public.resend_webhook_events enable row level security;

-- Publications: public read; owners/editors manage
create policy "publications_select_public"
  on public.publications for select
  to anon, authenticated
  using (true);

create policy "publications_insert_authenticated"
  on public.publications for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "publications_update_owner_or_editor"
  on public.publications for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    or (select private.is_publication_member(
      id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  )
  with check (
    owner_id = (select auth.uid())
    or (select private.is_publication_member(
      id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  );

create policy "publications_delete_owner_or_admin"
  on public.publications for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    or (select private.is_admin())
  );

-- Members
create policy "publication_members_select_public"
  on public.publication_members for select
  to anon, authenticated
  using (true);

create policy "publication_members_insert_owner_or_editor"
  on public.publication_members for insert
  to authenticated
  with check (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
    -- Allow creator bootstrap: owner inserting self as owner
    or (
      user_id = (select auth.uid())
      and role = 'owner'
      and exists (
        select 1 from public.publications p
        where p.id = publication_id and p.owner_id = (select auth.uid())
      )
    )
  );

create policy "publication_members_update_owner_or_editor"
  on public.publication_members for update
  to authenticated
  using (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  )
  with check (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  );

create policy "publication_members_delete_owner_or_editor"
  on public.publication_members for delete
  to authenticated
  using (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
    or user_id = (select auth.uid())
  );

-- Sections
create policy "publication_sections_select_public"
  on public.publication_sections for select
  to anon, authenticated
  using (true);

create policy "publication_sections_write_owner_or_editor"
  on public.publication_sections for insert
  to authenticated
  with check (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  );

create policy "publication_sections_update_owner_or_editor"
  on public.publication_sections for update
  to authenticated
  using (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  )
  with check (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  );

create policy "publication_sections_delete_owner_or_editor"
  on public.publication_sections for delete
  to authenticated
  using (
    (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
    or (select private.is_admin())
  );

-- Audit log
create policy "publication_audit_select_members"
  on public.publication_audit_log for select
  to authenticated
  using (
    (select private.is_publication_member(publication_id))
    or (select private.is_admin())
  );

create policy "publication_audit_insert_members"
  on public.publication_audit_log for insert
  to authenticated
  with check (
    actor_id = (select auth.uid())
    and (
      (select private.is_publication_member(publication_id))
      or (select private.is_admin())
    )
  );

-- Notifications
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "notifications_insert_authenticated"
  on public.notifications for insert
  to authenticated
  with check (true);

create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Subscriptions: owners/editors manage target lists; subscribers manage own email rows
create policy "subscriptions_select_owner_or_self"
  on public.subscriptions for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_admin())
    or (
      target_type = 'publication'
      and (select private.is_publication_member(
        target_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or (
      target_type = 'author'
      and target_id = (select auth.uid())
    )
  );

create policy "subscriptions_insert_public_or_owner"
  on public.subscriptions for insert
  to anon, authenticated
  with check (
    status in ('pending', 'active')
    or (select private.is_admin())
    or (
      target_type = 'publication'
      and (select private.is_publication_member(
        target_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or (
      target_type = 'author'
      and target_id = (select auth.uid())
    )
  );

create policy "subscriptions_update_owner_or_self"
  on public.subscriptions for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_admin())
    or (
      target_type = 'publication'
      and (select private.is_publication_member(
        target_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or (
      target_type = 'author'
      and target_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    or (select private.is_admin())
    or (
      target_type = 'publication'
      and (select private.is_publication_member(
        target_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or (
      target_type = 'author'
      and target_id = (select auth.uid())
    )
  );

create policy "subscriptions_delete_owner"
  on public.subscriptions for delete
  to authenticated
  using (
    (select private.is_admin())
    or (
      target_type = 'publication'
      and (select private.is_publication_member(
        target_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or (
      target_type = 'author'
      and target_id = (select auth.uid())
    )
  );

-- Suppressions: service role only (no authenticated policies)
create policy "email_suppressions_service_select"
  on public.email_suppressions for select
  to authenticated
  using ((select private.is_admin()));

-- Newsletters
create policy "newsletters_select_public_sent_or_member"
  on public.newsletters for select
  to anon, authenticated
  using (
    status = 'sent'
    or (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(publication_id))
    )
    or author_id = (select auth.uid())
    or created_by = (select auth.uid())
  );

create policy "newsletters_insert_member_or_author"
  on public.newsletters for insert
  to authenticated
  with check (
    (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(
        publication_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or author_id = (select auth.uid())
  );

create policy "newsletters_update_member_or_author"
  on public.newsletters for update
  to authenticated
  using (
    (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(
        publication_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or author_id = (select auth.uid())
  )
  with check (
    (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(
        publication_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or author_id = (select auth.uid())
  );

create policy "newsletters_delete_member_or_author"
  on public.newsletters for delete
  to authenticated
  using (
    (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(
        publication_id,
        array['owner', 'editor']::public.publication_member_role[]
      ))
    )
    or author_id = (select auth.uid())
  );

create policy "newsletter_deliveries_select_member"
  on public.newsletter_deliveries for select
  to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.newsletters n
      where n.id = newsletter_id
        and (
          (
            n.publication_id is not null
            and (select private.is_publication_member(
              n.publication_id,
              array['owner', 'editor']::public.publication_member_role[]
            ))
          )
          or n.author_id = (select auth.uid())
        )
    )
  );

create policy "newsletter_deliveries_insert_member"
  on public.newsletter_deliveries for insert
  to authenticated
  with check (
    (select private.is_admin())
    or exists (
      select 1 from public.newsletters n
      where n.id = newsletter_id
        and (
          (
            n.publication_id is not null
            and (select private.is_publication_member(
              n.publication_id,
              array['owner', 'editor']::public.publication_member_role[]
            ))
          )
          or n.author_id = (select auth.uid())
        )
    )
  );

-- Expand post select so publication members can see submissions
drop policy if exists "posts_select_published_or_owner_or_admin" on public.posts;

create policy "posts_select_published_or_owner_or_admin_or_pub_member"
  on public.posts for select
  to anon, authenticated
  using (
    status = 'published'
    or author_id = (select auth.uid())
    or (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(publication_id))
    )
  );

-- Members (editors/owners) may update submission workflow fields on pub posts
create policy "posts_update_publication_editors"
  on public.posts for update
  to authenticated
  using (
    publication_id is not null
    and (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
  )
  with check (
    publication_id is not null
    and (select private.is_publication_member(
      publication_id,
      array['owner', 'editor']::public.publication_member_role[]
    ))
  );
