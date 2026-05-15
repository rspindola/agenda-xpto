# Frontend Architecture - Agenda XPTO Web

## Module Structure
- **MUST** organize features in `src/modules/<module-name>/` with subfolders for components, hooks, pages, stores, schemas.
- **MUST** use kebab-case for file names and PascalCase for React components.

## Components
- Reusable UI in `src/components/ui/`.
- Business shared in `src/components/shared/`.
- **MUST** use explicit `type` for props and named exports.

## Styling (Tailwind)
- **MUST** use utility classes and the `cn()` helper.
- **NEVER** use arbitrary values or custom CSS files.

## TanStack Router & Query
- **MUST** use layouts and protect admin routes.
- **MUST** use custom hooks wrapping `useQuery`/`useMutation`.
- **MUST** define query keys in `queryKeys.ts` per module.

## Zustand
- One store per domain; keep them small (UI state only).
- **NEVER** put server data in Zustand (use TanStack Query).

## Forms & Axios
- **MUST** use React Hook Form + Zod.
- **MUST** use the Axios singleton from `~/lib/axios.ts`.

## Storybook & Testing
- **MUST** write a story for every UI/Shared component.
- **MUST** use Vitest + Testing Library + MSW for mocking.
