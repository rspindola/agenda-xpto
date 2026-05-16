# Code Conventions

## Naming Conventions

**Files:**
- Kebab-case for generic files (`tanstack-query`, `root-provider.tsx`).
- PascalCase for React components (`Button.tsx`).
- `.stories.tsx` / `.stories.ts` for Storybook.

**Components:**
- PascalCase: `export const Button = ...`

**Functions/Methods:**
- camelCase: `export function getRouter() { ... }`

## Code Organization

**Import Ordering:**
1. React / Library imports
2. Local component / utility imports
3. Style imports (e.g., `styles.css`)

**Example (src/router.tsx):**
```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { ReactNode } from 'react'
// ...
```

## Type Safety

**Approach:** TypeScript (strict mode).
- Use `type` instead of `interface` for props/data (consistent with Zod).
- Explicit `type` for props in React components.

## Error Handling

**Pattern:** Not yet fully implemented in frontend samples, but backend uses `AppError`. Frontend should likely use standard catch-and-toast or Error Boundaries.

## Styling (Tailwind CSS v4)

**Pattern:**
- MUST use utility classes.
- MUST use `cn()` helper (Tailwind Merge + CLSX) for class composition.
- MUST use `cva()` for complex component variants.
- NEVER use arbitrary values or custom CSS files (except `styles.css` for globals).

## API & Data Fetching

**Pattern:**
- MUST use the Axios singleton from `~/lib/axios.ts` (yet to be implemented).
- MUST use TanStack Query hooks for all server-side operations.
