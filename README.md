# Blogen

Blogen is a simple tech blog: readers browse posts, authors, and categories; signed-in users and admins manage content through the same UI.

## Requirements

- **Node.js >= 20.9** (required by Next.js 16)

## Monorepo layout

| Path | Role |
|------|------|
| `frontend/` | Next.js 16 App Router (React 19, TypeScript, MUI v5) |
| `backend/` | Express 4 API (MongoDB, JWT) |

The frontend does not implement `/api` Route Handlers. Browser calls to `/api/*` are rewritten to Express. See [ADR-001](docs/decisions/ADR-001-nextjs-app-router.md).

## Quick start

1. Clone the repo and install dependencies from the **root** and each package:

   ```bash
   npm install
   npm install --prefix ./frontend
   npm install --prefix ./backend
   ```

2. Configure environment variables (no secrets live in the repo):
   - Frontend: copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env` and fill in values.
   - Backend: create `backend/.env` using the variables listed in [`backend/README.md`](backend/README.md).

3. Run the full stack from the repo root:

   ```bash
   npm run dev
   ```

   - Next.js: [http://localhost:3000](http://localhost:3000)
   - Express: [http://localhost:8000](http://localhost:8000) (default `PORT` from the backend `.env`)

## Environment variables

Do not commit real keys. Use the templates and docs:

- **Frontend** — [`frontend/.env.example`](frontend/.env.example)
  - `API_INTERNAL_URL` — server-only Express origin for RSC fetches (e.g. `http://localhost:8000`)
  - `NEXT_PUBLIC_API_URL` — optional public API origin; leave empty in development so the browser uses relative `/api` plus Next rewrites
  - `NEXT_PUBLIC_FIREBASE_*` — Firebase Storage client config
- **Backend** — see [`backend/README.md`](backend/README.md) (`PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `FILE_UPLOAD_PATH`)

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express and Next.js together |
| `npm run start-backend` | Express only (`npm run dev --prefix ./backend`) |
| `npm run start-frontend` | Next.js only (`npm run dev --prefix ./frontend`) |
| `npm run dev --prefix ./frontend` | Next.js dev server |
| `npm run build --prefix ./frontend` | Production build of the Next.js app |
| `npm start --prefix ./frontend` | Serve the production Next.js build |
| `npm run lint --prefix ./frontend` | Lint the frontend |
| `npm run dev --prefix ./backend` | Express with nodemon |
| `npm start --prefix ./backend` | Express in production mode |

## Architecture

- Public routes are thin React Server Components that fetch from Express and pass data into the existing client screens.
- User and admin routes stay client-side because JWT auth lives in Redux / `localStorage`.
- Existing MUI components and screens are preserved; a later phase may replace them with Hero UI.

Details and rejected alternatives: [ADR-001 — Next.js 16 App Router](docs/decisions/ADR-001-nextjs-app-router.md).
