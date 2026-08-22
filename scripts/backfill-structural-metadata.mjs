/**
 * One-time backfill: enrich post_structural_metadata with HTML-derived sections/citations.
 * Run: node --env-file=.env.local scripts/backfill-structural-metadata.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { extractStructuralMetadata } from "../src/lib/phase-2/contracts.ts";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: posts, error } = await supabase
  .from("posts")
  .select("id, description, tags, author_id, published_at")
  .eq("status", "published");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
for (const post of posts ?? []) {
  const metadata = extractStructuralMetadata({
    postId: post.id,
    revisionId: null,
    revisionNumber: 0,
    html: post.description ?? "",
    tags: post.tags ?? [],
    authorId: post.author_id,
    publishedAt: post.published_at,
  });

  const { error: upsertError } = await supabase.from("post_structural_metadata").upsert(
    {
      post_id: metadata.postId,
      revision_id: metadata.revisionId,
      revision_number: metadata.revisionNumber,
      sections: metadata.sections,
      citations: metadata.citations,
      referenced_post_ids: metadata.referencedPostIds,
      tags: metadata.tags,
      author_id: metadata.authorId,
      published_at: metadata.publishedAt,
    },
    { onConflict: "post_id,revision_number" }
  );

  if (upsertError) {
    console.error(post.id, upsertError.message);
    continue;
  }
  updated += 1;
}

console.log(`Updated structural metadata for ${updated} published post(s).`);
