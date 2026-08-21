# Canonical count definitions

Public surfaces must use published-only aggregates. Drafts, scheduled, and archived posts never inflate public counts.

| Metric | Definition | Surfaces |
| --- | --- | --- |
| Article / post count | Rows in `posts` where `status = 'published'` | About, Categories, Authors, profiles, RPCs |
| Author post count | Published posts for `author_id` | Authors directory, author profile |
| Category post count | Published posts for `category_id` | Categories directory, category filters |
| Topics covered | Distinct categories that have ≥1 published post (About) or distinct category+tag labels from an author's published posts (profile) | About, author profile |
| Community of writers | Distinct profiles that have ≥1 published post (preferred) or all profiles when using directory listing | About metrics |
| Comment count | Comments on published posts only for public displays | Author profile stats |

## Authoritative contracts

- `public_post_counts_by_author(author_id)` → published count
- `public_post_counts_by_category(category_id)` → published count
- `public_platform_stats()` → `{ published_posts, authors_with_posts, categories_with_posts }`

Client-side `getAllPosts().length` must not be used for public metrics.
