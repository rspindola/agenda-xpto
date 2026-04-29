# AGENTS.md — Agenda XPTO

This file provides context for AI agents (Cursor, Claude, Copilot, etc.) working on the Agenda XPTO project. Read this file before making any changes to the codebase.

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
│   └── api/                        # Fastify backend (active development)
│       ├── prisma/
│       │   ├── schema.prisma       # Source of truth for DB schema
│       │   └── seed.ts             # Dev seed data
│       └── src/
│           ├── app.ts              # Fastify bootstrap
│           ├── modules/            # Feature modules (one per domain)
│           ├── jobs/               # BullMQ queues and workers
│           ├── lib/                # Singletons (prisma, redis, email, bullmq)
│           ├── shared/             # AppError, middlewares, utils
│           └── plugins/            # Fastify plugins
├── packages/
│   ├── types/                      # Shared TypeScript types
│   └── validations/                # Shared Zod schemas
└── docs/                           # Full product documentation
    ├── PRD.md
    ├── flow/                       # Module-level docs (user stories, diagrams)
    └── _roadmap/                   # Post-MVP features (do not implement)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x (strict) |
| Framework | Fastify v5 |
| ORM | Prisma 6.x + PostgreSQL 16 |
| Auth | Better Auth |
| Queues | BullMQ + Redis 7 |
| Email | Resend |
| Validation | Zod |
| Testing | Vitest |
| Monorepo | Turborepo + pnpm workspaces |
| Dev infra | Docker Compose (PostgreSQL + Redis) |

---

## Module Structure

Every feature module MUST follow this exact structure:

```
src/modules/<module>/
├── <module>.routes.ts       # HTTP layer only — no business logic
├── <module>.service.ts      # Business logic — no Prisma imports
├── <module>.repository.ts   # DB queries only — Prisma here
├── <module>.schema.ts       # Zod schemas + inferred types
└── __tests__/
    ├── <module>.service.test.ts      # Unit tests (mocked repository)
    └── <module>.repository.test.ts   # Integration tests (real DB)
```

**Layer rules:**
- Routes → call Service only
- Service → call Repository only (never import Prisma directly)
- Repository → use Prisma only (never contain business logic)

---

## Path Aliases

```
~/lib/*           →  apps/api/src/lib/*
~/shared/*        →  apps/api/src/shared/*
~/jobs/*          →  apps/api/src/jobs/*
~/modules/*       →  apps/api/src/modules/*
@agenda-xpto/types   →  packages/types/src
@agenda-xpto/validations  →  packages/validations/src
```

Never use relative paths with more than one level (`../../`).

---

## Key Business Rules

### Appointments
- Appointment is created directly as `CONFIRMED` — `PENDING` is never persisted
- Only `CONFIRMED` appointments block availability slots
- `end_at` = `start_at` + sum of all `snapshot_duration_minutes` in `appointment_services`
- `cancel_token` is a UUID generated at creation — invalidated after use via `cancel_token_used_at`
- Snapshot of service name/price/duration is stored in `appointment_services` at booking time

### Availability Slot Algorithm
A slot is available when ALL of the following are true:
1. Within `establishment_business_hours` for that weekday
2. Within `professional_availabilities` blocks for that weekday
3. No `establishment_holidays` record for that date
4. No active `blocks` covering the period (scope: ESTABLISHMENT or PROFESSIONAL)
5. No `CONFIRMED` appointment overlapping `[start_at, end_at)`
6. `start_at >= now + establishment.min_advance_minutes`

### Plans & Limits
| Plan | Establishments | Professionals | Appointments/month |
|---|---|---|---|
| Starter | 1 | up to 2 | up to 100 |
| Pro | up to 3 | up to 10 per establishment | unlimited |
| Business | up to 10 | unlimited | unlimited |

- Trial: 15 days on Pro plan, no credit card required
- Starter quota: counter in `subscription.starter_monthly_appointments_count`, reset on day 1 of each month in establishment timezone
- Alerts at 80 and 90 appointments; hard block at 100
- Downgrade: hard gate — conflicts must be resolved before downgrade completes

### Notifications (Email only in MVP)
- Retry policy: 3 attempts with exponential backoff (1 min → 5 min → 15 min)
- Only `REMINDER_2H` failure alerts the owner via email after permanent failure
- `idempotency_key` prevents duplicate notifications

### Multi-tenancy
- Every resource belongs to an `establishment`, which belongs to a `user`
- Always validate `establishmentId` ownership against the authenticated `userId`
- Never accept `establishmentId` from request body on write operations

---

## Database Conventions

- Primary keys: `cuid2` strings
- All `DateTime` stored in UTC; timezone stored in `establishment.timezone`
- Soft delete via `deleted_at` on: `users`, `establishments`, `professionals`, `services`
- Monetary values always in **cents** as `Int` (e.g., `price_cents: 4500` = R$45,00)
- Never write raw SQL — use Prisma only
- All Prisma queries live in `*.repository.ts` files only

---

## Code Conventions

- **Language:** responses to user in Brazilian Portuguese; all code, comments, commits in English
- **Exports:** named exports only — no default exports anywhere
- **Types:** use `type` (not `interface`) — consistent with Zod inference
- **Enums:** use `const` objects with `as const` — no TypeScript `enum`
- **Errors:** always throw `AppError` — never `new Error('message')`
- **Async:** always `async/await` — no `.then()/.catch()` chains
- **Commits:** Conventional Commits in English — `feat(module): description`

---

## Testing

- Framework: **Vitest**
- Service tests: unit, repository mocked with `vi.mock()`
- Repository tests: integration, real PostgreSQL test database
- Minimum coverage: **80%** per module (lines, functions, branches)
- TDD preferred: write tests before or alongside implementation
- Test file naming: `<module>.<layer>.test.ts`

---

## Cursor Rules

All coding standards are enforced via `.cursor/rules/`:

| Rule file | Covers |
|---|---|
| `language-standards.mdc` | PT-BR responses, English code and commits |
| `architecture.mdc` | Module structure, layer responsibilities |
| `typescript-conventions.mdc` | Types, generics, Zod, Prisma typing |
| `import-organization.mdc` | Import order, path aliases |
| `testing-tdd.mdc` | TDD workflow, Vitest, coverage |
| `swagger-docs.mdc` | OpenAPI documentation on every endpoint |
| `database-prisma.mdc` | Prisma patterns, soft delete, transactions |
| `security.mdc` | Auth, tenant isolation, sensitive data |

---

## Development Workflow

```bash
# Start local services
docker compose up -d

# Run API in watch mode
pnpm --filter api dev

# Run tests
pnpm --filter api test

# Run tests with coverage
pnpm --filter api test:coverage

# Generate Prisma client after schema changes
pnpm --filter api db:generate

# Create a new migration
pnpm --filter api db:migrate

# Reset and reseed dev database
pnpm --filter api db:seed

# Open Prisma Studio
pnpm --filter api db:studio
```

---

## What NOT to Implement

The following features are **post-MVP** and must not be implemented until explicitly requested:

- WhatsApp integration (any form)
- AI assistant or FAQ knowledge base
- IA credits system
- Online payment / billing integration
- Mobile app for owners
- Affiliate program
- Social media integrations
- SMS notifications (evaluate free provider when needed)

These are documented in `docs/_roadmap/` for future reference.

---

*Keep this file updated when significant architectural decisions are made.*