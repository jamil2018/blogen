# Seeded roles (local / CI)

From `supabase/seed.sql` when the database is empty:

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin / author | `maya@blogen.local` | `blogen-seed-dev` | `is_admin = true` |
| Author | `jordan@blogen.local` | `blogen-seed-dev` | Standard writer |

Additional fixture identities for journey docs (create in CI when needed):

| Role | Intent |
| --- | --- |
| Signed-out reader | No session |
| Signed-in reader | Authenticated user with no published posts |
| Author | Owns drafts and published posts |
| Admin | Moderates reports and all posts |

Bookmark migration key: `blogen-bookmarks` (JSON array of post IDs) merges into `library_items` once on first signed-in `/library` visit.
