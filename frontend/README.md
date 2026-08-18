# Blogen frontend

Next.js **16** App Router (React 19, TypeScript). This package replaced Create React App. Prefer running the full stack from the [repo root](../README.md) (`npm run dev`).

## Requirements

- Node.js >= 20.9

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env` and fill in values. Do not invent or commit secrets. Backend API variables are documented in [`backend/README.md`](../backend/README.md).

3. Start the Next.js dev server (Express must be running for `/api` and RSC fetches):

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |

## Environment

See [`.env.example`](.env.example):

| Variable | Where | Purpose |
|----------|--------|---------|
| `API_INTERNAL_URL` | server only | RSC fetch base URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_API_URL` | optional, public | Production API origin; empty in development (relative `/api` + rewrite) |
| `NEXT_PUBLIC_FIREBASE_*` | client | Firebase Storage uploads |

`next.config.ts` rewrites `/api/:path*` to Express. There are **no** Next.js Route Handlers under `app/api`.

## App structure

```
src/app/          App Router pages and layouts
src/components/   Existing MUI UI (kept)
src/screens/      Existing screens; pages render these
src/layout/       Site / user / admin chrome
src/lib/api.ts    Typed client + server fetch helpers
src/providers.tsx Redux, TanStack Query, MUI theme
```

Public `page.tsx` files are Server Components that prefetch data and pass it into client screens. User and admin routes are client-only (JWT in Redux / `localStorage`).

Architecture decisions: [ADR-001](../docs/decisions/ADR-001-nextjs-app-router.md).
