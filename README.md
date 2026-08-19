# Blogen

Blogen is a simple tech blog: readers browse posts, authors, and categories; signed-in users and admins manage content through the same UI.

## Requirements

- **Node.js >= 20.9** (required by Next.js 16)

## App layout

Single Next.js 16 App Router app at the repo root (React 19, TypeScript, HeroUI). Data lives in Supabase (Postgres, Auth, Storage) and is accessed from Server Components and Server Actions.

Architecture notes: [ADR-001](docs/decisions/ADR-001-nextjs-app-router.md), [ADR-002](docs/decisions/ADR-002-heroui-tailwind-tiptap.md).

## Quick start

1. Clone the repo and install dependencies from the root:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env.local` and fill in your Supabase project values. Do not invent or commit secrets.

3. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Seed data

[`supabase/seed.sql`](supabase/seed.sql) loads six categories, eight posts, and a few comments. It runs after migrations on `supabase db reset`.

- **Empty database:** also creates two demo authors (`maya@blogen.local` / `jordan@blogen.local`, password `blogen-seed-dev`). Maya is an admin.
- **Existing profiles:** skips those accounts and attributes posts to the people already in `profiles`.

To load the same sample content into an already-running project, run the SQL in the seed file against that database (SQL editor or `psql`). Inserts are keyed by id and can be re-run.

## Environment variables

Do not commit real keys. Use [`.env.example`](.env.example):

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin bootstrap / privileged server tasks (never expose to the browser) |

OAuth provider credentials (Google) are **not** Next.js env vars. Configure them in the Supabase Dashboard for hosted projects, or via `supabase/config.toml` + local env for `supabase start`. See [OAuth setup](#oauth-setup-google) below.

## OAuth setup (Google)

Blogen uses Supabase Auth social login. Provider secrets live in Supabase configuration, not in Next.js environment variables.

### 1. Create OAuth apps

**Google Cloud Console**

1. Create an OAuth 2.0 **Web application** client.
2. Add **Authorized redirect URI** (points to Supabase, not your app):
   - Local: `http://127.0.0.1:54321/auth/v1/callback`
   - Production: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret.

### 2. Enable providers in Supabase

**Remote project:** In **Authentication → Providers**, enable **Google** with the credentials from step 1.

**Local CLI:** Set these in `.env.local` (or your shell) before `supabase start` — see [`.env.example`](.env.example). They are read by [`supabase/config.toml`](supabase/config.toml).

### 3. Redirect URL checklist

In **Authentication → URL Configuration** (remote) or [`supabase/config.toml`](supabase/config.toml) `additional_redirect_urls` (local):

| Environment | App callback (allow-list) | Supabase callback (IdP redirect) |
|-------------|---------------------------|----------------------------------|
| Local | `http://localhost:3000/auth/callback`, `http://127.0.0.1:3000/auth/callback` | `http://127.0.0.1:54321/auth/v1/callback` |
| Production | `https://<your-domain>/auth/callback` | `https://<project-ref>.supabase.co/auth/v1/callback` |

Set **Site URL** to your production domain (and `http://localhost:3000` for local dev).

### 4. Flow

1. User clicks **Continue with Google** on `/login` or `/register`.
2. Supabase redirects to the provider, then back to `/auth/callback?code=...`.
3. The callback route exchanges the code for a session cookie and redirects admins to `/admin`, others to `/user/dashboard` (or the `?next=` path from middleware).

Email/password sign-in is unchanged.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |

## App structure

```
src/app/            App Router pages and layouts
src/actions/        Server Actions (auth, posts, comments, categories, users)
src/components/     UI
src/lib/supabase/   Browser, server, and middleware clients
src/lib/db/         Shared query helpers
src/lib/api.ts      RSC data helpers
src/types/          Shared TypeScript types
supabase/           CLI config and SQL migrations
docs/               Architecture decision records
```

Public `page.tsx` files are Server Components that load data from Supabase. Protected `/user/*` and `/admin/*` routes are gated by Next.js middleware and cookie sessions.

## First admin

After the first signup, promote that account in the SQL editor (or `psql`):

```sql
update public.profiles
set is_admin = true
where id = '<your-auth-user-uuid>';
```
