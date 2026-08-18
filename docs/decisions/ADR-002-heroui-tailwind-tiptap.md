# ADR-002: HeroUI, Tailwind CSS v4, and TipTap

## Status

Accepted

## Context

ADR-001 migrated Blogen to Next.js 16 App Router while deliberately retaining MUI v5 + JSS screens as a wrap-and-defer strategy. The UI phase replaces that stack with a modern editorial design system aligned to Blogen’s public reading and author/admin workflows.

## Decision

1. **Component library:** HeroUI v3 (`@heroui/react` + `@heroui/styles`) with Tailwind CSS v4 (`@tailwindcss/postcss`). No MUI or shadcn mix.
2. **Styling:** CSS-first tokens in `app/globals.css` — zinc neutrals, teal accent, Geist fonts, class-based light/dark.
3. **Icons:** `@phosphor-icons/react` only in new components.
4. **Editor:** TipTap (`@tiptap/react` + StarterKit extensions) replaces `react-quill-new`. Read path uses sanitized HTML + `@tailwindcss/typography` via `PostProse`.
5. **Layouts:** `SiteShell` (public), `AppSidebar` (user/admin). RSC `page.tsx` + `lib/api.ts` pattern unchanged.
6. **Auth UX:** Dedicated `/login` and `/register` pages with Formik/Yup forms.

## Consequences

- Smaller runtime after MUI removal; single styling system (Tailwind utilities).
- TipTap HTML should remain compatible with legacy Quill content via sanitizer + typography prose.
- HeroUI Table replaces `@mui/x-data-grid` with checkbox selection, search, and row actions.
- Dual-stack bundle bloat during migration is eliminated post-cleanup.

## Alternatives considered

- Restyling MUI with `sx`/Emotion — rejected (wasted work per ADR-001).
- shadcn/ui — rejected to keep one component system.
- Keeping Quill — rejected for SSR complexity and bundle size; TipTap aligns with React 19 islands.
