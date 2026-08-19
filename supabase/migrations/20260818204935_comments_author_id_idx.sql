-- Covering index for comments.author_id foreign key.
create index if not exists comments_author_id_idx on public.comments (author_id);
