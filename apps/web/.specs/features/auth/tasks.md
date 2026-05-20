# Tasks — Authentication & Onboarding Welcome Wizard

**Design**: [design.md](file:///Users/renato.castro/workspace/copilot-test/apps/web/.specs/features/auth/design.md)
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation & Mock Setup (Sequential)
Establish validation rules, mock API servers (MSW), global stores, and hooks before building any visual interface.

```
T1 ──→ T2 ──→ T3 ──→ T4
```

### Phase 2: Backend Service CRUD - Option A (Sequential)
Implement database-backed service creation endpoints to support Step 3 (Service Setup) during local development.

```
T5 ──→ T6 ──→ T7 ──→ T8
```

### Phase 3: Frontend Routes & Pages (Parallel / Sequential)
Build the layout structure and authentication page cards first, followed by each wizard step in sequence (since steps naturally depend on each other's data caches).

```
          ┌─→ T10 [P] ─┐
T9 ───────┼─→ T11 [P] ─┴─→ T12 ──→ T13 ──→ T14 ──→ T15 ──→ T16
```

---

## Task Breakdown

### T1: Create Validation Schemas

**What**: Define Zod schemas for all form validations (Login, Signup, Reset Password, Onboarding Steps 1 to 4).
**Where**: 
- `apps/web/src/modules/auth/schemas/auth.schema.ts`
- `apps/web/src/modules/auth/schemas/onboarding.schema.ts`
**Depends on**: None
**Requirement**: `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-07`, `AUTH-08`, `AUTH-09`, `AUTH-10`
**Tools**:
  - MCP: `filesystem`
  - Skill: `tailwind-design-system`
**Tests**: Unit tests (Vitest) co-located in `auth.schema.test.ts` and `onboarding.schema.test.ts`.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] Zod schema validations successfully defined for login (email/password format constraints).
- [ ] Zod schemas for onboarding Step 1-4 cover required attributes (Timezones, advance minutes, opening ranges).
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 12 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/schemas/
```

---

### T2: Create Onboarding Zustand Store

**What**: Implement a persisted Zustand store to auto-cache user inputs at each onboarding wizard step and track the current step.
**Where**: `apps/web/src/modules/auth/stores/onboardingStore.ts`
**Depends on**: T1
**Requirement**: `AUTH-12`
**Tools**:
  - MCP: `filesystem`
  - Skill: `zustand`
**Tests**: Unit tests in `onboardingStore.test.ts` verifying step caching and LocalStorage synchronization.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] Store state and actions (saveStep1..4, skipStep, reset) successfully written and exported.
- [ ] LocalStorage persistence middleware is active and correctly recovers wizard state on boot.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/stores/
```

---

### T3: Configure MSW Mock Setup

**What**: Set up the Mock Service Worker browser/server lifecycle integration and integrate it with Vitest testing suite.
**Where**: 
- `apps/web/src/mocks/handlers.ts`
- `apps/web/src/mocks/server.ts`
- `apps/web/src/mocks/browser.ts`
- `apps/web/src/test/setup.ts` (modify)
**Depends on**: T2
**Requirement**: None (Infrastructure)
**Tools**:
  - MCP: `filesystem`
  - Skill: `vitest`
**Tests**: Integration test verifying MSW correctly intercepts external HTTP requests during mock testing.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] MSW handlers created with base HTTP endpoint responses.
- [ ] Vitest setup file intercepts and releases active mock ports correctly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 2 tests passing.

**Verify**:
```bash
pnpm test src/mocks/
```

---

### T4: Create Unified Hooks

**What**: Define React custom hooks leveraging TanStack Query/Axios to query and mutate session/onboarding states.
**Where**: 
- `apps/web/src/modules/auth/hooks/useAuth.ts`
- `apps/web/src/modules/auth/hooks/useOnboarding.ts`
**Depends on**: T3
**Requirement**: `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-05`, `AUTH-06`
**Tools**:
  - MCP: `filesystem`
  - Skill: `vitest`
**Tests**: Hook unit tests using `@testing-library/react` and MSW hooks verification.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] `useAuth` correctly implements login, signup, current session, and signout flows.
- [ ] `useOnboarding` triggers API mutations and syncs with the `onboardingStore`.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 10 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/hooks/
```

---

### T5: Service DB & Repository Layer (Option A)

**What**: Build a Prisma repository layer on the backend to handle create/read/update/delete operations for scheduling services.
**Where**: `apps/api/src/modules/availability/services.repository.ts`
**Depends on**: None
**Requirement**: `AUTH-09`
**Tools**:
  - MCP: `filesystem`
  - Skill: `fastify-best-practices`
**Tests**: Repository integration tests using real/isolated Docker PostgreSQL database.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Service CRUD methods compiled and validated against the schema.prisma model.
- [ ] Integration test suite successfully creates and query-resolves mock services in the DB.
- [ ] Gate check passes: `pnpm --filter api test` (specifically services integration)
- [ ] Test count: 6 tests passing.

**Verify**:
```bash
pnpm --filter api test services.repository.test.ts
```

---

### T6: Service Business Logic Layer (Option A)

**What**: Build the Service logic layer enforcing plan constraints (Starter limit of 100 appointments/month) and professional bindings.
**Where**: `apps/api/src/modules/availability/services.service.ts`
**Depends on**: T5
**Requirement**: `AUTH-09`
**Tools**:
  - MCP: `filesystem`
  - Skill: `fastify-best-practices`
**Tests**: Unit tests using mocked repository layers.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] Services service successfully limits creation if the client exceeds quota rules.
- [ ] Gate check passes: `pnpm --filter api test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm --filter api test services.service.test.ts
```

---

### T7: Service API Routes Plugin (Option A)

**What**: Register a new Fastify route plugin for Service endpoints under availability route encapsulation.
**Where**:
- `apps/api/src/modules/availability/plugins/services.plugin.ts`
- `apps/api/src/modules/availability/availability.plugin.ts`
**Depends on**: T6
**Requirement**: `AUTH-09`
**Tools**:
  - MCP: `filesystem`
  - Skill: `fastify-best-practices`
**Tests**: Route-level HTTP mocking integration test suite.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Route `POST /api/v1/establishments/:establishmentId/services` is active.
- [ ] Route-level validations handle bad inputs correctly (e.g. negative prices, empty names).
- [ ] Gate check passes: `pnpm --filter api test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm --filter api test
```

---

### T8: Service Comprehensive Integration

**What**: Verify full end-to-end integration of backend Service endpoints to confirm local DB readiness.
**Where**: `apps/api/src/modules/availability/__tests__/services.routes.test.ts`
**Depends on**: T7
**Requirement**: `AUTH-09`
**Tools**:
  - MCP: `filesystem`
  - Skill: `vitest`
**Tests**: Integration test covering multiple users, duplicate errors, and database commits.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] End-to-end service actions execute flawlessly without side effects.
- [ ] Gate check passes with 100% success.
- [ ] Test count: 12 tests passing.

**Verify**:
```bash
pnpm --filter api test
```

---

### T9: Register Router Configuration & Auth Layout

**What**: Establish TanStack Router routes and a premium, responsive base layout featuring gradients, glassmorphism, and smooth transitions.
**Where**: 
- `apps/web/src/routes/login.tsx`
- `apps/web/src/routes/signup.tsx`
- `apps/web/src/routes/forgot-password.tsx`
- `apps/web/src/routes/reset-password.tsx`
- `apps/web/src/routes/verify-email.tsx`
- `apps/web/src/routes/welcome.tsx`
- `apps/web/src/modules/auth/components/AuthLayout.tsx`
**Depends on**: T4
**Requirement**: `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-06`, `AUTH-07`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Router setup checks and base layout component snapshots.
**Gate**: Quick (`pnpm test`)

**Done when**:
- [ ] All routes compiled and dynamically registered with the route tree.
- [ ] `AuthLayout` successfully renders high-fidelity branding elements and gradients.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 4 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/AuthLayout.test.tsx
```

---

### T10: Implement LoginForm & SignUpForm [P]

**What**: Design the Login and Sign-Up card form panels inside the premium layout, hook up submit handles to useAuth.
**Where**: 
- `apps/web/src/modules/auth/components/LoginForm.tsx`
- `apps/web/src/modules/auth/components/SignUpForm.tsx`
**Depends on**: T9
**Requirement**: `AUTH-01`, `AUTH-02`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Component tests using `@testing-library/react` and `@testing-library/user-event` to simulate validation states. Add CSF 3.0 Storybook stories.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Forms validate input dynamically (minimum length, valid emails).
- [ ] API calls are routed via MSW mock handlers.
- [ ] Storybook story created and renders cleanly under port 6006.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 12 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/LoginForm.test.tsx
```

---

### T11: Implement ForgotPasswordForm & ResetPasswordForm [P]

**What**: Build standard password recovery cards with Zod validations and link them to recovery endpoint mutations.
**Where**: 
- `apps/web/src/modules/auth/components/ForgotPasswordForm.tsx`
- `apps/web/src/modules/auth/components/ResetPasswordForm.tsx`
**Depends on**: T9
**Requirement**: `AUTH-03`, `AUTH-04`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Unit tests for both card templates + CSF 3.0 Storybook stories.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Forms correctly parse parameters from the URL (recovery tokens).
- [ ] Storybook story created and interactive controls behave correctly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 10 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/ForgotPasswordForm.test.tsx
```

---

### T12: Implement Onboarding Step 1: Business Setup

**What**: Build the Step 1 form panel under `/welcome` to manage establishment creation (`POST /api/v1/establishments`) with validation rules.
**Where**: `apps/web/src/modules/auth/components/onboarding/Step1Business.tsx`
**Depends on**: T10, T11
**Requirement**: `AUTH-07`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Form integration tests using user-event + MSW mocks. CSF 3.0 Storybook story.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Business name, Category, Country, and Timezone dropdowns are fully operational.
- [ ] Form dynamically caches input into `onboardingStore` on change.
- [ ] Clicking "Próximo" submits establishment to the backend and advances to Step 2.
- [ ] Storybook story created and interactive play functions pass.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/onboarding/Step1Business.test.tsx
```

---

### T13: Implement Onboarding Step 2: Professional Setup

**What**: Build the Step 2 form panel to handle creating the first professional associated with the new establishment (`POST /api/v1/establishments/:id/professionals`).
**Where**: `apps/web/src/modules/auth/components/onboarding/Step2Professional.tsx`
**Depends on**: T12
**Requirement**: `AUTH-08`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Form integration tests using user-event + MSW mocks. CSF 3.0 Storybook story.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Professional Name, Email, and Phone fields validate correctly.
- [ ] Supports skippability ("Pular") without creating professionals.
- [ ] Successfully binds the new professional to the `establishmentId` cached from Step 1.
- [ ] Storybook story created and renders cleanly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/onboarding/Step2Professional.test.tsx
```

---

### T14: Implement Onboarding Step 3: Service Setup

**What**: Build the Step 3 form panel to manage scheduling service creation (`POST /api/v1/establishments/:id/services`) and link it to the Step 2 professional.
**Where**: `apps/web/src/modules/auth/components/onboarding/Step3Service.tsx`
**Depends on**: T13
**Requirement**: `AUTH-09`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Form integration tests + CSF 3.0 Storybook story.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Service Name, Duration (minutes), and Price (cents) fields validate.
- [ ] Supports skippability ("Pular").
- [ ] Link between Service and Professional maps correctly.
- [ ] Storybook story created and renders cleanly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 8 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/onboarding/Step3Service.test.tsx
```

---

### T15: Implement Onboarding Step 4: Working Hours Setup

**What**: Build the interactive weekday grid and hours slider component (`PUT /api/v1/establishments/:id/availability/business-hours`) with responsive styling.
**Where**: `apps/web/src/modules/auth/components/onboarding/Step4WorkingHours.tsx`
**Depends on**: T14
**Requirement**: `AUTH-10`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Form interaction tests verifying invalid working hours blocks submit (e.g. closesAt < opensAt). CSF 3.0 Storybook story.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Interactive weekday grid enables/disables business days.
- [ ] Custom opening, closing, and break hour pickers are functional and fully style-responsive.
- [ ] Submitting maps to the establishment's business hours correctly.
- [ ] Storybook story created and renders cleanly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 10 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/onboarding/Step4WorkingHours.test.tsx
```

---

### T16: Implement Onboarding Step 5: Summary & Onboarding Gate Routing

**What**: Create the summary dashboard panel showing entered cache, the email verification gate page `/verify-email`, and dynamic auth route guards.
**Where**: 
- `apps/web/src/modules/auth/components/onboarding/Step5Summary.tsx`
- `apps/web/src/modules/auth/pages/VerifyEmailPage.tsx`
- `apps/web/src/modules/auth/pages/WelcomePage.tsx`
**Depends on**: T15
**Requirement**: `AUTH-05`, `AUTH-06`, `AUTH-07`, `AUTH-11`
**Tools**:
  - MCP: `filesystem`
  - Skill: `frontend-design`
**Tests**: Unit tests covering email resend buttons, layout summaries, and router middleware auth guards. CSF 3.0 Storybook story.
**Gate**: Full (`pnpm lint && pnpm test`)

**Done when**:
- [ ] Onboarding wizard completed summary card details match cached store keys.
- [ ] VerifyEmail page correctly guards dashboard access and manages resend triggers.
- [ ] Complete onboarding flow resets the wizard cache and redirects to `/dashboard`.
- [ ] Storybook stories created and render cleanly.
- [ ] Gate check passes: `pnpm lint && pnpm test`
- [ ] Test count: 12 tests passing.

**Verify**:
```bash
pnpm test src/modules/auth/components/onboarding/Step5Summary.test.tsx
```

---

## Parallel Execution Map

Visual representation of what can run simultaneously:

```
Phase 1 (Foundation):
  T1 ──→ T2 ──→ T3 ──→ T4

Phase 2 (Backend Services - Option A):
  T5 ──→ T6 ──→ T7 ──→ T8

Phase 3 (Frontend Pages):
  T4 and T8 complete, then:
    T9 ────────┬──→ T10 [P] ──┐
               └──→ T11 [P] ──┴──→ T12 ──→ T13 ──→ T14 ──→ T15 ──→ T16
```

---

## Task Granularity Check

Validation check to confirm each task is atomic and represents one cohesive unit of deliverable.

| Task | Scope | Status |
| --- | --- | --- |
| **T1**: Create Validation Schemas | 2 validation schema files (Zod) | ✅ Granular |
| **T2**: Create Onboarding Store | 1 state store file (Zustand) | ✅ Granular |
| **T3**: Configure MSW Mock Setup | 4 infrastructure files (MSW integration) | ✅ Cohesive Infrastructure |
| **T4**: Create Unified Hooks | 2 hooks files (Query/Mutations) | ✅ Granular |
| **T5**: Service DB & Repository Layer | 1 Prisma repository file | ✅ Granular |
| **T6**: Service Business Logic Layer | 1 service class file | ✅ Granular |
| **T7**: Service API Routes Plugin | 2 Fastify plugin files | ✅ Granular |
| **T8**: Service Comprehensive Integration | 1 integration route test file | ✅ Granular |
| **T9**: Register Router & Auth Layout | 6 route files + 1 layout container | ✅ Cohesive Routing |
| **T10**: Implement LoginForm & SignUpForm | 2 card component files | ✅ Granular |
| **T11**: Implement ForgotPasswordForm & ResetPasswordForm | 2 card component files | ✅ Granular |
| **T12**: Implement Onboarding Step 1: Business Setup | 1 step form component file | ✅ Granular |
| **T13**: Implement Onboarding Step 2: Professional Setup | 1 step form component file | ✅ Granular |
| **T14**: Implement Onboarding Step 3: Service Setup | 1 step form component file | ✅ Granular |
| **T15**: Implement Onboarding Step 4: Working Hours Setup | 1 step form component file | ✅ Granular |
| **T16**: Implement Onboarding Step 5: Summary & Gate | 1 step form + 2 page components | ✅ Cohesive Completion |

---

## Diagram-Definition Cross-Check

Cross-check showing alignment between dependencies in the execution plan diagram and task declarations.

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| **T1** | None | None | ✅ Match |
| **T2** | T1 | T1 | ✅ Match |
| **T3** | T2 | T2 | ✅ Match |
| **T4** | T3 | T3 | ✅ Match |
| **T5** | None | None | ✅ Match |
| **T6** | T5 | T5 | ✅ Match |
| **T7** | T6 | T6 | ✅ Match |
| **T8** | T7 | T7 | ✅ Match |
| **T9** | T4 | T4 | ✅ Match |
| **T10** | T9 | T9 | ✅ Match |
| **T11** | T9 | T9 | ✅ Match |
| **T12** | T10, T11 | T10, T11 | ✅ Match |
| **T13** | T12 | T12 | ✅ Match |
| **T14** | T13 | T13 | ✅ Match |
| **T15** | T14 | T14 | ✅ Match |
| **T16** | T15 | T15 | ✅ Match |

---

## Test Co-location Validation

Cross-check validating that every task includes testing files matching the codebase's `TESTING.md` coverage matrix guidelines.

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| **T1** | Validation Schemas | Unit (Vitest) | Unit tests in `*.schema.test.ts` | ✅ Match |
| **T2** | Zustand Store | Unit (Vitest) | Unit tests in `onboardingStore.test.ts` | ✅ Match |
| **T3** | Mock Infrastructure | Integration (Vitest) | Mock handler tests in `setup.ts` | ✅ Match |
| **T4** | React Hooks | Unit (Vitest) | Hook tests in `useAuth.test.ts` | ✅ Match |
| **T5** | Prisma Repository | Integration (Vitest) | Repo tests on PostgreSQL | ✅ Match |
| **T6** | Service Logic | Unit (Vitest) | Service unit tests with mocks | ✅ Match |
| **T7** | API Routes | Integration (Vitest) | Fastify route integration tests | ✅ Match |
| **T8** | Full API Integration | Integration (Vitest) | Route integration test suite | ✅ Match |
| **T9** | Router Setup & Layout | Route Unit/Integration | Snapshots & setup tests | ✅ Match |
| **T10** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T11** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T12** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T13** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T14** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T15** | Components | Integration (Vitest) | Vitest component + Storybook play | ✅ Match |
| **T16** | Components / Router | Route Unit/Integration | Component + gate route tests | ✅ Match |
