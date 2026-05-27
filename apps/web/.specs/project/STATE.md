# State

## Technical Context

- **Framework:** TanStack Start (SSR/Full-stack).
- **Router:** TanStack Router v1 (File-based, integrated).
- **Forms:** TanStack Form (Replaced React Hook Form).
- **State:** TanStack Query (Server), TanStack Store (Atomic & Global UI).
- **Styling:** Tailwind CSS v4 (CSS-first), CVA v0.0.0, clsx, tailwind-merge.
- **Component Strategy:** 100% custom components, documented in Storybook 10.
- **Path Alias:** `#/*` → `./src/*`.

## Decisions

- **Auth session model:** Better Auth cookie sessions via Axios `withCredentials` — not JWT in `localStorage` (legacy docs in `docs/flow/01-auth/` are outdated).
- **Auth discuss (2026-05-20):** `context.md` — step 3 informational; completion = `establishments.length >= 1`; step 1 mandatory; resend verify + 60s cooldown; Axios authApi (no better-auth on web); duplicate signup = explicit error.
- [x] Auth tasks.md (24 tasks, T1–T24); next: Execute from T1.
- Using TanStack Form for all form management to align with the TanStack ecosystem.
- CVA 0.0.0 is used; need to be careful with API stability.
- Storybook 10 is the source of truth for component documentation.
- **TanStack Store as Sole UI State Manager:** Use TanStack Store for all global UI state (session, sidebar, theme, notifications). Remove Zustand and the Zustand skill to avoid redundancy and align with the TanStack ecosystem (Router, Query, Form, Start).
- **Absolute Imports Only:** Always use absolute imports (via `#/*`), never relative paths like `../`.

## Blockers

- None.

## TODOs

- [ ] Auth feature: `design.md` → `tasks.md` → implement.
- [ ] Implement `cn()` utility (`clsx` + `tailwind-merge`).
- [ ] Configure `Axios` singleton with base URL and auth interceptors.
- [ ] Migrate/Move components from `src/components/storybook/` to `src/components/ui/` using CVA and the new `cn()` utility.
- [ ] Setup initial MSW handlers for the Auth module.

## Lessons

- TanStack Start SSR requires careful handling of browser-only globals (e.g., `window`, `localStorage`).
- Hydration errors can occur if server and client rendered HTML differs (e.g., random IDs, dates).

## Quick Tasks Completed

| #   | Description                             | Date       | Commit | Status  |
| --- | --------------------------------------- | ---------- | ------ | ------- |
| 001 | Update frontend rules to TanStack Store | 2026-05-20 | -      | ✅ Done |

## Preferences

**Model Guidance Shown:** 2026-05-20
