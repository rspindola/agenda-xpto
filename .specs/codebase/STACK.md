# Tech Stack — Agenda XPTO

## Backend (apps/api)
- **Runtime:** Node.js 22 (LTS)
- **Language:** TypeScript 5.x (strict mode)
- **Framework:** Fastify v5
- **ORM:** Prisma v6.x
- **Database:** PostgreSQL 16
- **Cache/Queues:** Redis 7 + BullMQ
- **Auth:** Better Auth
- **Email:** Resend
- **Validation:** Zod v4
- **Logging:** Pino (built-in Fastify)
- **Task Runner:** tsx (dev), tsc (build)

## Frontend (apps/web) — *In Progress/Planned*
- **Framework:** React 19 + Vite 6
- **Routing:** TanStack Router v1
- **Server State:** TanStack Query v5
- **UI State:** Zustand v5
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **Components:** Custom with Tailwind (no external UI library, shadcn-inspired)
- **Calendar:** FullCalendar React

## Monorepo & Tooling
- **Monorepo Manager:** Turborepo
- **Package Manager:** pnpm workspaces
- **Testing:** Vitest
- **Code Quality:** ESLint, Prettier
- **Environment:** Docker Compose (PostgreSQL, Redis)
