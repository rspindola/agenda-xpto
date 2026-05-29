# Authentication Specification — Agenda XPTO Web

## Problem Statement

Establishment owners need a secure way to create an account, sign in, recover access, complete first-time setup, and reach the admin panel. The backend already exposes Better Auth (email/password, session cookies, email verification) plus domain APIs for establishments, professionals, and business hours. The web app has no auth module, onboarding wizard, routes, or session integration yet.

This spec defines the **frontend auth + onboarding flow** aligned with the **implemented API**, not legacy JWT/localStorage diagrams in `docs/flow/01-auth/`.

## Goals

- [ ] Owner can **sign up**, **verify email**, **sign in**, **sign out**, and **reset password** using Better Auth endpoints.
- [ ] After first verified login, owner is guided through a **5-step onboarding wizard** (business **required**, steps 2–4 optional, summary).
- [ ] Onboarding **complete** when `GET /api/v1/establishments` returns ≥ 1 item (no DB flag, no `localStorage`).
- [ ] Session is maintained via **HTTP-only session cookies** (`credentials: 'include'` on Axios); no tokens in `localStorage`; auth via **`authApi` + TanStack Query** (no `better-auth` package on web).
- [ ] Unauthenticated users → `/login`; verified with zero establishments → `/onboarding`; verified with ≥1 establishment → `/dashboard`.
- [ ] Unverified users see a **verification gate** and cannot use protected routes until `emailVerified === true`.
- [ ] Forms use **Zod validation**, **TanStack Form**, and existing **`src/components/ui/`** components.

## Out of Scope

Explicitly excluded for this feature (documented to prevent scope creep).

| Feature | Reason |
| -------- | ------ |
| Professional / worker login (US-006–US-015) | Post-MVP; no backend routes for worker panel auth |
| Establishment **category** field (wireframe step 1) | Not in `createEstablishmentBodySchema`; defer until establishments module extends schema |
| Professional **profile photo** upload (wireframe step 2) | Not in professionals API; defer |
| Onboarding **summary email** on completion | No notification template/API wired for this yet; defer (P2) |
| Dedicated `POST /onboarding/*` aggregate API | Use existing domain endpoints per step; no monolithic onboarding API |
| OAuth / social login | Not configured in Better Auth |
| Change password in settings | API exists (`POST /api/auth/change-password`); belongs to account settings module |
| JWT + `localStorage` session | Superseded by Better Auth cookie sessions |
| WhatsApp / client (`P2`) auth | Public booking is unauthenticated |
| Playwright E2E | Post-MVP per project rules |
| Rate-limit UI | Enforced server-side; no client implementation |

---

## Technical Context (Source of Truth)

### Backend (implemented)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/auth/sign-up/email` | Create account (`name`, `email`, `password`, optional `callbackURL`) |
| `POST` | `/api/auth/sign-in/email` | Sign in (`email`, `password`, optional `rememberMe`, `callbackURL`) |
| `POST` | `/api/auth/sign-out` | End session |
| `GET` | `/api/auth/verify-email` | Consume verification token from email (`token`, optional `callbackURL`) |
| `POST` | `/api/auth/send-verification-email` | Resend verification email (`email`, optional `callbackURL`) — proxied via Better Auth |
| `POST` | `/api/auth/request-password-reset` | Send reset email (`email`, optional `redirectTo`) |
| `POST` | `/api/auth/reset-password` | Set new password (`newPassword`, `token`) |
| `GET` | `/api/v1/me` | Current user (requires session cookie) |
| `POST` | `/api/v1/establishments` | Create establishment (onboarding step 1) |
| `GET` | `/api/v1/establishments` | List establishments (detect onboarding need) |
| `POST` | `/api/v1/establishments/:establishmentId/professionals` | Create professional (step 2) |
| `PUT` | `/api/v1/establishments/:establishmentId/availability/business-hours/:weekday` | Upsert hours per weekday (step 4) |

**Onboarding decisions (see `context.md`):**

| Topic | MVP behavior |
| ----- | ------------- |
| Step 3 — Service | Informational + “Pular” only; no Services API (deferred) |
| Completion | `establishments.length >= 1` via TanStack Query — no Prisma field, no `localStorage` |
| Step 1 | **Mandatory**; steps 2–4 optional |
| Summary email | Deferred (P2) |

**Better Auth config** (`apps/api/src/lib/auth.ts`):

- `requireEmailVerification: true` — login blocked until email verified
- `sendOnSignUp: true` — verification email on signup
- `autoSignInAfterVerification: true` — session cookie set after clicking email link
- `resetPasswordTokenExpiresIn: 3600` (1 hour)
- Password: min 8, max 128 characters
- CSRF: requests must send `Origin` matching `WEB_URL` (Axios default origin from browser is OK)

**Session model:** Cookie-based session managed by Better Auth — **not** JWT in `localStorage`.

### Frontend stack (from `.specs/codebase/`)

- TanStack Router (file routes under `src/routes/`)
- TanStack Query for `GET /api/v1/me` and mutations
- TanStack Form + Zod
- Axios singleton (`src/lib/axios.ts`) with `withCredentials: true`
- UI: reuse `Button`, `Input`, `Card`, `Toast` from `src/components/ui/`

### Route map (target)

| Path | Layout | Access |
| ---- | ------ | ------ |
| `/` | — | Redirect: unauthenticated → `/login`; verified + onboarding pending → `/onboarding`; else → `/dashboard` |
| `/login` | `AuthLayout` | Public |
| `/signup` | `AuthLayout` | Public |
| `/forgot-password` | `AuthLayout` | Public |
| `/reset-password` | `AuthLayout` | Public (token in query: `?token=`) |
| `/verify-email` | `AuthLayout` | Public gate (pending verification UX) |
| `/onboarding` | `OnboardingLayout` | Protected + `emailVerified` + onboarding not completed |
| `/onboarding/$step` | `OnboardingLayout` | Steps: `business`, `professional`, `service`, `hours`, `done` |
| `/dashboard` | `DashboardLayout` | Protected + `emailVerified` + `establishments.length >= 1` |

Email links should use `callbackURL` / `redirectTo` pointing to web routes (e.g. `WEB_URL/verify-email`, `WEB_URL/reset-password`, post-verify `WEB_URL/onboarding/business`).

**Post-verify redirect:** `callbackURL` on signup/verify SHALL target `/onboarding/business` (not `/dashboard`) for new owners.

### Module layout

```
src/modules/auth/
├── api/              # authApi wrappers (axios)
├── components/       # AuthFormCard, PasswordField, VerifyEmailBanner, ...
├── hooks/            # useSession, useSignIn, useSignUp, useOnboardingStatus, ...
├── schemas/          # Zod (mirror backend constraints)
└── __tests__/

src/modules/onboarding/          # wizard (invoked from auth flow; cross-domain API calls)
├── components/       # OnboardingShell, StepProgress, step forms
├── hooks/            # useOnboardingEstablishment, useOnboardingMutations
├── schemas/          # per-step Zod
├── stores/           # wizard UI state only (current step, draft); not completion flag
└── __tests__/

src/routes/
├── _auth/            # AuthLayout group (optional pattern)
├── login.tsx
├── signup.tsx
├── forgot-password.tsx
├── reset-password.tsx
├── verify-email.tsx
└── onboarding/
    ├── route.tsx     # OnboardingLayout + guard
    ├── business.tsx
    ├── professional.tsx
    ├── service.tsx
    ├── hours.tsx
    └── done.tsx

src/lib/axios.ts      # singleton + withCredentials
src/components/layouts/auth-layout.tsx
src/components/layouts/onboarding-layout.tsx
```

---

## User Stories

### P1: Sign up with email and password — MVP

**User Story**: As an establishment owner (`P1`), I want to create an account with my name, email, and password so that I can access the admin panel after verifying my email.

**Why P1**: Without signup, no tenants enter the product funnel.

**Acceptance Criteria**:

1. WHEN the user opens `/signup` THEN the system SHALL display fields: name, email, password, confirm password (client-side only).
2. WHEN the user submits valid data THEN the system SHALL call `POST /api/auth/sign-up/email` with `{ name, email, password, callbackURL }` where `callbackURL` points to the web verify flow.
3. WHEN signup succeeds (`emailVerified: false`) THEN the system SHALL redirect to `/verify-email` and SHALL NOT navigate to `/dashboard`.
4. WHEN signup returns a duplicate-email error THEN the system SHALL show an **explicit** message (e.g. “Este e-mail já está cadastrado”), mapped from Better Auth `code` / `message` (see `context.md`).
5. WHEN password fails client validation (min 8 chars) THEN the system SHALL block submit and show inline errors.

**Independent Test**: Submit signup with MSW → land on `/verify-email` with message referencing the email used; no dashboard access.

---

### P1: Sign in with email and password — MVP

**User Story**: As an establishment owner (`P1`), I want to sign in with email and password so that I can manage my business.

**Why P1**: Core access path for returning users.

**Acceptance Criteria**:

1. WHEN the user opens `/login` THEN the system SHALL display email, password, optional “remember me”, link to signup and forgot password.
2. WHEN credentials are invalid THEN the system SHALL show a **generic** message (e.g. “Invalid email or password”) matching Better Auth responses — SHALL NOT reveal whether the email exists.
3. WHEN the account exists but email is not verified THEN the system SHALL redirect to `/verify-email` (or show equivalent gate) and SHALL NOT grant dashboard access.
4. WHEN sign-in succeeds and `emailVerified === true` and `establishments.length === 0` THEN the system SHALL redirect to `/onboarding/business`.
5. WHEN sign-in succeeds and `establishments.length >= 1` THEN the system SHALL redirect to `/dashboard`.
6. WHEN the user is already authenticated and verified and visits `/login` THEN the system SHALL redirect to `/onboarding` or `/dashboard` per onboarding status.

**Independent Test**: MSW happy path login → `/dashboard`; unverified user → `/verify-email`.

---

### P1: Email verification gate — MVP

**User Story**: As a new owner (`P1`), I want clear guidance to confirm my email so that I can unlock the dashboard.

**Why P1**: `requireEmailVerification` is enabled on the API.

**Acceptance Criteria**:

1. WHEN signup completes THEN the system SHALL show `/verify-email` with the registered email, **“Reenviar e-mail de confirmação”** (`POST /api/auth/send-verification-email`), **60s cooldown** after each resend, and link back to login.
2. WHEN the user clicks the link in the verification email THEN the browser SHALL hit `GET /api/auth/verify-email?token=...&callbackURL=...` (API may redirect to `callbackURL` with session cookies set when `autoSignInAfterVerification` is true).
3. WHEN verification succeeds and session is established THEN the system SHALL redirect to `/onboarding/business` (first wizard step).
4. WHEN verification token is invalid or expired THEN the system SHALL show an error and option to return to `/verify-email` or request a new email.
5. WHEN an unverified user attempts a protected route THEN the system SHALL redirect to `/verify-email`.

**Independent Test**: Simulate verified callback → session cookie + `/dashboard` accessible via `GET /api/v1/me`.

---

### P1: Request password reset — MVP

**User Story**: As an owner (`P1`), I want to request a password reset link so that I can recover access if I forget my password.

**Why P1**: Standard account recovery; API implemented.

**Acceptance Criteria**:

1. WHEN the user opens `/forgot-password` and submits an email THEN the system SHALL call `POST /api/auth/request-password-reset` with `{ email, redirectTo: WEB_URL/reset-password }`.
2. WHEN the request completes (success or unknown email) THEN the system SHALL show the **same neutral** copy: “If an account exists for this email, we sent a reset link.”
3. WHEN the user navigates back THEN the system SHALL link to `/login`.

**Independent Test**: Submit any email → always see neutral success state; no enumeration UI.

---

### P1: Reset password with token — MVP

**User Story**: As an owner (`P1`), I want to set a new password from the email link so that I can sign in again.

**Why P1**: Completes recovery flow.

**Acceptance Criteria**:

1. WHEN the user opens `/reset-password?token=...` without a token THEN the system SHALL show an invalid-link state with CTA to `/forgot-password`.
2. WHEN the user submits new password + confirm password (client match) THEN the system SHALL call `POST /api/auth/reset-password` with `{ newPassword, token }`.
3. WHEN reset succeeds THEN the system SHALL show success and redirect to `/login` within a reasonable delay or on button click.
4. WHEN the token is expired or already used THEN the system SHALL show an error and CTA to `/forgot-password`.
5. WHEN password rules fail (min 8) THEN the system SHALL show inline validation before submit.

**Independent Test**: MSW valid token → success → `/login`; invalid token → error state.

---

### P1: Session persistence and protected routes — MVP

**User Story**: As an owner (`P1`), I want my session to persist across reloads and be renewed without re-entering credentials so that work is not interrupted.

**Why P1**: Cookie sessions + `/me` are the backbone of the admin app.

**Acceptance Criteria**:

1. WHEN the app loads THEN the system SHALL call `GET /api/v1/me` (via TanStack Query) with credentials included.
2. WHEN `/me` returns 401 THEN the system SHALL treat the user as logged out and redirect protected routes to `/login`.
3. WHEN `/me` returns a user with `emailVerified: false` THEN protected routes SHALL redirect to `/verify-email`.
4. WHEN the user signs out THEN the system SHALL call `POST /api/auth/sign-out`, clear query cache for session, and redirect to `/login`.
5. WHEN access token/session expires THEN Better Auth cookie refresh SHALL be handled by the library/browser cookie lifecycle — the Axios layer SHALL NOT store tokens in `localStorage`.
6. WHEN an authenticated verified user visits `/` THEN the system SHALL redirect per onboarding status (`/onboarding` or `/dashboard`).
7. WHEN `establishments.length === 0` and user visits `/dashboard` THEN the system SHALL redirect to `/onboarding/business`.

**Independent Test**: Mock `/me` 200 → access `/dashboard`; mock 401 → redirect `/login`; reload preserves session (MSW cookie simulation).

---

### P1: First-access onboarding wizard (US-005) — MVP

**User Story**: As a new owner (`P1`), I want an interactive setup assistant after confirming my email so that I can configure my business, a professional, a service, and working hours quickly.

**Why P1**: Product goal “rapid setup in under 30 minutes”; documented in `docs/flow/01-auth/step-by-step.md` and wireframes.

**Wizard steps** (wireframes: `docs/flow/01-auth/diagrams/wireframes/pages.md`):

| Step | Route | UI (pt-BR) | API on “Próximo” (if not skipped) |
| ---- | ----- | ---------- | ----------------------------------- |
| 1 | `/onboarding/business` | Nome, fuso horário (categoria UI opcional/desabilitada até API existir) | `POST /api/v1/establishments` — `name`, `email` (owner email), `timezone`, auto `slug` |
| 2 | `/onboarding/professional` | Nome, email, telefone (foto opcional omitida) | `POST .../professionals` — requires `establishmentId` from step 1 |
| 3 | `/onboarding/service` | Informativo: configurar serviços depois no painel | **No API call** — “Pular” only |
| 4 | `/onboarding/hours` | Dias da semana, abertura/fechamento, pausa almoço opcional | One `PUT .../business-hours/:weekday` per selected open day (`breakStartsAt` / `breakEndsAt` when lunch set) |
| 5 | `/onboarding/done` | Resumo do que foi salvo + CTA “Ir para Dashboard” | No write; dashboard allowed because step 1 created establishment |

**Acceptance Criteria**:

1. WHEN email is verified and `GET /api/v1/establishments` returns an empty list THEN the system SHALL redirect protected routes (except onboarding) to `/onboarding/business`.
2. WHEN the user completes step 1 with valid data and clicks “Próximo” THEN the system SHALL call `POST /api/v1/establishments` and invalidate the establishments query.
3. WHEN the user is on step 1 THEN the system SHALL **not** show “Pular” — step 1 is mandatory.
4. WHEN the user clicks “Pular” on steps 2, 3, or 4 THEN the system SHALL advance without calling that step’s write API.
5. WHEN the user completes step 2 with valid data THEN the system SHALL create the professional linked to the current establishment.
6. WHEN the user is on step 3 THEN the system SHALL show informational copy and allow only “Pular” or “Próximo” (no service form submission).
7. WHEN the user configures hours on step 4 THEN the system SHALL persist business hours for each selected weekday before advancing.
8. WHEN the user reaches step 5 and clicks “Ir para Dashboard” AND `establishments.length >= 1` THEN the system SHALL redirect to `/dashboard`.
9. WHEN the user already has ≥1 establishment (e.g. partial prior run) THEN the system SHALL treat onboarding as complete and redirect `/onboarding` attempts to `/dashboard` (or show step 1 as read-only summary — Design choice).
10. WHEN subsequent logins occur and `establishments.length >= 1` THEN the system SHALL go directly to `/dashboard`.

**Independent Test**: MSW flow verify → `/onboarding/business` → create establishment → skip professional → skip service → set hours → done → `/dashboard`; reload stays on dashboard.

**P2 extension**: Re-open wizard from **Configurações > Assistente de Boas-vindas** (same routes, `force` query or store flag to allow revisiting when already completed).

---

### P2: Sign out from dashboard — Should have

**User Story**: As an owner (`P1`), I want to sign out from the admin panel so that I can secure my account on shared devices.

**Acceptance Criteria**:

1. WHEN the user triggers logout from dashboard chrome THEN the system SHALL call sign-out and redirect to `/login`.

**Independent Test**: Logout control → `/login`, subsequent `/me` is 401.

---

### P3: Change password (authenticated) — Nice to have

**User Story**: As an owner (`P1`), I want to change my password while logged in.

**Deferred to** account/settings module; API: `POST /api/auth/change-password`.

---

## UI & Components

### Reuse from `src/components/ui/`

| Component | Usage |
| --------- | ----- |
| `Button` | Primary CTA, loading state during submit |
| `Input` | Email, name, text fields |
| `Card` | Centered auth panel wrapper |
| `Toast` | Global API errors (optional) |

### New components (only if needed — each requires Storybook story)

| Component | Location | Notes |
| --------- | -------- | ----- |
| `PasswordField` | `src/components/ui/password-field.tsx` | `Input` + show/hide toggle; stories for default/error/disabled |
| `AuthFormCard` | `src/modules/auth/components/auth-form-card.tsx` | Title, subtitle, children, footer links — module-specific |
| `FormError` | `src/components/ui/form-error.tsx` OR inline in `AuthFormCard` | Accessible `role="alert"` for API errors |
| `OnboardingShell` | `src/modules/onboarding/components/onboarding-shell.tsx` | Progress “Passo X/5”, title, Pular / Próximo |
| `StepProgress` | `src/modules/onboarding/components/step-progress.tsx` | Visual step indicator |
| `Select` / `Combobox` | `src/components/ui/` **if missing** | Timezone, weekday multi-select — add with Storybook |

Wireframes reference (`docs/flow/01-auth/diagrams/wireframes/pages.md`): signup includes **confirm password**; signup API does not require it — validate only on client. Onboarding steps 1–5 follow wireframe copy in **Brazilian Portuguese**.

**Copy language:** UI strings in **Brazilian Portuguese**; code identifiers in **English**.

### AuthLayout

- Minimal centered layout, brand mark, no dashboard chrome
- Responsive (mobile-first owners)
- Shared across `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`

### OnboardingLayout

- Full-width focused layout with step progress header (no dashboard sidebar)
- “Pular” on steps **2, 3, 4** only (not step 1, not `done`)
- Shared across `/onboarding/*`

---

## Edge Cases

- WHEN the API returns `403` on sign-in (CSRF / untrusted Origin) THEN the system SHALL show a generic error and log internally (no stack traces to user).
- WHEN network fails THEN the system SHALL show retry-friendly message; form state preserved.
- WHEN user double-submits a form THEN the system SHALL disable the submit button while pending.
- WHEN `reset-password` is opened without `token` query param THEN the system SHALL not call the API until a valid token is present.
- WHEN signup `callbackURL` is misconfigured THEN verification redirect may fail — env `VITE_API_URL` / `WEB_URL` must match backend `trustedOrigins`.
- WHEN session exists but user is deleted server-side THEN `/me` 401 SHALL clear client session state.
- WHEN user completes step 1 then refreshes mid-wizard THEN the system SHALL restore `establishmentId` from `GET /api/v1/establishments` and resume correct step.
- WHEN services API is unavailable THEN step 3 SHALL remain skippable without blocking steps 4–5.
- WHEN user attempts deep-link to `/onboarding/done` without an establishment THEN the system SHALL redirect to `/onboarding/business`.
- WHEN resend verification is clicked during cooldown THEN the button SHALL stay disabled and show remaining seconds.

---

## Non-Functional Requirements

| ID | Requirement |
| -- | ------------- |
| AUTH-NF-01 | All auth API calls use Axios singleton with `withCredentials: true` |
| AUTH-NF-02 | Zod schemas align with `auth.schema.ts` limits (password 8–128, email format) |
| AUTH-NF-03 | No sensitive values in console logs (password, tokens) |
| AUTH-NF-04 | MSW handlers for all auth endpoints in tests and Storybook |
| AUTH-NF-05 | Route guards run before rendering dashboard children |
| AUTH-NF-06 | Accessible forms: labels, `aria-invalid`, focus on first error |
| AUTH-NF-07 | Onboarding wizard state survives refresh within session (`establishmentId` from API list) |
| AUTH-NF-08 | MSW handlers cover onboarding domain calls (establishments, professionals, business-hours) |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| AUTH-01 | P1: Sign up | Implement | Completed |
| AUTH-02 | P1: Sign in | Implement | Completed |
| AUTH-03 | P1: Email verification gate | Implement | Completed |
| AUTH-04 | P1: Request password reset | Implement | Completed |
| AUTH-05 | P1: Reset password | Implement | Completed |
| AUTH-06 | P1: Session + protected routes | Implement | Completed |
| AUTH-07 | P1: AuthLayout + public routes | Implement | Completed |
| AUTH-08 | P1: Axios + auth API module | Implement | Completed |
| AUTH-09 | UI: PasswordField (+ story) | Implement | Completed |
| AUTH-10 | P2: Sign out from dashboard | — | Completed |
| AUTH-11 | P3: Change password | — | Deferred |
| AUTH-12 | P1: Onboarding wizard shell + routes | Implement | Completed |
| AUTH-13 | P1: Step 1 — business (establishment) | Implement | Completed |
| AUTH-14 | P1: Step 2 — professional | Implement | Completed |
| AUTH-15 | P1: Step 3 — service (informational) | Implement | Completed |
| AUTH-16 | P1: Step 4 — business hours | Implement | Completed |
| AUTH-17 | P1: Step 5 — done + establishments heuristic | Implement | Completed |
| AUTH-18 | P1: Onboarding guard + post-verify redirect | Implement | Completed |
| AUTH-19 | P2: Re-open wizard from settings | — | Pending |
| AUTH-20 | P1: Resend verification + 60s cooldown | Implement | Completed |
| AUTH-21 | Services CRUD API (full step 3) | — | Deferred |

**Coverage:** 21 total, 18 completed, 2 deferred, 1 pending

---

## Success Criteria

- [ ] New owner completes signup → verification → onboarding (at least step 1 + done) → `/dashboard` in &lt; 10 minutes (happy path, dev environment).
- [ ] Returning owner with completed onboarding signs in → `/dashboard` without manual cookie handling.
- [ ] New owner cannot reach `/dashboard` without completing onboarding step 1 (establishment created).
- [ ] New owner can skip onboarding steps 2–4 and still reach `/dashboard` after step 1.
- [ ] Forgot/reset password completes with neutral messaging and no email enumeration in UI.
- [ ] Unauthenticated access to `/dashboard` always redirects to `/login`.
- [ ] Unverified session never renders dashboard content.
- [ ] `pnpm lint && pnpm test` pass for auth module tests and new UI stories.

---

## References

| Document | Path |
| -------- | ---- |
| User stories (legacy — reconcile JWT notes) | `docs/flow/01-auth/USER_STORIES.md` |
| Wireframes | `docs/flow/01-auth/diagrams/wireframes/pages.md` |
| Step-by-step | `docs/flow/01-auth/step-by-step.md` |
| API routes | `apps/api/src/modules/auth/auth.routes.ts` |
| API schemas | `apps/api/src/modules/auth/auth.schema.ts` |
| Roadmap | `.specs/project/ROADMAP.md` (Phase 2 — Auth) |
| Discuss decisions | `.specs/features/auth/context.md` |
| Design | `.specs/features/auth/design.md` |
| Tasks | `.specs/features/auth/tasks.md` |

---

## Resolved Decisions

Captured in `context.md` (2026-05-20). Summary:

| Topic | Decision |
| ----- | -------- |
| Onboarding step 3 | Informational only (1A) |
| Onboarding complete | `establishments.length >= 1` (2C) |
| Resend verification | Button + `send-verification-email` + 60s cooldown (3B) |
| Mandatory step | Step 1 only (4B) |
| Auth HTTP client | Axios `authApi` + Query (5B) |
| Duplicate email on signup | Explicit message (agent maps Better Auth error in Design) |

---

*Spec status: **Approved** (2026-05-20). Tasks: **Approved** — `.specs/features/auth/tasks.md` (24 tasks). Next phase: **Execute** (start with T1).*
