# GitHub Copilot Instructions — Agenda XPTO

Instruções de customização para GitHub Copilot no projeto **Agenda XPTO**, um SaaS de agendamentos para pequenos estabelecimentos de beleza e estética.

**Referência:** [AGENTS.md](../AGENTS.md) (documentação completa do projeto e PRD) | [ARCHITECTURE.md](../docs/flow/00-sustain/ARCHITECTURE.md) | [DATABASE.md](../docs/flow/00-sustain/DATABASE.md)

---

## Language Standards

### User Communication
- Responda ao usuário **sempre em Português Brasileiro (pt-BR)**.
- Não misture idiomas na mesma resposta.
- Explique erros, sugestões e debugging em português.

### Code & Documentation
- **Todos** os nomes de variáveis, funções, classes e tipos: **English**
- **Todos** os comentários de código: **English**
- **Todos** os JSDoc/TSDoc: **English**
- **Todos** os Git commits: **English** seguindo Conventional Commits
- **Todos** os error messages e logs: **English**
- **Todos** os Swagger/OpenAPI summaries: **English**

### Conventional Commits (English only)
```
feat(module): add new feature
fix(module): correct bug
test(module): add unit tests
chore(prisma): update schema
docs(swagger): add endpoint examples
```

---

## Project Structure & Tech Stack

Veja [ARCHITECTURE.md](../docs/flow/00-sustain/ARCHITECTURE.md) para detalhes completos.

### Monorepo
- **Monorepo tool:** Turborepo + pnpm workspaces
- **Backend:** `apps/api/` (Fastify + Node.js 22 LTS)
- **Types compartilhados:** `packages/types/`
- **Schemas Zod compartilhados:** `packages/validations/`

### Backend Stack
| Camada | Tech |
|--------|------|
| Runtime | Node.js 22 LTS |
| Framework | Fastify v5 |
| ORM | Prisma 6.x |
| Database | PostgreSQL 16 |
| Validation | Zod 4.x |
| Auth | Better Auth |
| Queues | BullMQ + Redis 7 |
| Testing | Vitest |
| Email | Resend |

### Common Commands
```bash
# Start local services (PostgreSQL + Redis)
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
```

---

## Module Architecture

**MUST** organize every feature inside `src/modules/<module-name>/` com esta estrutura exata:

```
src/modules/<module>/
├── <module>.routes.ts       # HTTP layer: validation + calls to service
├── <module>.service.ts      # Business logic layer
├── <module>.repository.ts   # DB layer: Prisma queries only
├── <module>.schema.ts       # Zod schemas + inferred types
└── __tests__/
    ├── <module>.service.test.ts      # Unit tests (mocked repo)
    └── <module>.repository.test.ts   # Integration tests (real DB)
```

### Layer Responsibilities

**Routes (`*.routes.ts`)**
- Validate incoming data with Zod before calling service
- Use `fastify-type-provider-zod` for type safety
- Include full Swagger documentation on every route
- Never catch errors — let global error handler manage them
- Keep handler functions under 50 lines

**Service (`*.service.ts`)**
- Contain ALL business logic and domain rules
- Throw `AppError` for expected cases with specific `code`
- Fully testable without HTTP context
- Never import Prisma directly — use repository only
- Declare explicit return types

**Repository (`*.repository.ts`)**
- ALL Prisma queries only — no business logic
- Use `prisma` singleton from `~/lib/prisma`
- Accept typed parameters, return typed results
- Enforce tenant isolation with `establishmentId` checks
- Use `select` to avoid over-fetching
- Use pagination (`skip`, `take`) on list queries

**Schema (`*.schema.ts`)**
- Define ALL Zod schemas for request/query/response
- Export inferred TypeScript types: `export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>`
- Reuse schemas from `@agenda-xpto/validations` when available

---

## TypeScript Conventions

### General Rules
- **MUST:** Enable `strict: true` in all `tsconfig.json` — no exceptions
- **MUST:** Use `type` (not `interface`) for ALL type definitions — consistency with Zod inference
- **MUST:** Use `unknown` instead of `any` for uncertain types
- **MUST:** Always declare explicit return types on public methods
- **NEVER:** Use `any` type
- **NEVER:** Use type assertions (`as`) without a comment explaining why
- **NEVER:** Use non-null assertions (`!`) without a comment
- **NEVER:** Use `enum` — use `const` objects with `as const` instead

### Naming Conventions
- **PascalCase:** types, classes, components
- **camelCase:** variables, functions, methods
- **UPPER_SNAKE_CASE:** constants and `as const` objects

### Enums → Const Objects
```typescript
// ✅ DO
const AppointmentStatus = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;
type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

// ❌ DON'T
enum AppointmentStatus { CONFIRMED = 'CONFIRMED' }
```

### Generics
Use **descriptive** generic names, not single letters:
```typescript
// ✅ DO
type PaginatedResult<TItem> = { data: TItem[]; total: number };
async function findById<TEntity>(id: string): Promise<TEntity | null> {}

// ❌ DON'T
type Result<T> = { data: T };
```

### Zod Typing
```typescript
// ✅ DO: schema + inferred type exported together
export const createAppointmentBodySchema = z.object({
  professionalId: z.string().cuid2(),
  startAt: z.string().datetime(),
});
export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>;
```

### Error Handling
```typescript
// ✅ DO: typed catch with AppError
try {
  await someOperation();
} catch (error: unknown) {
  if (error instanceof AppError) throw error;
  throw new AppError({ statusCode: 500, code: 'INTERNAL_ERROR', message: '...' });
}
```

---

## Import Organization

**MUST** follow this exact order with blank lines between groups:

1. Node.js built-ins: `node:crypto`, `node:path`
2. External libraries: `fastify`, `zod`, `@prisma/client`
3. Internal packages: `@agenda-xpto/types`, `@agenda-xpto/validations`
4. Path aliases: `~/lib/*`, `~/shared/*`, `~/jobs/*`, `~/modules/*`
5. Type-only imports: `import type ...`

```typescript
// ✅ DO
import { randomUUID } from 'node:crypto';

import { type FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { EstablishmentPublic } from '@agenda-xpto/types';

import { prisma } from '~/lib/prisma';
import { AppError } from '~/shared/errors/AppError';
import { createAppointmentBodySchema } from '~/modules/appointments/appointments.schema';
```

### Path Aliases (NO relative imports allowed)
| Alias | Resolves to |
|-------|-------------|
| `~/lib/*` | `apps/api/src/lib/*` |
| `~/shared/*` | `apps/api/src/shared/*` |
| `~/jobs/*` | `apps/api/src/jobs/*` |
| `~/modules/*` | `apps/api/src/modules/*` |
| `@agenda-xpto/types` | `packages/types/src` |
| `@agenda-xpto/validations` | `packages/validations/src` |

**NEVER** use relative imports like `../../lib/prisma` or `./appointments.repository`.

---

## Database & Prisma

Veja [DATABASE.md](../docs/flow/00-sustain/DATABASE.md) para schema completo e regras de negócio.

### General Rules
- **MUST:** Use Prisma singleton from `~/lib/prisma` — never instantiate `PrismaClient` directly
- **MUST:** Keep ALL Prisma queries inside `*.repository.ts` files
- **MUST:** All monetary values stored in **cents** as `Int` (e.g., `4500` = R$45,00)
- **MUST:** All `DateTime` stored in UTC; timezone stored in `establishment.timezone`
- **NEVER:** Write raw SQL unless absolutely unavoidable — document why
- **NEVER:** Import `prisma` inside `*.service.ts` or `*.routes.ts`
- **NEVER:** Use `prisma.findMany()` without pagination on large tables

### Migrations
```bash
# Generate migration after schema changes
pnpm --filter api db:migrate

# Use descriptive names
pnpm prisma migrate dev --name add_cancel_token_to_appointments
```

### Soft Delete
Use `deletedAt` for soft delete on: `users`, `establishments`, `professionals`, `services`.

```typescript
// ✅ DO: soft delete
await prisma.professional.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// ❌ DON'T: hard delete on soft-delete entity
await prisma.professional.delete({ where: { id } });
```

**MUST** always filter `deletedAt: null` in queries.

### Tenant Isolation
**MUST** validate that every resource belongs to the authenticated user:

```typescript
// CORRECT: scoped query with tenant isolation
async findByEstablishment(
  establishmentId: string,
  page: number,
): Promise<Service[]> {
  return prisma.service.findMany({
    where: { establishmentId, deletedAt: null },
    select: { id: true, name: true, durationMinutes: true, priceCents: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * 20,
    take: 20,
  });
}
```

### Transactions
Use `prisma.$transaction()` when multiple writes must succeed/fail together:

```typescript
return prisma.$transaction(async (tx) => {
  const appointment = await tx.appointment.create({ data: { ...data } });
  await tx.appointmentService.createMany({ data: [...services] });
  return appointment;
});
```

---

## Testing & TDD

**Full rule set:** [.cursor/rules/testing-tdd.mdc](../.cursor/rules/testing-tdd.mdc) (Vitest, mocks, ESLint for tests).

### Workflow (Red → Green → Refactor)
1. Write failing test that describes expected behavior
2. Write minimum code to make test pass
3. Refactor while keeping tests green

**MUST** write tests before or alongside implementation.

### Test Structure
```typescript
// src/modules/<module>/__tests__/<module>.service.test.ts

describe('ModuleName', () => {
  describe('methodName', () => {
    it('should <expected> when <condition>', () => { /* ... */ });
    it('should throw <ErrorCode> when <invalid>', () => { /* ... */ });
  });
});
```

### Service Tests (Unit)
- **MUST** mock the repository with **manual typed mocks** (`vi.fn()` passed into the service constructor). Prefer constructor injection over `vi.mock()` on whole application modules — module-level `vi.mock()` strips types and encourages `any` / `eslint-disable`.
- Test every public method + all error cases
- Assert exact `AppError.code` when testing errors
- Never connect to database

### Approved mock patterns (no eslint-disable)
- **MUST NOT** use `eslint-disable` / `eslint-disable-next-line` in tests to hide type issues — fix types, use `vi.mocked()`, or extend `apps/api/eslint.config.js` for rules that legitimately apply to all test files (e.g. `@typescript-eslint/unbound-method` is **off** for `*.test.ts` so `vi.mocked(mock.method)` stays idiomatic).
- **MUST** use `vi.mocked(repository.method)` for `mockResolvedValue*` / assertions — **NEVER** cast repo methods to `{ mockResolvedValueOnce: ... }`, and **NEVER** use `as any` or `as never` on mock payloads; use exported row/DTO types or `satisfies`.
- **MUST** read `mock.calls` in a typed way (e.g. assert `calls.length`, then use `calls[0][0]`) instead of `as any` on call arguments.
- **SHOULD** use `as unknown as FullRepository` only inside mock factory helpers when the fake is intentionally partial; `@typescript-eslint/no-unnecessary-type-assertion` is **off** for `*.test.ts` in `apps/api/eslint.config.js` for that pattern.
- For thrown `AppError`, prefer `await expect(promise).rejects.toMatchObject({ code: '...' })` over `rejects.toThrow(expect.objectContaining(...))` to avoid unsafe-argument issues on matchers.

### Repository Tests (Integration)
- Real PostgreSQL test database
- Test query accuracy and filtering
- Test pagination, sorting, soft delete

### Coverage Requirements
- **Minimum:** 80% coverage per module (lines, functions, branches)
- Use `pnpm --filter api test:coverage`

---

## Security

### Input Validation
- **MUST:** Validate ALL incoming data (body, params, query) with Zod at route level
- **MUST:** Validate before passing to service
- **NEVER:** Pass raw `request.body` or `request.params` to service

### Authentication
- **MUST:** Protect all `/dashboard/*` routes with Better Auth session middleware
- **MUST:** Extract `userId` from verified session — never from request
- **NEVER:** Trust client-provided user IDs

### Tenant Isolation (Multi-establishment)
- **MUST:** Validate every resource belongs to authenticated user before read/write
- **MUST:** Throw `AppError` with `statusCode: 403` and `code: FORBIDDEN` on tenant mismatch
- **NEVER:** Accept `establishmentId` from request body for write operations

```typescript
// CORRECT: tenant isolation in service
async getAppointment(userId: string, appointmentId: string) {
  const appointment = await this.repository.findById(appointmentId);

  if (!appointment) {
    throw new AppError({ statusCode: 404, code: 'APPOINTMENT_NOT_FOUND', message: '...' });
  }

  if (appointment.establishment.userId !== userId) {
    throw new AppError({ statusCode: 403, code: 'FORBIDDEN', message: 'Access denied.' });
  }

  return appointment;
}
```

### Cancel Token
- **MUST:** Generate as cryptographically random UUID: `crypto.randomUUID()`
- **MUST:** Validate `cancelTokenUsedAt` is null before allowing cancellation
- **MUST:** Set `cancelTokenUsedAt` immediately upon use
- **NEVER:** Log, return, or expose `cancelToken` after creation response

### Sensitive Data
- **NEVER** log: passwords, tokens, emails, phones, `cancelToken`
- **NEVER** return stack traces in production error responses
- **MUST** sanitize error messages before sending

### Rate Limiting
- **MUST** apply rate limiting to public routes (booking, cancel token)
- **MUST** use stricter limits on auth routes (login, signup)
- Use `@fastify/rate-limit`

---

## Swagger / OpenAPI

**MUST** document EVERY route with complete OpenAPI schema.

### Setup
- **MUST** use `fastify-type-provider-zod` as type provider
- **MUST** expose Swagger UI at `/docs` in development only
- **MUST** register `@fastify/swagger` BEFORE routes (see [AGENTS.md](../AGENTS.md#bootstrap))

### Route Documentation
Every route MUST include:

```typescript
fastify.post('/appointments', {
  schema: {
    tags: ['appointments'],
    summary: 'Create appointment',
    description: 'Creates a new appointment with services.',
    body: createAppointmentBodySchema,
    response: {
      201: getAppointmentResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
      422: errorResponseSchema,
    },
  },
}, handler);
```

### Documentation Checklist
- ✅ `tags` — one tag per module
- ✅ `summary` — short one-liner (max 60 chars)
- ✅ `description` — business context
- ✅ `body` — POST/PUT/PATCH schemas
- ✅ `params` — path parameter schemas
- ✅ `querystring` — query parameter schemas
- ✅ `response` — all possible HTTP status codes

### Error Response Schema
Use shared `errorResponseSchema` from `src/shared/schemas/error.schema.ts`:

```typescript
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
});
```

### Example Values
- **MUST** add realistic example values to POST/PUT request schemas
- **NEVER** use `foo`, `bar`, `123` — use domain-realistic values

---

## Business Rules

Veja [DATABASE.md](../docs/flow/00-sustain/DATABASE.md) para regras completas.

### Appointments
- Created directly as `CONFIRMED` — `PENDING` never persisted
- Only `CONFIRMED` appointments block slots
- `end_at` = `start_at` + sum of `snapshot_duration_minutes`
- `cancel_token` is UUID generated at creation, invalidated after use

### Plans & Limits
| Plan | Establishments | Professionals | Appointments/month |
|------|----------------|-----------------|--------------------|
| Starter | 1 | up to 2 | up to 100 |
| Pro | up to 3 | up to 10/est | unlimited |
| Business | up to 10 | unlimited | unlimited |

Trial: 15 days on Pro plan, no credit card required.

### Notifications (Email MVP)
- Retry policy: 3 attempts with exponential backoff (1 min → 5 min → 15 min)
- `idempotency_key` prevents duplicate notifications
- Only `REMINDER_2H` failures alert owner after permanent failure

---

## Common Patterns

### Creating a New Module

1. Create folder: `src/modules/<module>/`
2. Add route file: `<module>.routes.ts`
3. Add service: `<module>.service.ts`
4. Add repository: `<module>.repository.ts`
5. Add schema: `<module>.schema.ts`
6. Create tests: `__tests__/<module>.service.test.ts` + `__tests__/<module>.repository.test.ts`
7. Register in `src/server.ts`: `await registerYourModule(fastify)`

### AppError Convention
```typescript
import { AppError } from '~/shared/errors/AppError';

throw new AppError({
  statusCode: 422,
  code: 'SLUG_ALREADY_TAKEN',
  message: 'Establishment slug is already taken.',
});
```

### Pagination
```typescript
const page = Math.max(1, params.page);
const pageSize = 20;

const items = await this.repository.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

---

## Files to Avoid

**DO NOT** implement features from `docs/_roadmap/`:
- WhatsApp integration
- IA credits system
- FAQ knowledge base
- SMS notifications
- Online payment
- Mobile app
- Affiliate program

These are post-MVP and explicitly documented as out-of-scope.

---

## Getting Help

- **Project Overview:** [AGENTS.md](../AGENTS.md)
- **Architecture Decisions:** [ARCHITECTURE.md](../docs/flow/00-sustain/ARCHITECTURE.md)
- **Database Schema:** [DATABASE.md](../docs/flow/00-sustain/DATABASE.md)
- **ADRs:** [docs/flow/00-sustain/adr/](../docs/flow/00-sustain/adr/)
- **User Stories by Module:** [docs/flow/](../docs/flow/)

---

**Last Updated:** May 2026
