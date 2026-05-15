# Swagger / OpenAPI Documentation - Agenda XPTO API

## General Rules
- Documentation is **NOT OPTIONAL**. Undocumented endpoints MUST NOT be merged.
- **MUST** use `fastify-type-provider-zod`.

## Route Documentation
- Every route MUST include a `schema` with: `tags`, `summary`, `description`, and `response` for all possible status codes.
- **MUST** reference named schemas from `*.schema.ts`, not defined inline.

## Examples
- **MUST** add realistic examples using `.openapi({ example: ... })`.
- **NEVER** use generic values like `foo`, `bar`, or `123`.

## Validation
- Verify `/docs` in development after any route change.
