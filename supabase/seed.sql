-- Sample content for `supabase db reset` and empty hosted projects.
-- If profiles already exist (typical on the linked cloud project), posts are
-- attributed to those authors. Demo auth users are created only when none exist.

-- ---------------------------------------------------------------------------
-- Demo authors (local reset / empty database only)
-- Emails: maya@blogen.local, jordan@blogen.local
-- Password: blogen-seed-dev
-- ---------------------------------------------------------------------------

do $$
declare
  maya_id constant uuid := '11111111-1111-4111-8111-111111111111';
  jordan_id constant uuid := '22222222-2222-4222-8222-222222222222';
  seed_hash text := extensions.crypt('blogen-seed-dev', extensions.gen_salt('bf'));
begin
  if exists (select 1 from public.profiles) then
    return;
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      maya_id,
      'authenticated',
      'authenticated',
      'maya@blogen.local',
      seed_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Maya Chen"}'::jsonb,
      now() - interval '40 days',
      now() - interval '40 days',
      false,
      false
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      jordan_id,
      'authenticated',
      'authenticated',
      'jordan@blogen.local',
      seed_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Jordan Hale"}'::jsonb,
      now() - interval '32 days',
      now() - interval '32 days',
      false,
      false
    );

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      maya_id::text,
      maya_id,
      jsonb_build_object('sub', maya_id::text, 'email', 'maya@blogen.local'),
      'email',
      now(),
      now() - interval '40 days',
      now() - interval '40 days'
    ),
    (
      jordan_id::text,
      jordan_id,
      jsonb_build_object('sub', jordan_id::text, 'email', 'jordan@blogen.local'),
      'email',
      now(),
      now() - interval '32 days',
      now() - interval '32 days'
    );

  update public.profiles
  set
    bio = 'Writes about web platforms, auth, and the unglamorous parts of shipping a blog.',
    is_admin = true
  where id = maya_id;

  update public.profiles
  set bio = 'Notes on design, travel, and keeping a small creative practice alive.'
  where id = jordan_id;
end $$;

do $$
begin
  if not exists (select 1 from public.profiles) then
    raise exception 'Seed needs at least one profile before inserting posts.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

insert into public.categories (title)
values
  ('Technology'),
  ('Design'),
  ('Culture'),
  ('Travel'),
  ('Productivity'),
  ('Food')
on conflict (title) do nothing;

-- ---------------------------------------------------------------------------
-- Posts (idempotent by id)
-- ---------------------------------------------------------------------------

with
authors as (
  select id, row_number() over (order by created_at, id) as n
  from public.profiles
),
author_one as (
  select id from authors where n = 1
),
author_two as (
  select coalesce(
    (select id from authors where n = 2),
    (select id from authors where n = 1)
  ) as id
),
seed as (
  select *
  from (
    values
      (
        'a1111111-1111-4111-8111-111111111111'::uuid,
        'Rebuilding a blog on Next.js and Supabase',
        $html$<p>Blogen used to be two processes: a Create React App client talking to Express, with MongoDB and Firebase Storage behind it. That split made public pages slower than they needed to be and left auth in <code>localStorage</code>.</p><h2>What changed</h2><p>The rewrite keeps the screens you already know and moves data access into Next.js Server Components and Server Actions. Postgres, Auth, and Storage now live in one Supabase project.</p><p>Row Level Security is the real API boundary. The browser can read published posts; writing still requires a session, and admin flags stay in <code>profiles</code> rather than in editable user metadata.</p>$html$,
        'A walk through the choices we made moving Blogen from Express and MongoDB onto Next.js Server Actions and Supabase — auth, storage, and why public pages can finally render real HTML.',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
        'Technology',
        array['nextjs', 'supabase', 'migration'],
        now() - interval '12 days',
        1
      ),
      (
        'a2222222-2222-4222-8222-222222222222'::uuid,
        'What row level security actually protects',
        $html$<p>It is easy to treat RLS as a checklist item: turn it on, add <code>auth.uid()</code>, ship. That pattern is right for “my own rows” and wrong for a public blog.</p><h2>Reads vs writes</h2><p>Anyone can read posts and comments. Inserts are scoped to the signed-in author. Updates and deletes allow the author or an admin helper that reads <code>profiles.is_admin</code>, not JWT user metadata.</p><p>The detail that bites people: an <code>UPDATE</code> still needs a matching <code>SELECT</code> policy. Without it, Postgres returns zero rows and looks like a silent no-op.</p>$html$,
        'RLS is the API for Blogen. This note covers public reads, author-only writes, why admin checks belong in profiles, and the UPDATE-needs-SELECT trap that looks like a failed save.',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
        'Technology',
        array['postgres', 'security', 'rls'],
        now() - interval '9 days',
        1
      ),
      (
        'a3333333-3333-4333-8333-333333333333'::uuid,
        'Designing a reading-first homepage',
        $html$<p>A homepage for a blog is not a landing page. People arrive to read, skim, and decide whether the next piece is worth their time.</p><h2>Hierarchy over chrome</h2><p>We kept one featured story, a compact grid of latest work, and a longer list beside categories. Cover images earn their space; empty gray blocks are a last resort, not a look.</p><p>Type stays quiet on purpose. If the title and summary cannot carry the card, more decoration will not help.</p>$html$,
        'How Blogen’s homepage is laid out for scanning: one featured story, a latest grid, a longer list, and categories that stay out of the way of the writing.',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80',
        'Design',
        array['ui', 'typography', 'layout'],
        now() - interval '7 days',
        2
      ),
      (
        'a4444444-4444-4444-8444-444444444444'::uuid,
        'A week without notifications',
        $html$<p>I turned off badges for seven days. Not as a productivity stunt — as a test of whether the work I claimed to care about actually needed a ping.</p><p>The first two days were noisy in the opposite way: I kept opening apps to check that nothing was on fire. By day four the checking faded. What remained were two calendars and a single inbox pass in the afternoon.</p><p>The useful part was not the silence. It was seeing which messages were actually tasks, and which were just other people’s urgency wearing a red dot.</p>$html$,
        'Seven days with badges off. The surprising part was not deep focus — it was how many “urgent” messages were just someone else’s timeline leaking onto the lock screen.',
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1600&q=80',
        'Productivity',
        array['focus', 'habits', 'attention'],
        now() - interval '5 days',
        2
      ),
      (
        'a5555555-5555-4555-8555-555555555555'::uuid,
        'Why small cities still have the best bookstores',
        $html$<p>Large shops optimize for inventory. The stores I keep going back to optimize for a conversation you did not know you needed.</p><p>In a smaller city the buyer often works the desk. They remember that you bounced off translated fiction last winter and still put a thin volume on the counter “in case.” That is not a recommendation engine. It is taste with a memory.</p><p>I do not think this scales, and that is the point. A room that can only hold two thousand spines has to choose, and choosing is the whole craft.</p>$html$,
        'Inventory is easy to scale. Taste is not. A short case for the desk-staffed bookshop that remembers what you bounced off last winter and still takes the risk of putting something in your hands.',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80',
        'Culture',
        array['books', 'cities', 'retail'],
        now() - interval '4 days',
        2
      ),
      (
        'a6666666-6666-4666-8666-666666666666'::uuid,
        'A weekend in the hills above the city',
        $html$<p>We left after breakfast and were on the ridge before the heat settled on the plain. The trail is not dramatic — gravel, low scrub, a radio tower you can see from the bus — but the air changes in the first hour.</p><p>Most of the walk is looking down: the grid of the city, a river that is mostly an idea in the dry months, cranes that have been in the same place for years. You go up to remember the shape of the place you live in.</p><p>On the way down we bought too much fruit from a stall that only takes cash. That is the whole report.</p>$html$,
        'A short ridge walk above town: gravel, a radio tower, and the useful shock of seeing the city as a map instead of a commute. Fruit on the way down, cash only.',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
        'Travel',
        array['hiking', 'weekends', 'cities'],
        now() - interval '3 days',
        2
      ),
      (
        'a7777777-7777-4777-8777-777777777777'::uuid,
        'The case for a slower kitchen',
        $html$<p>I used to cook as if dinner were a deploy: mise en place as a checklist, heat as a deadline, plating as a release. It made weeknights efficient and slightly joyless.</p><p>Slowing down did not mean restaurant technique. It meant putting the radio on, cutting onions without racing the pan, and accepting that beans from a pot taste better than beans from a rush.</p><p>The metric I use now is whether I would still want to eat this if nobody else was coming over. If the answer is no, the recipe is performing.</p>$html$,
        'Weeknight cooking does not have to feel like a deploy. A quieter kitchen, a radio, and a single test: would I still make this if nobody else was coming over?',
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1600&q=80',
        'Food',
        array['cooking', 'weeknights', 'home'],
        now() - interval '2 days',
        1
      ),
      (
        'a8888888-8888-4888-8888-888888888888'::uuid,
        'Type-safe server actions without the ceremony',
        $html$<p>We did not add a separate API package. Mutations are Server Actions next to the pages that call them, with a thin <code>src/lib/db</code> layer so queries are not copy-pasted into every form.</p><h2>What we refused</h2><p>No extra RPC surface “for later.” No generated client that duplicates types we already have in <code>database.types.ts</code>. The form posts, the action checks the session, Postgres enforces the rest.</p><p>The ceremony that is worth it: mapping rows into the existing frontend types so cards and studio tables did not have to learn snake_case.</p>$html$,
        'Blogen’s mutations are Server Actions, not a second API. A small db helper, generated Database types, and a mapper back to the shapes the UI already expected.',
        'https://images.unsplash.com/photo-1516116218424-4d5baa4b0b8f?auto=format&fit=crop&w=1600&q=80',
        'Technology',
        array['typescript', 'nextjs', 'server-actions'],
        now() - interval '1 day',
        1
      )
  ) as v(
    id,
    title,
    description,
    summary,
    cover_url,
    category_title,
    tags,
    created_at,
    author_slot
  )
)
insert into public.posts (
  id,
  title,
  description,
  summary,
  cover_url,
  author_id,
  category_id,
  tags,
  created_at
)
select
  seed.id,
  seed.title,
  seed.description,
  seed.summary,
  seed.cover_url,
  case seed.author_slot
    when 1 then (select id from author_one)
    else (select id from author_two)
  end,
  c.id,
  seed.tags,
  seed.created_at
from seed
join public.categories c on c.title = seed.category_title
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- A few comments so threads are not empty
-- ---------------------------------------------------------------------------

insert into public.comments (id, post_id, author_id, text, created_at)
select
  v.id,
  v.post_id,
  coalesce(
    (select id from public.profiles order by created_at, id offset 1 limit 1),
    (select id from public.profiles order by created_at, id limit 1)
  ),
  v.text,
  v.created_at
from (
  values
    (
      'c1111111-1111-4111-8111-111111111111'::uuid,
      'a1111111-1111-4111-8111-111111111111'::uuid,
      'The cookie-session move is the part I wish we had done first. Public pages finally feel like documents.',
      now() - interval '10 days'
    ),
    (
      'c2222222-2222-4222-8222-222222222222'::uuid,
      'a2222222-2222-4222-8222-222222222222'::uuid,
      'The silent UPDATE with no SELECT policy got us in staging. Thanks for writing that down.',
      now() - interval '8 days'
    ),
    (
      'c3333333-3333-4333-8333-333333333333'::uuid,
      'a3333333-3333-4333-8333-333333333333'::uuid,
      'Agree on decoration. If the title cannot carry the card, a gradient will not save it.',
      now() - interval '6 days'
    ),
    (
      'c4444444-4444-4444-8444-444444444444'::uuid,
      'a8888888-8888-4888-8888-888888888888'::uuid,
      'Mapping snake_case once in mappers.ts was the right amount of glue. We almost generated a second client.',
      now() - interval '12 hours'
    )
) as v(id, post_id, text, created_at)
where exists (select 1 from public.posts p where p.id = v.post_id)
on conflict (id) do nothing;
