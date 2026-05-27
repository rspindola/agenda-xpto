# Auth Tasks

**Design:** `.specs/features/auth/design.md`  
**Spec:** `.specs/features/auth/spec.md`  
**Context:** `.specs/features/auth/context.md`  
**Status:** Approved

---

## Execution Plan

### Phase 1: Foundation (sequential)

```
T1 → T2 → T3 → T4 → T5 → T6
```

### Phase 2: Shared UI & MSW (parallel after T1)

```
T1 complete:
  ├── T7 [P]  PasswordField
  └── T8 [P]  MSW handlers (needs T4 types)
T6 needs T2, T4, T5
```

### Phase 3: Layouts & route shells (sequential)

```
T6, T8 → T9 → T10 → T16
```

### Phase 4: Auth pages (parallel after T10)

```
T10 complete:
  ├── T11 [P]  Login
  ├── T12 [P]  Signup
  ├── T13 [P]  Verify email + resend
  └── T14 [P]  Forgot + reset password
```

### Phase 5: Establishments & onboarding (sequential)

```
T15 → T16 → T17 → T18 → T19 → T20 → T21 → T22
```

### Phase 6: Dashboard & integration (sequential)

```
T22 → T23 → T24
```

### Parallel execution map

```
Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6

Phase 2:  T1 done → T7 [P], T8 [P]  (parallel with each other)

Phase 3:  T6,T8 → T9 → T10 → T16

Phase 4:  T10 → T11 [P] | T12 [P] | T13 [P] | T14 [P]

Phase 5:  T15 → T16 → T17 → T18 → T19 → T20 → T21 → T22

Phase 6:  T21 → T23 → T24
         T22 can start after T11 (useSignOut) — run with Phase 5 tail or after T21
```

**Note:** T22 (`DashboardLayout` + sign out) depends on T11 (`useSignOut`). Schedule T22 after T11; may overlap with T17–T21 if sign-out hook is extracted in T11.

---

## Task Breakdown

### T1: Axios singleton and web URL helpers

**What:** Create `#/lib/axios.ts` (`api` with `withCredentials`, `baseURL` from `VITE_API_URL`) and `#/lib/urls.ts` (`webUrls` for callback/redirect absolutes). Document vars in `.env.example` if missing.

**Where:** `src/lib/axios.ts`, `src/lib/urls.ts`

**Depends on:** None

**Reuses:** `#/lib/utils.ts` (none for axios)

**Requirement:** AUTH-08, AUTH-NF-01

**Done when:**

- [x] `api` exported with `withCredentials: true`
- [x] `webUrls.onboardingBusiness()`, `verifyEmail()`, `resetPassword()` return absolute URLs
- [x] No TypeScript errors
- [x] Gate: `pnpm lint` passes

**Tests:** none (infra)

**Gate:** quick (`pnpm lint`)

---

### T2: Query keys and session query options

**What:** `authKeys`, `establishmentKeys`, `sessionQueryOptions`, `establishmentsQueryOptions` factories.

**Where:** `src/modules/auth/query-keys.ts`, `src/modules/auth/queries/session-queries.ts`, `src/modules/establishments/query-keys.ts` (or shared `src/lib/query-keys.ts` per design)

**Depends on:** T1, T4 (authApi.getMe for sessionQueryOptions — **order:** T4 before T2 session fn, or inline queryFn in T2 and refactor in T4)

**Reuses:** TanStack Query patterns from `#/router.tsx`

**Requirement:** AUTH-06, AUTH-08

**Done when:**

- [x] `sessionQueryOptions` uses `retry: false`, `staleTime: 60_000`
- [x] Keys stable for invalidation
- [x] Unit test: query key shape snapshot or factory test

**Tests:** unit (`src/modules/auth/__tests__/query-keys.test.ts`)

**Gate:** quick (`pnpm test`)

**Adjust dependency:** T2 depends on T1 only; `queryFn` stubs until T4 — **merge T2 after T4** in execution.

**Revised:** T2 **Depends on:** T1, T4

---

### T3: QueryClient default options

**What:** Set sensible `defaultOptions.queries.staleTime` in `#/integrations/tanstack-query/root-provider.tsx` (per CONCERNS.md).

**Where:** `src/integrations/tanstack-query/root-provider.tsx`

**Depends on:** None

**Reuses:** existing `getContext()`

**Requirement:** AUTH-NF (performance)

**Done when:**

- [x] Global `staleTime` ≥ 30s or queries use per-options override from T2
- [x] App still boots; `pnpm test` passes

**Tests:** none

**Gate:** quick (`pnpm test`)

---

### T4: authApi module and Auth types

**What:** `authApi` wrappers for all Better Auth + `/me` endpoints; `AuthUser`, `MeResponse`, `BetterAuthErrorBody` types.

**Where:** `src/modules/auth/api/auth-api.ts`, `src/modules/auth/types/auth-types.ts`

**Depends on:** T1

**Reuses:** `#/lib/axios.ts`, `#/lib/urls.ts`

**Requirement:** AUTH-08

**Done when:**

- [x] All endpoints from design table implemented
- [x] Unit tests mock axios and assert paths/methods/bodies
- [x] Gate: `pnpm test` — auth-api tests pass

**Tests:** unit

**Gate:** quick

---

### T5: Auth Zod schemas and mapSignUpError

**What:** `signUpSchema`, `signInSchema`, `forgotPasswordSchema`, `resetPasswordSchema`; `mapSignUpError` + `DUPLICATE_EMAIL_CODES` set.

**Where:** `src/modules/auth/schemas/`, `src/modules/auth/lib/map-auth-error.ts`

**Depends on:** None

**Reuses:** Zod v4 patterns from UI tests

**Requirement:** AUTH-01, AUTH-02, AUTH-NF-02

**Done when:**

- [x] Schemas reject invalid password length and confirm-password mismatch
- [x] `mapSignUpError` returns explicit pt-BR string for known duplicate codes
- [x] Unit tests for schema + mapper

**Tests:** unit

**Gate:** quick

---

### T6: Route guards

**What:** `route-guards.ts` with `ensureGuest`, `ensureSession`, `ensureEmailVerified`, `ensureOnboardingPending`, `ensureOnboardingComplete`, `resolvePostLoginPath`, `fetchSession`, `fetchEstablishments`.

**Where:** `src/modules/auth/lib/route-guards.ts`

**Depends on:** T2, T4, T5

**Reuses:** TanStack Router `redirect()`, `queryClient.ensureQueryData`

**Requirement:** AUTH-06, AUTH-18

**Done when:**

- [x] Unit tests cover redirect targets for guest / unverified / no establishments / has establishments
- [x] No `localStorage` token usage
- [x] Gate: `pnpm test` passes

**Tests:** unit (mock queryClient)

**Gate:** quick

---

### T7: PasswordField component [P]

**What:** `PasswordField` with show/hide toggle, label, error; Storybook stories; Vitest interaction test.

**Where:** `src/components/ui/password-field.tsx`, `.stories.tsx`, `__tests__/`

**Depends on:** T1 (optional — only `cn`)

**Reuses:** `#/components/ui/input.tsx`, `#/lib/utils.ts`

**Requirement:** AUTH-09

**Done when:**

- [x] Stories: default, error, disabled
- [x] Test: toggles visibility, associates label
- [x] Gate: `pnpm test` passes

**Tests:** integration (UI)

**Gate:** quick

---

### T8: MSW handlers for auth and establishments [P]

**What:** Handlers for `me`, auth mutations, establishments list/create, professionals create, business-hours PUT; register in `#/test/setup.ts`.

**Where:** `src/test/msw/handlers/auth-handlers.ts`, `establishments-handlers.ts`, `src/test/setup.ts`

**Depends on:** T4 (response shapes)

**Reuses:** MSW 2 from `package.json`

**Requirement:** AUTH-NF-04, AUTH-NF-08

**Done when:**

- [x] Handlers used by at least one passing test (can be placeholder test in T8)
- [x] `pnpm test` passes

**Tests:** unit (handler contract test optional)

**Gate:** quick

---

### T9: AuthLayout and AuthFormCard

**What:** Centered auth layout + reusable card wrapper (title, subtitle, footer links).

**Where:** `src/components/layouts/auth-layout.tsx`, `src/modules/auth/components/auth-form-card.tsx`

**Depends on:** T7 (PasswordField used by forms later — optional dep), `#/components/ui/card.tsx`

**Reuses:** `#/components/ui/card.tsx`, `button.tsx`

**Requirement:** AUTH-07

**Done when:**

- [ ] Renders children in responsive centered layout
- [ ] Storybook story for `AuthFormCard` (optional) or smoke test
- [ ] Gate: `pnpm lint` passes

**Tests:** none (layout); optional story only

**Gate:** quick

---

### T10: Public auth route tree (`_auth`)

**What:** `src/routes/_auth/route.tsx` with `AuthLayout` + `ensureGuest`; stub child routes (empty) for login/signup/forgot/reset/verify paths.

**Where:** `src/routes/_auth/`

**Depends on:** T6, T9

**Reuses:** TanStack Router file routes

**Requirement:** AUTH-07

**Done when:**

- [ ] `routeTree.gen.ts` regenerates with `_auth` layout
- [ ] Guest hitting `/login` renders layout
- [ ] Gate: `pnpm lint && pnpm test` (no regression)

**Tests:** integration (minimal route render with MSW)

**Gate:** quick

---

### T11: Login page and useSignIn [P]

**What:** `LoginForm`, `useSignIn`, `sign-in` hook tests, `src/routes/_auth/login.tsx` with TanStack Form + generic error copy.

**Where:** `src/modules/auth/hooks/use-sign-in.ts`, `components/login-form.tsx`, `src/routes/_auth/login.tsx`

**Depends on:** T5, T7, T10, T8

**Reuses:** `authApi.signInEmail`, `sessionQueryOptions`, `resolvePostLoginPath`

**Requirement:** AUTH-02

**Done when:**

- [ ] Successful sign-in invalidates session and navigates per establishments count
- [ ] Invalid credentials show generic pt-BR message
- [ ] Hook test with MSW passes
- [ ] Gate: `pnpm test`

**Tests:** unit (hook) + integration (form)

**Gate:** quick

---

### T12: Signup page and useSignUp [P]

**What:** `SignUpForm`, `useSignUp`, signup route; duplicate email uses `mapSignUpError`; redirect to `/verify-email?email=`.

**Where:** `src/modules/auth/hooks/use-sign-up.ts`, `components/sign-up-form.tsx`, `src/routes/_auth/signup.tsx`

**Depends on:** T5, T7, T10, T8

**Reuses:** `webUrls.onboardingBusiness()` as `callbackURL`

**Requirement:** AUTH-01

**Done when:**

- [ ] Signup navigates to verify-email with email in search
- [ ] Duplicate email shows explicit message (MSW 422/409 scenario)
- [ ] Gate: `pnpm test`

**Tests:** unit + integration

**Gate:** quick

---

### T13: Verify email page, resend, cooldown [P]

**What:** `VerifyEmailPanel`, `useResendVerification` (60s cooldown), `verify-email.tsx`; `POST send-verification-email`.

**Where:** `src/modules/auth/hooks/use-resend-verification.ts`, `components/verify-email-panel.tsx`, `src/routes/_auth/verify-email.tsx`

**Depends on:** T4, T10, T8

**Reuses:** `webUrls`, email from route search

**Requirement:** AUTH-03, AUTH-20

**Done when:**

- [ ] Resend disabled 60s after click with countdown label
- [ ] Tests mock timer or cooldown state
- [ ] Gate: `pnpm test`

**Tests:** unit (hook) + integration

**Gate:** quick

---

### T14: Forgot and reset password pages [P]

**What:** `ForgotPasswordForm`, `ResetPasswordForm`, hooks, routes; neutral forgot copy; reset requires `token` search param.

**Where:** `src/modules/auth/hooks/`, `components/`, `src/routes/_auth/forgot-password.tsx`, `reset-password.tsx`

**Depends on:** T5, T7, T10, T8

**Reuses:** `authApi.requestPasswordReset`, `resetPassword`

**Requirement:** AUTH-04, AUTH-05

**Done when:**

- [ ] Forgot always shows neutral success state
- [ ] Reset without token shows invalid-link UI
- [ ] Successful reset redirects to `/login`
- [ ] Gate: `pnpm test`

**Tests:** unit + integration

**Gate:** quick

---

### T15: Establishments API and query

**What:** `establishmentsApi.list/create`, `establishmentsQueryOptions`, types aligned with API schema.

**Where:** `src/modules/establishments/api/establishments-api.ts`, queries file

**Depends on:** T1, T2, T8

**Reuses:** `establishmentKeys`

**Requirement:** AUTH-13, AUTH-17, AUTH-18

**Done when:**

- [ ] List/create tested with MSW
- [ ] Gate: `pnpm test`

**Tests:** unit

**Gate:** quick

---

### T16: Authenticated route shell and index redirect

**What:** `_authenticated/route.tsx` with `ensureSession` + `ensureEmailVerified`; update `src/routes/index.tsx` redirect hub.

**Where:** `src/routes/_authenticated/route.tsx`, `src/routes/index.tsx`

**Depends on:** T6, T15

**Reuses:** route guards

**Requirement:** AUTH-06, AUTH-18

**Done when:**

- [ ] `/` redirects unauthenticated → login, no establishments → onboarding, else dashboard
- [ ] Route test with mocked loader context
- [ ] Gate: `pnpm test`

**Tests:** integration

**Gate:** quick

---

### T17: Onboarding layout and shell components

**What:** `OnboardingLayout`, `OnboardingShell`, `StepProgress`; `onboarding/route.tsx` with `ensureOnboardingPending`.

**Where:** `src/components/layouts/onboarding-layout.tsx`, `src/modules/onboarding/components/`, `src/routes/_authenticated/onboarding/route.tsx`

**Depends on:** T16

**Reuses:** UI `Button`

**Requirement:** AUTH-12

**Done when:**

- [ ] Step 1 route has no “Pular”; steps 2–4 shell supports skip prop
- [ ] Progress shows Passo X/5
- [ ] Gate: `pnpm lint`

**Tests:** integration (shell render)

**Gate:** quick

---

### T18: Onboarding step 1 — business (mandatory)

**What:** `businessStepSchema`, `BusinessStepForm`, `useCreateEstablishment`, `business.tsx`; POST establishment; invalidate list.

**Where:** `src/modules/onboarding/schemas/`, `components/business-step-form.tsx`, `hooks/`, `src/routes/_authenticated/onboarding/business.tsx`

**Depends on:** T15, T17, T11 (session user email prefill)

**Reuses:** `establishmentsApi.create`, TanStack Form

**Requirement:** AUTH-13

**Done when:**

- [ ] Cannot proceed without valid name + timezone
- [ ] Success navigates to `/onboarding/professional`
- [ ] MSW integration test passes
- [ ] Gate: `pnpm test`

**Tests:** integration

**Gate:** quick

---

### T19: Onboarding step 2 — professional

**What:** `ProfessionalStepForm`, `useCreateProfessional`, `professional.tsx`; skip advances without API.

**Where:** `src/modules/onboarding/`

**Depends on:** T18, T8

**Reuses:** `onboarding-api` → professionals POST, `establishments[0].id`

**Requirement:** AUTH-14

**Done when:**

- [ ] Skip goes to service step
- [ ] Create professional then next works
- [ ] Gate: `pnpm test`

**Tests:** integration

**Gate:** quick

---

### T20: Onboarding step 3 — service (informational)

**What:** `ServiceInfoStep` static copy (pt-BR); `service.tsx`; only Próximo/Pular.

**Where:** `src/modules/onboarding/components/service-info-step.tsx`, `src/routes/_authenticated/onboarding/service.tsx`

**Depends on:** T17

**Reuses:** `OnboardingShell`

**Requirement:** AUTH-15

**Done when:**

- [ ] No API calls on this step
- [ ] Navigates to hours
- [ ] Gate: `pnpm lint`

**Tests:** integration (smoke)

**Gate:** quick

---

### T21: Onboarding step 4 — business hours

**What:** `hoursStepSchema`, `HoursStepForm`, `onboarding-api` batch PUT, `hours.tsx`.

**Where:** `src/modules/onboarding/api/onboarding-api.ts`, components, route

**Depends on:** T18, T8

**Reuses:** availability PUT per weekday from design

**Requirement:** AUTH-16

**Done when:**

- [ ] At least one weekday can be saved
- [ ] Skip advances to done without PUT
- [ ] Gate: `pnpm test`

**Tests:** unit (batch mapper) + integration

**Gate:** quick

---

### T22: Onboarding step 5 — done + dashboard stub

**What:** `OnboardingDoneSummary`, `done.tsx`; `DashboardLayout` stub; `dashboard/index.tsx` with `ensureOnboardingComplete`; wire `useSignOut` in header.

**Where:** `src/routes/_authenticated/onboarding/done.tsx`, `src/routes/_authenticated/dashboard/index.tsx`, layouts

**Depends on:** T21, T11 (useSignOut), T16

**Reuses:** establishments query for summary

**Requirement:** AUTH-17, AUTH-10

**Done when:**

- [ ] Done → dashboard only if establishments ≥ 1
- [ ] Deep-link `/onboarding/done` without establishment redirects to business
- [ ] Sign out clears cache and goes to login
- [ ] Gate: `pnpm test`

**Tests:** integration

**Gate:** quick

---

### T23: Route guard and onboarding flow integration tests

**What:** End-to-end-style tests: verify-email path → onboarding business → skip 2–4 → done → dashboard; guard blocks dashboard with 0 establishments.

**Where:** `src/routes/__tests__/auth-flow.test.tsx` or `src/modules/auth/__tests__/route-guards.test.ts` (extend)

**Depends on:** T22, T8

**Reuses:** MSW full handler set

**Requirement:** AUTH-06, AUTH-12–AUTH-18

**Done when:**

- [ ] At least 3 scenarios from spec independent tests covered
- [ ] Gate: `pnpm test`

**Tests:** integration

**Gate:** quick

---

### T24: Full gate and spec traceability update

**What:** Run `pnpm lint && pnpm test`; fix regressions; mark tasks complete in this file; update `spec.md` traceability statuses.

**Where:** repo-wide

**Depends on:** T23

**Reuses:** TESTING.md full gate

**Requirement:** All AUTH-* MVP

**Done when:**

- [ ] `pnpm lint && pnpm test` green
- [ ] No sensitive data in logs
- [ ] Manual smoke: signup → verify (MSW) → onboarding step 1 → dashboard

**Tests:** full suite

**Gate:** full (`pnpm lint && pnpm test`)

**Commit:** `feat(auth): complete auth and onboarding MVP`

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 2 lib files | ✅ |
| T4 | 1 API module | ✅ |
| T6 | 1 guard module + tests | ✅ |
| T7 | 1 UI component | ✅ |
| T11 | Login hook + form + route | ✅ |
| T12 | Signup hook + form + route | ✅ |
| T18 | 1 onboarding step | ✅ |
| T24 | Meta verification | ✅ |

---

## Diagram–Definition Cross-Check

| Task | Depends on (body) | Diagram | Status |
| ---- | ------------------- | ------- | ------ |
| T1 | None | Phase 1 start | ✅ |
| T2 | T1, T4 | After T4 | ✅ |
| T3 | None | Parallel to T1 | ✅ |
| T4 | T1 | T1 → T4 | ✅ |
| T5 | None | T1 parallel | ✅ |
| T6 | T2, T4, T5 | T5 → T6 | ✅ |
| T7 | T1 | T1 → T7 [P] | ✅ |
| T8 | T4 | T1 → T8 [P] | ✅ |
| T9 | — | T6,T8 → T9 | ✅ (T9 deps T7 optional) |
| T10 | T6, T9 | T9 → T10 | ✅ |
| T11–T14 | T10 + … | T10 → parallel | ✅ |
| T15 | T1, T2, T8 | T15 → T16 | ✅ |
| T16 | T6, T15 | T15 → T16 | ✅ |
| T17–T21 | chain | sequential | ✅ |
| T22 | T21, T11, T16 | Phase 6 | ✅ |
| T23 | T22, T8 | T22 → T23 | ✅ |
| T24 | T23 | T23 → T24 | ✅ |

**Correction:** Execute **T15 before T16** (establishments query required by `ensureOnboardingComplete` in authenticated shell). Phase 5 order: `T16 depends T15` — diagram updated in Execution Plan above.

---

## Test Co-location Validation

| Task | Layer | Matrix requires | Task Tests | Status |
| ---- | ----- | --------------- | ---------- | ------ |
| T1 | lib | none | none | ✅ |
| T2 | query factories | unit | unit | ✅ |
| T3 | integration provider | none | none | ✅ |
| T4 | module API | unit | unit | ✅ |
| T5 | schemas/lib | unit | unit | ✅ |
| T6 | module lib | unit | unit | ✅ |
| T7 | UI component | integration | integration | ✅ |
| T8 | MSW | unit/none | unit | ✅ |
| T9 | layout | none | none | ✅ |
| T10 | routes | integration | integration | ✅ |
| T11–T14 | hooks + routes + forms | unit + integration | unit + integration | ✅ |
| T15 | module API | unit | unit | ✅ |
| T16 | routes | integration | integration | ✅ |
| T17–T22 | components/routes | integration | integration | ✅ |
| T23 | routes flow | integration | integration | ✅ |
| T24 | — | full gate | full | ✅ |

---

## Requirement Traceability (task → AUTH ID)

| Task | Requirements |
| ---- | ------------- |
| T1, T4 | AUTH-08 |
| T2, T3, T6, T16, T23 | AUTH-06, AUTH-18 |
| T5, T12 | AUTH-01 |
| T11 | AUTH-02 |
| T13 | AUTH-03, AUTH-20 |
| T14 | AUTH-04, AUTH-05 |
| T7 | AUTH-09 |
| T9, T10 | AUTH-07 |
| T17–T21 | AUTH-12–AUTH-17 |
| T15, T18 | AUTH-13 |
| T19 | AUTH-14 |
| T20 | AUTH-15 |
| T21 | AUTH-16 |
| T22 | AUTH-10, AUTH-17 |
| T24 | All MVP |

---

## Tools (execute phase)

**MCP:** NONE required  
**Skills:** `tlc-spec-driven` implement, `vitest`, `storybook` (T7), `frontend` rules  

Before Execute, confirm with user if additional MCPs desired.

---

## Task Status Tracker

| ID | Status | Notes |
| -- | ------ | ----- |
| T1 | pending | |
| T2 | pending | |
| T3 | pending | |
| T4 | pending | |
| T5 | pending | |
| T6 | pending | |
| T7 | pending | |
| T8 | pending | |
| T9 | pending | |
| T10 | pending | |
| T11 | pending | |
| T12 | pending | |
| T13 | pending | |
| T14 | pending | |
| T15 | pending | |
| T16 | pending | |
| T17 | pending | |
| T18 | pending | |
| T19 | pending | |
| T20 | pending | |
| T21 | pending | |
| T22 | pending | |
| T23 | pending | |
| T24 | pending | |
