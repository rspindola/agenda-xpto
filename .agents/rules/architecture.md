# Code Architecture - Agenda XPTO API

## Purpose & Scope
This rule enforces the modular layered architecture defined in `docs/flow/00-sustain/ARCHITECTURE.md`. Every backend feature MUST follow the established patterns for routes, services, repositories, and schemas.

## Module Structure
- **MUST** organize every feature inside `src/modules/<module-name>/` following this exact structure:
  ```
  src/modules/<module>/
  ├── <module>.routes.ts      # HTTP layer: input validation + service calls
  ├── <module>.service.ts     # Business logic layer
  ├── <module>.repository.ts  # Database layer: Prisma queries only
  ├── <module>.schema.ts      # Zod schemas for input/output
  └── __tests__/
      ├── <module>.service.test.ts
      └── <module>.repository.test.ts
  ```
- **MUST** use kebab-case for all file names.
- **NEVER** add business logic to route handlers.
- **NEVER** import Prisma directly in service files — always use the repository.
- **NEVER** import the repository directly in route handlers — always use the service.

## Routes Layer (`*.routes.ts`)
- **MUST** validate all incoming data with Zod schemas before calling the service.
- **MUST** use `fastify-type-provider-zod` for type-safe request/response.
- **MUST** include full Swagger documentation on every route.
- **MUST** return HTTP status codes consistently (200, 201, 204, 400, 401, 403, 404, 422, 500).

## Service Layer (`*.service.ts`)
- **MUST** contain all business logic and domain rules.
- **MUST** throw `AppError` for all expected error cases with a specific `code`.

## Repository Layer (`*.repository.ts`)
- **MUST** contain all Prisma queries — no raw SQL.
- **MUST** use `prisma` singleton from `~/lib/prisma`.

## Schema Layer (`*.schema.ts`)
- **MUST** define Zod schemas and export inferred TypeScript types.
- **MUST** reuse schemas from `@agenda-xpto/validations` when available.

## TypeScript & Imports
- **MUST** enable `strict: true`.
- **MUST** use `type` instead of `interface`.
- **MUST** use path aliases and named exports.
- **NEVER** use relative imports with more than one level (`../../`).
