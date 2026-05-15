# Testing — Agenda XPTO

## Strategy
- **Unit Tests:** Focus on `*.service.ts`. Repositories are mocked using manual typed mocks.
- **Integration Tests:** Focus on `*.repository.ts`. These run against a real PostgreSQL instance (usually via Docker).
- **E2E Tests:** Planned (Playwright) for post-MVP.

## Tooling
- **Framework:** Vitest
- **Mocking:** Manual mocks with constructor injection or `vi.mock()`.
- **Coverage:** `@vitest/coverage-v8`.

## Requirements
- **Coverage:** Minimum 80% coverage per module (lines, functions, branches).
- **TDD:** Recommended Red-Green-Refactor cycle.
- **Location:** All tests must reside in a `__tests__/` folder within the module.

## Commands
- `pnpm --filter api test`: Run unit tests.
- `pnpm --filter api test:integration`: Run integration tests.
- `pnpm --filter api test:coverage`: Run tests with coverage report.
