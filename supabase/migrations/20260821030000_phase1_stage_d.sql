-- Phase 1 Stage D: creator analytics, paid memberships, Stripe Connect ledger, trust ops.

-- ---------------------------------------------------------------------------
-- D1. Analytics events + daily rollups
-- ---------------------------------------------------------------------------

create type public.analytics_event_name as enum (
  'view',
  'read_complete',
  'follow',
  'unfollow',
  'subscribe',
  'unsubscribe',
  'checkout_start',
  'checkout_complete',
  'membership_cancel',
  'membership_refund',
  'email_open',
  'email_click'
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name public.analytics_event_name not null,
  occurred_at timestamptz not null default now(),
  -- Privacy-minimized: optional authenticated subject; never store email/PAN/IP plaintext
  actor_user_id uuid references public.profiles (id) on delete set null,
  -- Opaque session hash (client-generated UUID hashed server-side); not a browser fingerprint
  session_hash text,
  post_id uuid references public.posts (id) on delete set null,
  publication_id uuid references public.publications (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  -- Host-only referrer, truncated path, channel bucket — no full URLs or query strings
  payload jsonb not null default '{}'::jsonb,
  constraint analytics_events_payload_size check (pg_column_size(payload) < 2048)
);

create index if not exists analytics_events_occurred_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_post_name_idx
  on public.analytics_events (post_id, event_name, occurred_at desc)
  where post_id is not null;

create index if not exists analytics_events_author_name_idx
  on public.analytics_events (author_id, event_name, occurred_at desc)
  where author_id is not null;

create index if not exists analytics_events_publication_name_idx
  on public.analytics_events (publication_id, event_name, occurred_at desc)
  where publication_id is not null;

-- Daily rollups for studio dashboards (recomputed by ingest / cron)
create table if not exists public.analytics_daily_rollups (
  day date not null,
  scope_type text not null check (scope_type in ('author', 'publication', 'post', 'platform')),
  -- Platform scope uses nil UUID; never null (PK)
  scope_id uuid not null default '00000000-0000-0000-0000-000000000000',
  views integer not null default 0,
  read_completes integer not null default 0,
  follows integer not null default 0,
  unfollows integer not null default 0,
  subscribes integer not null default 0,
  unsubscribes integer not null default 0,
  checkout_starts integer not null default 0,
  checkout_completes integer not null default 0,
  email_opens integer not null default 0,
  email_clicks integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (day, scope_type, scope_id)
);

create index if not exists analytics_daily_rollups_scope_day_idx
  on public.analytics_daily_rollups (scope_type, scope_id, day desc);

-- ---------------------------------------------------------------------------
-- D2. Membership tiers + entitlements
-- ---------------------------------------------------------------------------

create type public.membership_interval as enum ('month', 'year');

create type public.post_access_level as enum (
  'public',
  'members',
  'paid'
);

create type public.membership_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

alter table public.posts
  add column if not exists access_level public.post_access_level not null default 'public',
  add column if not exists required_tier_id uuid,
  add column if not exists preview_percent integer not null default 20
    check (preview_percent >= 0 and preview_percent <= 100);

create table if not exists public.membership_tiers (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('author', 'publication')),
  owner_id uuid not null,
  name text not null,
  description text not null default '',
  is_free boolean not null default false,
  interval public.membership_interval,
  amount_cents integer,
  currency text not null default 'usd',
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_tiers_paid_fields check (
    (is_free = true and amount_cents is null and interval is null)
    or (is_free = false and amount_cents is not null and amount_cents >= 0 and interval is not null)
  )
);

create index if not exists membership_tiers_owner_idx
  on public.membership_tiers (owner_type, owner_id, sort_order);

create trigger membership_tiers_set_updated_at
  before update on public.membership_tiers
  for each row execute function private.set_updated_at();

-- Backfill FK after tiers table exists
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'posts_required_tier_id_fkey'
      and table_name = 'posts'
  ) then
    alter table public.posts
      add constraint posts_required_tier_id_fkey
      foreign key (required_tier_id) references public.membership_tiers (id)
      on delete set null;
  end if;
end $$;

create table if not exists public.stripe_customers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stripe_customers_set_updated_at
  before update on public.stripe_customers
  for each row execute function private.set_updated_at();

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tier_id uuid not null references public.membership_tiers (id) on delete restrict,
  status public.membership_status not null default 'incomplete',
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  ended_at timestamptz,
  last_invoice_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_user_status_idx
  on public.memberships (user_id, status);

create index if not exists memberships_tier_status_idx
  on public.memberships (tier_id, status);

create unique index if not exists memberships_user_tier_active_unique
  on public.memberships (user_id, tier_id)
  where status in ('trialing', 'active', 'past_due');

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function private.set_updated_at();

-- Idempotent Stripe webhook ledger
create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  api_version text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now()
);

create index if not exists stripe_events_type_created_idx
  on public.stripe_events (event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- D3. Connect accounts + earnings ledger (no PAN storage)
-- ---------------------------------------------------------------------------

create type public.connect_onboarding_status as enum (
  'not_started',
  'pending',
  'restricted',
  'complete'
);

create table if not exists public.connect_accounts (
  owner_type text not null check (owner_type in ('author', 'publication')),
  owner_id uuid not null,
  stripe_account_id text unique,
  onboarding_status public.connect_onboarding_status not null default 'not_started',
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_type, owner_id)
);

create trigger connect_accounts_set_updated_at
  before update on public.connect_accounts
  for each row execute function private.set_updated_at();

create type public.ledger_entry_kind as enum (
  'gross',
  'platform_fee',
  'stripe_fee',
  'refund',
  'dispute',
  'dispute_reversal',
  'payout',
  'payout_failure',
  'adjustment'
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('author', 'publication')),
  owner_id uuid not null,
  kind public.ledger_entry_kind not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  -- Positive for credits to creator, negative for fees/refunds/payouts out
  stripe_object_id text,
  stripe_event_id text references public.stripe_events (event_id) on delete set null,
  membership_id uuid references public.memberships (id) on delete set null,
  description text not null default '',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ledger_entries_no_pan check (
    description !~* '(card|pan|bank|account.?number|routing)'
  )
);

create unique index if not exists ledger_entries_stripe_object_kind_unique
  on public.ledger_entries (stripe_object_id, kind)
  where stripe_object_id is not null;

create index if not exists ledger_entries_owner_occurred_idx
  on public.ledger_entries (owner_type, owner_id, occurred_at desc);

create table if not exists public.payment_support_cases (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid references public.memberships (id) on delete set null,
  stripe_dispute_id text,
  stripe_charge_id text,
  stripe_refund_id text,
  reporter_user_id uuid references public.profiles (id) on delete set null,
  owner_type text check (owner_type in ('author', 'publication')),
  owner_id uuid,
  status text not null default 'open'
    check (status in ('open', 'needs_evidence', 'won', 'lost', 'refunded', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payment_support_cases_set_updated_at
  before update on public.payment_support_cases
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Entitlement helper (security definer)
-- ---------------------------------------------------------------------------

create or replace function private.has_active_membership(
  p_user_id uuid,
  p_owner_type text,
  p_owner_id uuid,
  p_tier_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.membership_tiers t on t.id = m.tier_id
    where m.user_id = p_user_id
      and t.owner_type = p_owner_type
      and t.owner_id = p_owner_id
      and m.status in ('trialing', 'active', 'past_due')
      and (p_tier_id is null or m.tier_id = p_tier_id or t.is_free = true)
  );
$$;

revoke all on function private.has_active_membership(uuid, text, uuid, uuid) from public;
grant execute on function private.has_active_membership(uuid, text, uuid, uuid) to authenticated;

create or replace function public.user_can_access_post(p_post_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_post record;
  v_uid uuid := (select auth.uid());
begin
  select
    p.access_level,
    p.author_id,
    p.publication_id,
    p.required_tier_id
  into v_post
  from public.posts p
  where p.id = p_post_id;

  if not found then
    return false;
  end if;

  if v_post.access_level = 'public' then
    return true;
  end if;

  -- Authors and publication editors always see full content
  if v_uid is not null and v_uid = v_post.author_id then
    return true;
  end if;

  if v_uid is not null
     and v_post.publication_id is not null
     and private.is_publication_member(
       v_post.publication_id,
       array['owner', 'editor', 'contributor']::public.publication_member_role[]
     ) then
    return true;
  end if;

  if v_uid is null then
    return false;
  end if;

  if v_post.publication_id is not null then
    return private.has_active_membership(
      v_uid,
      'publication',
      v_post.publication_id,
      case when v_post.access_level = 'paid' then v_post.required_tier_id else null end
    );
  end if;

  return private.has_active_membership(
    v_uid,
    'author',
    v_post.author_id,
    case when v_post.access_level = 'paid' then v_post.required_tier_id else null end
  );
end;
$$;

revoke all on function public.user_can_access_post(uuid) from public;
grant execute on function public.user_can_access_post(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rollup bump helper
-- ---------------------------------------------------------------------------

create or replace function private.bump_analytics_rollup(
  p_day date,
  p_scope_type text,
  p_scope_id uuid,
  p_event public.analytics_event_name
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scope uuid := coalesce(p_scope_id, '00000000-0000-0000-0000-000000000000'::uuid);
begin
  insert into public.analytics_daily_rollups (day, scope_type, scope_id)
  values (p_day, p_scope_type, v_scope)
  on conflict (day, scope_type, scope_id) do nothing;

  update public.analytics_daily_rollups
  set
    views = views + case when p_event = 'view' then 1 else 0 end,
    read_completes = read_completes + case when p_event = 'read_complete' then 1 else 0 end,
    follows = follows + case when p_event = 'follow' then 1 else 0 end,
    unfollows = unfollows + case when p_event = 'unfollow' then 1 else 0 end,
    subscribes = subscribes + case when p_event = 'subscribe' then 1 else 0 end,
    unsubscribes = unsubscribes + case when p_event = 'unsubscribe' then 1 else 0 end,
    checkout_starts = checkout_starts + case when p_event = 'checkout_start' then 1 else 0 end,
    checkout_completes = checkout_completes + case when p_event = 'checkout_complete' then 1 else 0 end,
    email_opens = email_opens + case when p_event = 'email_open' then 1 else 0 end,
    email_clicks = email_clicks + case when p_event = 'email_click' then 1 else 0 end,
    updated_at = now()
  where day = p_day
    and scope_type = p_scope_type
    and scope_id = v_scope;
end;
$$;

revoke all on function private.bump_analytics_rollup(date, text, uuid, public.analytics_event_name) from public;

create or replace function private.analytics_events_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  d date := (new.occurred_at at time zone 'utc')::date;
begin
  perform private.bump_analytics_rollup(d, 'platform', null, new.event_name);
  if new.post_id is not null then
    perform private.bump_analytics_rollup(d, 'post', new.post_id, new.event_name);
  end if;
  if new.author_id is not null then
    perform private.bump_analytics_rollup(d, 'author', new.author_id, new.event_name);
  end if;
  if new.publication_id is not null then
    perform private.bump_analytics_rollup(d, 'publication', new.publication_id, new.event_name);
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_events_after_insert on public.analytics_events;
create trigger analytics_events_after_insert
  after insert on public.analytics_events
  for each row execute function private.analytics_events_after_insert();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.analytics_events enable row level security;
alter table public.analytics_daily_rollups enable row level security;
alter table public.membership_tiers enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.memberships enable row level security;
alter table public.stripe_events enable row level security;
alter table public.connect_accounts enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.payment_support_cases enable row level security;

-- Analytics: insert via service role / authenticated ingest RPC; creators read own rollups
create policy analytics_events_select_own
  on public.analytics_events for select to authenticated
  using (
    author_id = (select auth.uid())
    or (select private.is_admin())
    or (
      publication_id is not null
      and private.is_publication_member(
        publication_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
  );

create policy analytics_events_insert_authenticated
  on public.analytics_events for insert to authenticated
  with check (true);

create policy analytics_events_insert_anon
  on public.analytics_events for insert to anon
  with check (
    event_name in ('view', 'read_complete')
    and actor_user_id is null
  );

create policy analytics_rollups_select
  on public.analytics_daily_rollups for select to authenticated
  using (
    (select private.is_admin())
    or (scope_type = 'author' and scope_id = (select auth.uid()))
    or (
      scope_type = 'publication'
      and scope_id is not null
      and private.is_publication_member(
        scope_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
    or (
      scope_type = 'post'
      and exists (
        select 1 from public.posts p
        where p.id = scope_id
          and (
            p.author_id = (select auth.uid())
            or (
              p.publication_id is not null
              and private.is_publication_member(
                p.publication_id,
                array['owner', 'editor']::public.publication_member_role[]
              )
            )
          )
      )
    )
  );

-- Tiers: public can read active tiers; owners manage
create policy membership_tiers_select_active
  on public.membership_tiers for select to anon, authenticated
  using (
    is_active = true
    or (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
  );

create policy membership_tiers_insert_owner
  on public.membership_tiers for insert to authenticated
  with check (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  );

create policy membership_tiers_update_owner
  on public.membership_tiers for update to authenticated
  using (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  )
  with check (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  );

create policy stripe_customers_own
  on public.stripe_customers for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy memberships_select_own
  on public.memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_admin())
    or exists (
      select 1 from public.membership_tiers t
      where t.id = tier_id
        and (
          (t.owner_type = 'author' and t.owner_id = (select auth.uid()))
          or (
            t.owner_type = 'publication'
            and private.is_publication_member(
              t.owner_id,
              array['owner', 'editor']::public.publication_member_role[]
            )
          )
        )
    )
  );

-- Mutations via service role / server actions only for memberships rows
create policy memberships_no_direct_write
  on public.memberships for insert to authenticated
  with check (false);

create policy stripe_events_admin_select
  on public.stripe_events for select to authenticated
  using ((select private.is_admin()));

create policy connect_accounts_select
  on public.connect_accounts for select to authenticated
  using (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
  );

create policy connect_accounts_upsert_owner
  on public.connect_accounts for insert to authenticated
  with check (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  );

create policy connect_accounts_update_owner
  on public.connect_accounts for update to authenticated
  using (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  )
  with check (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner']::public.publication_member_role[]
      )
    )
  );

create policy ledger_entries_select
  on public.ledger_entries for select to authenticated
  using (
    (select private.is_admin())
    or (owner_type = 'author' and owner_id = (select auth.uid()))
    or (
      owner_type = 'publication'
      and private.is_publication_member(
        owner_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
  );

create policy payment_support_select
  on public.payment_support_cases for select to authenticated
  using (
    (select private.is_admin())
    or reporter_user_id = (select auth.uid())
    or (
      owner_type = 'author' and owner_id = (select auth.uid())
    )
    or (
      owner_type = 'publication'
      and owner_id is not null
      and private.is_publication_member(
        owner_id,
        array['owner', 'editor']::public.publication_member_role[]
      )
    )
  );

create policy payment_support_admin_all
  on public.payment_support_cases for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
