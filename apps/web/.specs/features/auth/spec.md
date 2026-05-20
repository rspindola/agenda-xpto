# Authentication & Onboarding Specification

## Problem Statement

Agenda XPTO needs a secure, seamless entry point for new and existing tenants (business owners). New users require a frictionless onboarding flow (the Welcome Wizard) to set up their business details, add their first professional and service, and set initial working hours so they can instantly start scheduling appointments. Without authentication, tenants cannot manage their operations, and without a welcoming onboarding flow, adoption will suffer.

## Goals

- [ ] Provide secure sign-up, sign-in, and password recovery flows for business owners (Admins).
- [ ] Implement an email verification gate that blocks unverified accounts from entering the operational system.
- [ ] Build a 5-step, skippable, and autosaved initial onboarding welcome wizard under `/welcome`.
- [ ] Retain onboarding progress between sessions so users can resume where they left off.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Professional Login (US-006, US-007) | Belongs to Module 05 (Worker Panel) and will be specified/built separately. |
| Multi-tenant Switching (US-014) | Post-MVP scope for professionals working at multiple salons. |
| WhatsApp QR Code Integration (US-202) | Post-MVP feature. |
| Verification Email customization | Managed directly by the Better Auth backend config. |

---

## Open Questions

> [!WARNING]
> **Missing Service CRUD Backend Route:**
> The backend monorepo has completed route suites for `auth`, `establishments`, `availability`, and `plans`, but **no route exists to create/manage Services** (e.g., `POST /api/v1/establishments/:establishmentId/services`).
> - **How to proceed?** We recommend that we either implement a minimal backend Service CRUD plugin under a new `services.plugin.ts` route (in `apps/api`), or we mock this endpoint (`POST /api/v1/establishments/:establishmentId/services`) on the frontend using MSW (Mock Service Worker) for the onboarding wizard until Module 03 (Establishment Setup) introduces it.
> - *Recommendation:* We should define `POST /api/v1/establishments/:establishmentId/services` as a necessary contract for the wizard and build or mock it accordingly.

---

## User Stories

### P1: Standard Authentication ⭐ MVP
**User Story**: As a tenant Admin, I want to sign up, sign in, verify my email, and recover my password, so that I can securely access and manage my business dashboard.

**Why P1**: This is the absolute foundation of the SaaS multi-tenant isolation and security.

**Requirement Traceability**:
- `AUTH-01`: Sign Up
- `AUTH-02`: Log In
- `AUTH-03`: Request Password Reset
- `AUTH-04`: Reset Password
- `AUTH-05`: Silent Session Refresh (Access/Refresh Token)
- `AUTH-06`: Email Verification Gate

**Acceptance Criteria**:
1. **WHEN** the user signs up with a name, email, and password (≥ 8 chars), **THEN** the system SHALL call `/api/auth/sign-up/email` and trigger a verification email.
2. **WHEN** an unverified user logs in, **THEN** the system SHALL redirect them to the `/verify-email` gate page.
3. **WHEN** the user is on the `/verify-email` page, **THEN** the system SHALL check if their email is verified and provide an option to resend the verification email via `/api/auth/verify-email`.
4. **WHEN** the user logs in with valid credentials, **THEN** the system SHALL call `/api/auth/sign-in/email`, establish a session, and redirect them to `/dashboard` (or `/welcome` if onboarding is incomplete).
5. **WHEN** login fails, **THEN** the system SHALL show a generic error message (avoiding email enumeration).
6. **WHEN** the user requests a password reset, **THEN** the system SHALL call `/api/auth/request-password-reset` with the email and a redirection URL.
7. **WHEN** the user accesses `/reset-password` with a valid token, **THEN** they SHALL be able to set a new password via `/api/auth/reset-password` and then redirect to `/login`.

**Independent Test**:
- Sign up with `test@example.com`, verify the mock email verification step, log in, and check that a cookie session is successfully established.

---

### P1: Onboarding Welcome Wizard ⭐ MVP
**User Story**: As a newly registered Admin, I want to be guided by a 5-step interactive wizard, so that I can quickly set up my business, professionals, services, and horaries.

**Why P1**: Onboarding translates empty states into a fully configured, scheduling-ready establishment.

**Requirement Traceability**:
- `AUTH-07`: Onboarding Step 1 - Business Setup (`POST /api/v1/establishments`)
- `AUTH-08`: Onboarding Step 2 - Professional Setup (`POST /api/v1/establishments/:id/professionals`)
- `AUTH-09`: Onboarding Step 3 - Service Setup (`POST /api/v1/establishments/:id/services` - contract)
- `AUTH-10`: Onboarding Step 4 - Working Hours (`PUT /api/v1/establishments/:id/availability/business-hours`)
- `AUTH-11`: Onboarding Step 5 - Confirmation & Completion
- `AUTH-12`: Progress Retention & Skippability

**Acceptance Criteria**:
1. **WHEN** an authenticated user with no establishments logs in, **THEN** the system SHALL redirect them to `/welcome`.
2. **WHEN** the user completes Step 1 (Business Setup) and clicks "Next", **THEN** the system SHALL save the establishment details (Name, Category, Country, Timezone) and advance to Step 2.
3. **WHEN** the user completes Step 2 (Professional Setup), **THEN** the system SHALL create the professional associated with the establishment and advance to Step 3.
4. **WHEN** the user completes Step 3 (Service Setup), **THEN** the system SHALL create the service and link it to the professional created in Step 2.
5. **WHEN** the user completes Step 4 (Working Hours), **THEN** the system SHALL update the establishment's business hours for each selected weekday.
6. **WHEN** the user is on Step 5, **THEN** the system SHALL display a summary of the configured data, send a confirmation/welcome email, and redirect the user to `/dashboard` upon clicking "Get Started".
7. **WHEN** the user clicks "Skip" on any step, **THEN** the system SHALL skip that specific entity creation, save what was entered so far, and advance to the next step.
8. **WHEN** the user leaves the onboarding wizard mid-way, **THEN** the system SHALL retain their current step and entered details upon returning.

**Independent Test**:
- Complete the onboarding wizard step-by-step with a new tenant, skip Step 2 and 3, verify that Step 1 and 4 configurations persist in the database, and that the user successfully redirects to the dashboard.

---

## Edge Cases

- **Session Expiry mid-wizard:** IF the user's session expires while they are in the onboarding wizard, THEN the system SHALL preserve their current wizard step and form state in LocalStorage and prompt them to re-login, resuming where they left off.
- **Duplicate Establishment Slug:** IF the user inputs a business name that generates a duplicate slug in Step 1, THEN the system SHALL return a validation error ("Nome de negócio já em uso") and prompt the user to adjust the name before proceeding.
- **Invalid Working Hours Range:** IF the user defines an opening time after the closing time in Step 4, THEN the system SHALL block submission with a clear validation error.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| `AUTH-01` | P1: Standard Authentication | Specify | Pending |
| `AUTH-02` | P1: Standard Authentication | Specify | Pending |
| `AUTH-03` | P1: Standard Authentication | Specify | Pending |
| `AUTH-04` | P1: Standard Authentication | Specify | Pending |
| `AUTH-05` | P1: Standard Authentication | Specify | Pending |
| `AUTH-06` | P1: Standard Authentication | Specify | Pending |
| `AUTH-07` | P1: Onboarding Welcome Wizard | Specify | Pending |
| `AUTH-08` | P1: Onboarding Welcome Wizard | Specify | Pending |
| `AUTH-09` | P1: Onboarding Welcome Wizard | Specify | Pending |
| `AUTH-10` | P1: Onboarding Welcome Wizard | Specify | Pending |
| `AUTH-11` | P1: Onboarding Welcome Wizard | Specify | Pending |
| `AUTH-12` | P1: Onboarding Welcome Wizard | Specify | Pending |

**Coverage:** 12 total, 0 mapped to tasks, 12 unmapped ⚠️

---

## Success Criteria

- [ ] **Seamless Login/Onboarding:** A user can sign up, confirm email, and complete the 5-step onboarding wizard in under 3 minutes.
- [ ] **Zero Data Loss:** 100% of entered steps are persisted immediately, ensuring that a page refresh or connection failure does not lose onboarding progress.
- [ ] **Robust Security:** Attempting to access `/dashboard` or `/welcome` without email verification redirects correctly to `/verify-email`.
