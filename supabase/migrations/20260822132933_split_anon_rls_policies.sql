-- Public-read policies were attached to both anon and authenticated and called
-- private.is_admin() / private.is_publication_member(). Those helpers are not
-- executable by anon, so unauthenticated SELECTs failed with
-- "permission denied for function is_admin" (e.g. GET /paths).
-- Split so anon only evaluates public predicates.

drop policy if exists "reading_paths_select_published" on public.reading_paths;
create policy "reading_paths_select_published"
  on public.reading_paths for select
  to anon
  using (is_published = true);
create policy "reading_paths_select_own_or_admin"
  on public.reading_paths for select
  to authenticated
  using (
    is_published = true
    or created_by = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists "reading_path_items_select_via_path" on public.reading_path_items;
create policy "reading_path_items_select_published"
  on public.reading_path_items for select
  to anon
  using (
    exists (
      select 1 from public.reading_paths rp
      where rp.id = path_id
        and rp.is_published = true
    )
  );
create policy "reading_path_items_select_own_or_admin"
  on public.reading_path_items for select
  to authenticated
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

drop policy if exists "posts_select_published_or_owner_or_admin_or_pub_member" on public.posts;
create policy "posts_select_published"
  on public.posts for select
  to anon
  using (status = 'published');
create policy "posts_select_published_or_owner_or_admin_or_pub_member"
  on public.posts for select
  to authenticated
  using (
    status = 'published'
    or author_id = (select auth.uid())
    or (select private.is_admin())
    or (
      publication_id is not null
      and (select private.is_publication_member(publication_id))
    )
  );

drop policy if exists "post_revisions_select_published_or_owner_or_admin" on public.post_revisions;
create policy "post_revisions_select_published"
  on public.post_revisions for select
  to anon
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'published'
    )
  );
create policy "post_revisions_select_own_or_admin"
  on public.post_revisions for select
  to authenticated
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

drop policy if exists "post_structural_metadata_select_published" on public.post_structural_metadata;
create policy "post_structural_metadata_select_published"
  on public.post_structural_metadata for select
  to anon
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'published'
    )
  );
create policy "post_structural_metadata_select_own_or_admin"
  on public.post_structural_metadata for select
  to authenticated
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

drop policy if exists "newsletters_select_public_sent_or_member" on public.newsletters;
create policy "newsletters_select_sent"
  on public.newsletters for select
  to anon
  using (status = 'sent');
create policy "newsletters_select_sent_or_member"
  on public.newsletters for select
  to authenticated
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

drop policy if exists membership_tiers_select_active on public.membership_tiers;
create policy membership_tiers_select_active
  on public.membership_tiers for select
  to anon
  using (is_active = true);
create policy membership_tiers_select_own_or_admin
  on public.membership_tiers for select
  to authenticated
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
