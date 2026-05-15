# Testing Standards (TDD) - Agenda XPTO API

## Workflow
- **MUST** follow Red -> Green -> Refactor.
- Tests MUST be written before or alongside implementation.

## Structure
- Unit tests (`*.service.test.ts`) with mocked repository.
- Integration tests (`*.repository.test.ts`) with real PostgreSQL test database.
- Place all tests in `__tests__/` within the module.

## Mocks
- **MUST** use manual typed mocks (constructor injection).
- **NEVER** use `any` or `eslint-disable` in mocks.
- Use `vi.mocked()` for assertions.

## Coverage
- Minimum **80% coverage** per module (lines, functions, branches).
