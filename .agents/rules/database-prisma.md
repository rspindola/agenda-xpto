# Database & Prisma Conventions - Agenda XPTO API

## General Rules
- **MUST** use the Prisma singleton from `~/lib/prisma`.
- **MUST** keep all Prisma queries inside `*.repository.ts` files.
- **NEVER** write raw SQL unless absolutely unavoidable.

## Soft Delete
- **MUST** use `deletedAt` for soft delete on: `users`, `establishments`, `professionals`, `services`.
- **MUST** always filter `deletedAt: null` in queries.
- **NEVER** use Prisma's `delete()` on soft-delete entities — use `update`.

## Querying Patterns
- **MUST** filter by `establishmentId` (or `userId`) to enforce tenant isolation.
- **MUST** use `select` and pagination (`skip`, `take`) — default size: 20.

## Transactions
- **MUST** use `prisma.$transaction()` for atomic multi-record operations (appointments, plan changes).

## Monetary Values
- **MUST** store monetary values as integers in **cents** (`price_cents`).
- **MUST** convert to/from cents at the schema boundary (Zod transform).
- **NEVER** use `Float` or `Decimal` for money.

## Sensitive Data
- **NEVER** log or return sensitive fields like `clientEmail`, `clientPhone`, `cancelToken` in standard list/detail responses.
