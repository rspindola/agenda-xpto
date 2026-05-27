# Auth Context

**Gathered:** 2026-05-20  
**Spec:** `.specs/features/auth/spec.md`  
**Status:** Ready for design

---

## Feature Boundary

Deliver the full owner authentication flow (signup, email verification, login, logout, password reset) and the first-access **5-step onboarding wizard**, ending at `/dashboard` with a cookie-based Better Auth session. No worker login, no OAuth, no onboarding summary email in MVP.

---

## Implementation Decisions

### Onboarding — step 3 (services)

- **1A:** Step 3 is **informational only** — no service creation API call.
- Copy directs user to configure services later in the admin panel.
- “Pular” advances to step 4; no dependency on Services CRUD API for MVP.

### Onboarding — completion detection

- **2C:** Onboarding is **complete** when `GET /api/v1/establishments` returns **≥ 1** establishment (TanStack Query as source of truth).
- No `onboardingCompletedAt` in database for MVP.
- No `localStorage` completion flag.
- Route guards: `emailVerified && establishments.length === 0` → force `/onboarding/business`; otherwise dashboard allowed.

### Onboarding — mandatory vs optional steps

- **4B:** **Step 1 (business) is mandatory** — user cannot reach `/dashboard` without creating at least one establishment.
- Steps **2, 3, and 4** are optional (“Pular” available).
- Step 5 (`done`) is a summary + CTA “Ir para Dashboard” (only reachable after step 1 succeeded).
- **No “Pular”** on step 1; **no** global “skip entire wizard” without completing step 1.

### Email verification — resend

- **3B:** `/verify-email` includes **“Reenviar e-mail de confirmação”** calling `POST /api/auth/send-verification-email` with `{ email, callbackURL }`.
- **60-second client-side cooldown** after each resend (button disabled + countdown).
- Server rate limits remain authoritative; cooldown is UX-only.

### HTTP client for auth

- **5B:** Use **Axios singleton** (`#lib/axios.ts`) with thin `authApi` wrappers and TanStack Query for session (`GET /api/v1/me`).
- **Do not** add `better-auth` / `better-auth/react` to the web app for MVP.

### Signup — duplicate email messaging

- **Agent’s discretion (locked for design):** Show an **explicit** message when signup fails due to duplicate email (e.g. “Este e-mail já está cadastrado”), mapped from Better Auth response `code` / `message` after probing in dev.
- Login and forgot-password remain **generic** (no enumeration).

### Post-verify redirect (already in spec)

- After email verification → `/onboarding/business` (not `/dashboard`).

---

## Specific References

- Wireframes: `docs/flow/01-auth/diagrams/wireframes/pages.md`
- Step-by-step copy: `docs/flow/01-auth/step-by-step.md`
- UI copy in **Brazilian Portuguese**; code in **English**
- Reuse `src/components/ui/` (Button, Input, Card, Toast); add `PasswordField` + Storybook if missing

---

## Deferred Ideas

- **Services CRUD API** + full interactive onboarding step 3 (replace informational step).
- **`onboardingCompletedAt`** on User when “re-open wizard from Settings” (P2) needs persistence beyond establishment heuristic.
- **`better-auth/react` client** if Axios maintenance becomes painful.
- **Onboarding summary email** on wizard completion (P2).
- **Establishment category** field on step 1 (when API schema supports it).
