# AGENTS.md — Agenda XPTO

This file provides context for AI agents (Cursor, Copilot, Claude, etc.) working on the Agenda XPTO project. Read this file before making any changes to the codebase.

---

## Project Overview

**Agenda XPTO** is a SaaS platform for scheduling management targeting small beauty and aesthetic establishments (barbershops, hair salons, nail studios, tattoo studios). It provides an online booking page for clients and an admin panel for owners.

- **MVP scope:** web-based booking page + admin panel (no WhatsApp integration yet)
- **Post-MVP:** WhatsApp AI assistant, IA credits, FAQ knowledge base, affiliates
- **Full PRD:** `docs/PRD.md`

---

## Key Documentation

Before implementing any feature, read the relevant documentation:

| Document | Path | Purpose |
|---|---|---|
| PRD | `docs/PRD.md` | Product scope, features, business model |
| Architecture | `docs/flow/00-sustain/ARCHITECTURE.md` | Tech stack, folder structure, conventions |
| Database | `docs/flow/00-sustain/DATABASE.md` | Prisma schema, ERD, slot algorithm |
| ADRs | `docs/flow/00-sustain/adr/` | Architecture decisions with rationale |
| Auth flow | `docs/flow/01-auth/USER_STORIES.md` | Authentication user stories |
| Dashboard | `docs/flow/02-dashboard/USER_STORIES.md` | Admin dashboard user stories |
| Establishment setup | `docs/flow/03-establishment-setup/USER_STORIES.md` | Setup user stories |
| Availability | `docs/flow/04-availability/USER_STORIES.md` | Availability rules and slot algorithm |
| Appointments | `docs/flow/05-appointments/USER_STORIES.md` | Appointment lifecycle |
| Public booking | `docs/flow/06-public-booking-page/USER_STORIES.md` | Client-facing booking page |
| Notifications | `docs/flow/07-notifications/USER_STORIES.md` | Email notifications and retry policy |
| Reports | `docs/flow/08-reports/USER_STORIES.md` | Analytics and reports by plan |
| Plans | `docs/flow/09-plans/USER_STORIES.md` | Subscription plans, trial, limits |

---

## Monorepo Structure

```
agenda-xpto/
├── apps/
│   ├── api/                        # Fastify backend (✅ complete)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Source of truth for DB schema
│   │   │   └── seed.ts             # Dev seed data
│   │   └── src/
│   │       ├── app.ts              # Entry point (main + listen)
│   │       ├── server.ts           # buildServer() — plugins and routes
│   │       ├── modules/            # Feature modules (one per domain)
│   │       ├── jobs/               # BullMQ queues and workers
│   │       ├── lib/                # Singletons (prisma, redis, email, bullmq, logger)
│   │       ├── shared/             # AppError, middlewares, utils, schemas
│   │       └── plugins/            # Fastify plugins
│   └── web/                        # React frontend (⏳ in progress)
│       └── src/
│           ├── modules/            # Feature modules (mirrors docs/flow/)
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── establishments/
│           │   ├── availability/
│           │   ├── appointments/
│           │   ├── booking/
│           │   ├── reports/
│           │   └── plans/
│           ├── components/
│           │   ├── ui/             # base components (Button, Input, Modal...)
│           │   └── shared/         # business components (AppointmentCard...)
│           ├── hooks/              # global hooks
│           ├── lib/
│           │   ├── axios.ts        # singleton with auth interceptors
│           │   └── queryClient.ts  # TanStack Query config
│           ├── stores/             # Zustand stores
│           ├── router/             # TanStack Router — routes and layouts
│           └── types/              # local frontend types
├── packages/
│   ├── types/                      # Shared TypeScript types
│   └── validations/                # Shared Zod schemas
└── docs/                           # Full product documentation
    ├── PRD.md
    ├── flow/
    └── _roadmap/
```

---

## Backend Tech Stack (✅ Complete)

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x (strict) |
| Framework | Fastify v5 |
| ORM | Prisma 6.x + PostgreSQL 16 |
| Auth | Better Auth |
| Queues | BullMQ + Redis 7 |
| Email | Resend |
| Validation | Zod v4 |
| Logger | Pino (via Fastify) |
| Testing | Vitest (268 tests passing) |
| Monorepo | Turborepo + pnpm workspaces |
| Dev infra | Docker Compose (PostgreSQL + Redis) |

## Frontend Tech Stack (⏳ In Progress)

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 + TypeScript |
| Routing | TanStack Router v1 |
| Server state | TanStack Query v5 |
| Global UI state | Zustand v5 |
| Forms | React Hook Form + Zod v4 |
| HTTP client | Axios |
| Styling | Tailwind CSS v4 |
| Components | Custom with Tailwind (no UI library) |
| Calendar | FullCalendar React |
| Component docs | Storybook 8 + interactions |
| API mocking | MSW (Mock Service Worker) |
| Testing | Vitest + Testing Library |
| E2E (future) | Playwright |

---

## Backend Module Structure

```
src/modules/<module>/
├── <module>.routes.ts       # HTTP layer only
├── <module>.service.ts      # Business logic
├── <module>.repository.ts   # DB queries (Prisma only)
├── <module>.schema.ts       # Zod schemas + inferred types
└── __tests__/
    ├── <module>.service.test.ts
    └── <module>.repository.test.ts
```

**Layer rules:**
- Routes → call Service only
- Service → call Repository only (never import Prisma directly)
- Repository → use Prisma only (never contain business logic)

## Frontend Module Structure

```
src/modules/<module>/
├── components/              # module-specific components
├── hooks/                   # module-specific hooks
├── pages/                   # pages/routes
├── stores/                  # Zustand stores (if needed)
├── schemas/                 # module-specific Zod schemas
└── __tests__/
```

---

## API Bootstrap (`app.ts` vs `server.ts`)

- `src/app.ts` — entry point only (`main` + `listen`). **Never import in tests.**
- `src/server.ts` — `buildServer()` with all plugins and routes. **Use this in tests.**
- New HTTP modules must register via `server.ts`

---

## Path Aliases

### Backend (`apps/api`)
```
~/lib/*      →  apps/api/src/lib/*
~/shared/*   →  apps/api/src/shared/*
~/jobs/*     →  apps/api/src/jobs/*
~/modules/*  →  apps/api/src/modules/*
@agenda-xpto/types        →  packages/types/src
@agenda-xpto/validations  →  packages/validations/src
```

### Frontend (`apps/web`)
```
~/components/*  →  apps/web/src/components/*
~/hooks/*       →  apps/web/src/hooks/*
~/lib/*         →  apps/web/src/lib/*
~/modules/*     →  apps/web/src/modules/*
~/stores/*      →  apps/web/src/stores/*
~/router/*      →  apps/web/src/router/*
~/types/*       →  apps/web/src/types/*
@agenda-xpto/types        →  packages/types/src
@agenda-xpto/validations  →  packages/validations/src
```

---

## Key Business Rules

### Appointments
- Created directly as `CONFIRMED` — `PENDING` never persisted
- Only `CONFIRMED` appointments block availability slots
- `end_at` = `start_at` + sum of `snapshot_duration_minutes`
- `cancel_token` generated at creation, invalidated after use

### Slot Algorithm
1. Within `establishment_business_hours` for that weekday
2. Within `professional_availabilities` blocks
3. No `establishment_holidays` for that date
4. No active `blocks` covering the period
5. No `CONFIRMED` appointment overlapping
6. `start_at >= now + establishment.min_advance_minutes`

### Plans & Limits
| Plan | Establishments | Professionals | Appointments/month |
|---|---|---|---|
| Starter | 1 | up to 2 | up to 100 |
| Pro | up to 3 | up to 10 | unlimited |
| Business | up to 10 | unlimited | unlimited |

- Trial: 15 days Pro, no credit card
- Starter alerts at 80 and 90; hard block at 100
- Downgrade: hard gate — resolve conflicts first

### Notifications
- Retry: 3 attempts, backoff 1min → 5min → 15min
- Only `REMINDER_2H` failure alerts owner
- `idempotency_key` prevents duplicates

### Multi-tenancy
- Always validate `establishmentId` ownership against `userId`
- Never accept `establishmentId` from request body on writes

---

## Database Conventions

- Primary keys: `cuid2` strings
- All `DateTime` in UTC; timezone in `establishment.timezone`
- Soft delete via `deleted_at` on: users, establishments, professionals, services
- Monetary values in **cents** as `Int` (`price_cents: 4500` = R$45,00)
- Never write raw SQL — Prisma only
- All queries in `*.repository.ts` files

---

## Code Conventions

- **Language:** PT-BR responses; English in all code, comments, commits
- **Exports:** named exports only — no default exports
- **Types:** `type` not `interface` — consistent with Zod
- **Enums:** `const` objects with `as const`
- **Async:** `async/await` only — no `.then()/.catch()`
- **Commits:** Conventional Commits — `feat(module): description`

---

## Testing

### Backend
- Vitest, 268 tests passing
- Coverage: 93% lines, 97% functions minimum
- Service tests: unit (mocked repository)
- Repository tests: integration (real PostgreSQL)

### Frontend
- Vitest + Testing Library
- Every `ui/` and `shared/` component MUST have a Storybook story
- MSW for API mocking in tests and Storybook
- E2E with Playwright: post-MVP

---

## `plans` module — existing file

`src/modules/plans/subscription.repository.ts` already exists. **Extend it** — do not create a duplicate.

---

## Agent Rules

As regras de comportamento para agentes (Cursor, Antigravity, Claude, Gemini) estão em `.agents/rules/` e devem ser seguidas rigorosamente:

| Rule file | Path | Covers |
|---|---|---|
| `language-standards.md` | `.agents/rules/language-standards.md` | PT-BR responses, English code |
| `architecture.md` | `.agents/rules/architecture.md` | Backend module structure |
| `typescript-conventions.md` | `.agents/rules/typescript-conventions.md` | Types, Zod, Prisma typing |
| `import-organization.md` | `.agents/rules/import-organization.md` | Import order, aliases |
| `testing-tdd.md` | `.agents/rules/testing-tdd.md` | TDD, Vitest, coverage |
| `swagger-docs.md` | `.agents/rules/swagger-docs.md` | OpenAPI documentation |
| `database-prisma.md` | `.agents/rules/database-prisma.md` | Prisma patterns |
| `security.md` | `.agents/rules/security.md` | Auth, tenant isolation |
| `frontend.md` | `.agents/rules/frontend.md` | Frontend architecture, Storybook |

---

## Development Workflow

```bash
docker compose up -d

# Backend
pnpm --filter api dev
pnpm --filter api test
pnpm --filter api test:integration
pnpm --filter api test:coverage
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:studio

# Frontend
pnpm --filter web dev
pnpm --filter web storybook
pnpm --filter web test
pnpm --filter web test:coverage
```

---

## Module Status

### Backend (✅ All complete)
auth, establishments, availability, booking, appointments, notifications, reports, plans

### Frontend (⏳ In progress)
Design system → auth → dashboard → establishments → availability → appointments → booking → reports → plans

---

## What NOT to Implement

Post-MVP — do not implement until explicitly requested:
- WhatsApp integration
- AI assistant / FAQ knowledge base
- IA credits
- Online payment
- Mobile app
- Affiliate program
- Social media integrations
- SMS notifications
- Playwright E2E tests

Documented in `docs/_roadmap/`.

---

*Keep this file updated when significant architectural decisions are made.*