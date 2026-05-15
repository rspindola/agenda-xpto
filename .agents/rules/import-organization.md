# Import Organization - Agenda XPTO

## Import Order
**MUST** follow this exact order with a blank line between each group:
1. Node.js built-ins.
2. External libraries.
3. Internal packages (@agenda-xpto/*).
4. Path aliases (~/*).
5. Type-only imports (import type).

## Path Aliases
- **MUST** use path aliases for ALL imports, even in the same module.
- **PROHIBITED:** Relative imports (`./*`, `../*`).
- Available Aliases: `~/lib`, `~/shared`, `~/jobs`, `~/modules`, `@agenda-xpto/types`, `@agenda-xpto/validations`.

## General Rules
- **MUST** use `import type` for type-only imports.
- **MUST** use named exports and named imports everywhere — no default exports.
- **NEVER** use `import * as X`.
