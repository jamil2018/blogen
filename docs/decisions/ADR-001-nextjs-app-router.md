# ADR-001: Next.js 16 App Router for the Blogen frontend

## Status
Accepted

## Date
2026-08-18

## Context

Blogen’s UI lived in Create React App (React 17, react-router-dom v5, Material UI v4) with an Express 4 API. CRA is unmaintained, the frontend needed a current React/Node toolchain, and public pages should ship real HTML (SEO) without rewriting the existing MUI component and screen tree.

Constraints for this milestone:

- Keep every existing screen, layout, and component; wrap them rather than replace them.
- Hero UI / Tailwind / a visual redesign are **out of scope**.
- The Express API stays a separate process. Do not fold it into Next.js.
- Auth today is JWT in Redux with `localStorage` persistence. Server Components and Next middleware cannot read that token.
- Next.js 16 requires React 19 and Node.js 20.9+. Material UI v4 does not support React 19.

## Decision

Use **Next.js 16 App Router** at the repo root (originally in `frontend/`), with these rules:

1. **App Router pages wrap existing UI.** Thin `src/app/**/page.tsx` files render the current screens. No parallel component library, no Hero UI.

2. **RSC only at the page boundary.** Public routes fetch from Express on the server (`API_INTERNAL_URL`) and pass data into existing `"use client"` screens. Screens, layouts, and components stay client because they already use hooks, Redux, MUI `makeStyles`, Quill, and DataGrid.

3. **MUI v5 + `@mui/styles` is a compatibility bridge, not a redesign.** Packages moved from `@material-ui/*` to `@mui/*` so the UI can run on React 19. `makeStyles` / JSS remain via `@mui/styles`. Do not convert styles to `sx`/`styled` or restyle in this milestone.

4. **Express remains the API.** Next.js rewrites `/api/*` to Express (`next.config.ts`). Do **not** add Next.js Route Handlers under `/api` — they would collide with the Express surface the client already calls.

5. **JWT stays in Redux / `localStorage`.** User and admin routes are client pages with the same in-app auth checks as before. Cookie / httpOnly sessions (which would unlock RSC for those routes) are a later backend change.

## Alternatives considered

### Stay on Create React App
- Pros: No migration cost.
- Cons: Unmaintained toolchain, no first-class SSR/RSC, blocked on React 17.
- Rejected: Does not meet the goal of a current, SEO-capable frontend.

### Next.js Pages Router
- Pros: Closer mapping from react-router file-per-route mental model.
- Cons: App Router is the Next 16 default; RSC + `generateMetadata` are first-class there.
- Rejected: Would immediately be a second migration.

### Rewrite UI in Hero UI / Tailwind during the move
- Pros: One big-bang modernization.
- Cons: Mixes routing/runtime risk with a full visual rewrite; existing MUI screens are still the product.
- Rejected: Explicitly deferred. Keep MUI until a dedicated UI phase.

### Next.js Route Handlers (or a BFF) under `/api`
- Pros: Single origin without rewrites.
- Cons: Duplicates Express routes; occupying `/api/*` in Next would shadow the existing client contract.
- Rejected: Rewrites preserve the `/api/*` URLs and leave Express as the source of truth.

### Cookie / httpOnly auth in this milestone
- Pros: Server Components could gate user/admin routes.
- Cons: Requires backend session changes and a new auth model.
- Rejected: Preserve JWT-in-Redux parity; cookies later.

### Drop `@mui/styles` and restyle with `sx` / Emotion styled
- Pros: Aligns with current MUI guidance; avoids the JSS runtime.
- Cons: Touches ~50 style files and is a redesign in disguise.
- Rejected: `@mui/styles` is enough for React 19 compatibility until Hero UI replaces MUI.

## Consequences

- Public HTML includes article content from RSC fetches; view-source on `/` and `/posts/:id` is not an empty SPA shell.
- User/admin UX (modals, DataGrid, Quill) stays client-side; refresh still hydrates JWT from `localStorage`.
- Frontend requires Node >= 20.9; run Express and Next together with `npm run dev` from the repo root.
- Future Hero UI work can replace MUI without another router migration.
- Future cookie auth can move protected routes toward RSC without changing the Express URL space.
