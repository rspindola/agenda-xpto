# Testing Infrastructure

## Test Frameworks

**Unit/Integration:** Vitest + Testing Library (@testing-library/react, @testing-library/user-event)
**Component Documentation:** Storybook + Interactions (@storybook/addon-interactions)
**E2E:** Playwright (Post-MVP)
**Coverage:** Vitest coverage (c8/v8)

## Test Organization

**Location:** `src/**/__tests__/`
**Naming:** `*.test.ts`, `*.test.tsx`
**Structure:** Unit tests for hooks/services, Integration tests for components.

## Testing Patterns

### Unit Tests
**Approach:** Test logic in isolation.
**Location:** Next to source files in `__tests__/`.

### Component Tests
**Approach:** React Testing Library + user-event to verify user interactions.
**Location:** Next to components in `__tests__/`.

### Interaction Tests (Storybook)
**Approach:** Use Storybook `play` functions and `@storybook/test` for automated visual regression and behavior checks.
**Location:** Within `*.stories.tsx` files.

## Test Execution

**Commands:**
- `pnpm test`: Run all tests once.
- `pnpm test:coverage`: Run tests with coverage report.

## Gate Check Commands

| Gate Level | When to Use                            | Command                     |
| ---------- | -------------------------------------- | --------------------------- |
| Quick      | After component/hook changes           | `pnpm test`                 |
| Full       | Before pushing                         | `pnpm lint && pnpm test`    |
| Build      | CI/CD                                  | `pnpm build`                |

## Test Coverage Matrix

| Code Layer | Required Test Type          | Location Pattern       | Run Command |
| ---------- | --------------------------- | ---------------------- | ----------- |
| UI Components | Integration (Vitest)     | `src/components/ui/**/__tests__/*.test.tsx` | `pnpm test` |
| Business Logic | Unit (Vitest)          | `src/modules/**/__tests__/*.test.ts` | `pnpm test` |
| Routes      | Unit/Integration (Vitest) | `src/routes/**/__tests__/*.test.tsx` | `pnpm test` |
