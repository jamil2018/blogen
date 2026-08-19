-- Public buckets for profile avatars and post cover images.
-- Upsert/replace requires INSERT + SELECT + UPDATE on storage.objects.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'post-covers',
    'post-covers',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  )
on conflict (id) do nothing;

-- avatars
create policy "avatars_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

-- post-covers
create policy "post_covers_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-covers');

create policy "post_covers_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "post_covers_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'post-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "post_covers_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-covers'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );
