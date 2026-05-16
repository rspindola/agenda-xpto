# Tech Stack

**Analyzed:** 2026-05-16

## Core

- Framework: TanStack Start (SSR/Full-stack)
- Language: TypeScript 6.x
- Runtime: Node.js / Vite 8
- Package manager: pnpm

## Frontend

- UI Framework: React 19.x
- Styling: Tailwind CSS v4.x (CSS-first, @tailwindcss/vite), CVA v0.0.0, clsx, tailwind-merge
- State Management:
  - Server: TanStack Query v5
  - Atomic: TanStack Store
  - Global UI: Zustand v5
- Form Handling: TanStack Form
- Routing: TanStack Router v1 (File-based)
- UI Components: FullCalendar (React), Lucide React (Icons)
- Monitoring: Sentry (@sentry/tanstackstart-react)

## Testing

- Unit: Vitest 4.x
- Integration: Testing Library (React/DOM/User-Event), jsdom
- Component: Storybook 10 + addon-interactions + test
- API Mocking: MSW 2
- E2E: None (Post-MVP)

## External Services

- Backend: Agenda XPTO API (Fastify)
- Auth: Better Auth
- Email: Resend

## Development Tools

- Component Docs: Storybook 10
- Linting: ESLint 9.x
- Formatting: Prettier 3.x
- HTTP Client: Axios
