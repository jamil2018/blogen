-- Phase 2 post-deploy fixes: nullable library post_id, metadata backfill hook, reading path seed.

alter table public.library_items alter column post_id drop not null;

insert into public.post_structural_metadata (
  post_id, revision_id, revision_number, sections, citations, referenced_post_ids, tags, author_id, published_at
)
select
  pr.post_id,
  pr.id,
  pr.revision_number,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::uuid[],
  coalesce(p.tags, '{}'),
  p.author_id,
  pr.published_at
from public.post_revisions pr
join public.posts p on p.id = pr.post_id
where p.status = 'published'
on conflict (post_id, revision_number) do nothing;

insert into public.reading_paths (slug, title, purpose, estimated_minutes, is_published)
select
  'getting-started-with-blogen',
  'Getting started with Blogen',
  'A short curated path through foundational posts on reading, writing, and thoughtful publishing.',
  24,
  true
where not exists (
  select 1 from public.reading_paths where slug = 'getting-started-with-blogen'
);

insert into public.reading_path_items (path_id, bound_post_id, sort_order, relationship_label, transition_note)
select rp.id, v.post_id, v.sort_order, v.relationship_label::public.reading_path_relationship, v.transition_note
from public.reading_paths rp
cross join (
  values
    ('a4444444-4444-4444-8444-444444444444'::uuid, 0, 'introduces', 'Start with attention and focus — a good frame for intentional reading.'),
    ('a5555555-5555-4555-8555-555555555555'::uuid, 1, 'extends', 'Move from personal habit to discovering ideas in the world.'),
    ('a6666666-6666-4666-8666-666666666666'::uuid, 2, 'applies', 'Apply slow, observant reading to lived experience.')
) as v(post_id, sort_order, relationship_label, transition_note)
where rp.slug = 'getting-started-with-blogen'
  and not exists (select 1 from public.reading_path_items where path_id = rp.id);
