-- Posts published before revision history existed (revision_number 0, no revision_id)

insert into public.post_structural_metadata (
  post_id, revision_id, revision_number, sections, citations, referenced_post_ids, tags, author_id, published_at
)
select
  p.id,
  null,
  0,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::uuid[],
  coalesce(p.tags, '{}'),
  p.author_id,
  p.published_at
from public.posts p
where p.status = 'published'
  and not exists (
    select 1 from public.post_structural_metadata m where m.post_id = p.id
  )
on conflict (post_id, revision_number) do nothing;
