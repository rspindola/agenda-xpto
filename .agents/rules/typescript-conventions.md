# TypeScript Conventions - Agenda XPTO

## Standards
- `strict: true` is mandatory.
- Use `type` for everything (unions, primitives, Zod inferred types, and general objects). **No interfaces.**
- Use `import type` for type-only imports.
- **NEVER** use `any`. Use `unknown` and narrow.
- Use PascalCase for Types/Classes, camelCase for variables/functions, UPPER_SNAKE_CASE for constants.

## Typing Patterns
- ALWAYS provide explicit return types for public methods.
- Export inferred types from Zod schemas.
- Use `Prisma.XxxGetPayload` for complex selected/included types.

## Linting
- Convert numbers to strings in template literals.
- Reject promises with `Error` objects, not strings.
- Avoid unnecessary type conversions.
