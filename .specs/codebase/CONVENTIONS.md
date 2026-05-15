# Conventions — Agenda XPTO

## Language
- **Code:** English (variables, functions, comments, commits).
- **Communication:** Portuguese (PT-BR) for responses to the user.
- **Commits:** Conventional Commits (e.g., `feat(auth): add login route`).

## Code Style
- **Exports:** Named exports only (no `default export`).
- **Types:** Use `type`, not `interface`.
- **Naming:**
    - Files: `kebab-case.ts`
    - Variables/Functions: `camelCase`
    - Types/Classes: `PascalCase`
    - Constants: `UPPER_SNAKE_CASE`
- **Async:** Use `async/await` exclusively.

## Backend Module Structure
Every module in `apps/api/src/modules/` MUST have:
- `<module>.routes.ts`
- `<module>.service.ts`
- `<module>.repository.ts`
- `<module>.schema.ts`
- `__tests__/`

## Database Conventions
- Tables: `snake_case` (mapped in Prisma via `@@map`).
- Primary Keys: `cuid2` strings.
- Monetary Values: Integers in **cents** (e.g., `price_cents`).
- Timestamps: `DateTime` in UTC.
- Soft Delete: `deleted_at` field for recoverable entities.

## Path Aliases
- `~/` maps to `apps/api/src/`
- `@agenda-xpto/types` maps to `packages/types/src`
- `@agenda-xpto/validations` maps to `packages/validations/src`
