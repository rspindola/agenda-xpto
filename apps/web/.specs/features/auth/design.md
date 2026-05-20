# Technical Design — Authentication & Onboarding

This document outlines the technical design for the frontend Authentication and Onboarding Welcome Wizard features in `apps/web`.

---

## 1. Directory Structure

All feature-specific code for authentication and onboarding will live inside `apps/web/src/modules/auth/`. Standard components in `src/components/ui/` will be reused.

```
apps/web/src/modules/auth/
├── components/                  # Feature-specific UI components
│   ├── AuthLayout.tsx           # Premium layout wrapper (gradients, animations)
│   ├── LoginForm.tsx            # Login form card
│   ├── SignUpForm.tsx           # Signup form card
│   ├── ForgotPasswordForm.tsx   # Request reset form card
│   ├── ResetPasswordForm.tsx    # Password reset form card
│   └── onboarding/              # Welcome Wizard steps
│       ├── Step1Business.tsx    # Step 1: Business Setup Form
│       ├── Step2Professional.tsx# Step 2: Professional Setup Form
│       ├── Step3Service.tsx     # Step 3: Service Setup Form
│       ├── Step4WorkingHours.tsx# Step 4: Working Hours Setup Form
│       └── Step5Summary.tsx     # Step 5: Summary & Confirmation
├── hooks/                       # Feature-specific hooks
│   ├── useAuth.ts               # Login, Signup, Session query hooks
│   └── useOnboarding.ts         # Hook linking Zustand store and API mutations
├── pages/                       # Route components
│   ├── LoginPage.tsx
│   ├── SignUpPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── VerifyEmailPage.tsx
│   └── WelcomePage.tsx
├── schemas/                     # Validation schemas
│   ├── auth.schema.ts           # Login, Signup, Reset schemas
│   └── onboarding.schema.ts     # Business, Professional, Service, Hours schemas
└── stores/                      # Onboarding and session stores
    └── onboardingStore.ts       # Zustand store with LocalStorage persistence
```

---

## 2. Route Architecture (TanStack Router)

TanStack Router is file-based. We will define the following routes under `apps/web/src/routes/`:

| Route Path | Component | Auth Policy | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public (Unauthenticated) | Displays premium login card. Redirects to `/dashboard` if already authenticated. |
| `/signup` | `SignUpPage` | Public (Unauthenticated) | Displays premium sign-up card. Redirects to `/verify-email` on success. |
| `/forgot-password` | `ForgotPasswordPage` | Public (Unauthenticated) | Password recovery request form. |
| `/reset-password` | `ResetPasswordPage` | Public (Unauthenticated) | Parses `token` from search parameters. Sets new password. |
| `/verify-email` | `VerifyEmailPage` | Restricted (Auth Gate) | Prevents users with `emailVerified: false` from accessing the rest of the application. |
| `/welcome` | `WelcomePage` | Restricted (Auth Gate) | Onboarding wizard page. Requires `emailVerified: true`. |

### Onboarding Step Query Param
To support back/forward browser navigation and direct links, the active step in `/welcome` will be synced with the URL search query parameter `?step=1..5`.
If no step is defined, it defaults to the `currentStep` stored in the `onboardingStore` (or `step=1` if empty).

---

## 3. Session & Auth Integration

Authentication session management is powered by **Better Auth** cookies. The frontend calls the API endpoints proxied under `/api/auth/*`.

### Auth Client Hook (`useAuth`)
We will create a unified `useAuth` hook powered by **TanStack Query** to query current user session status:
- **Session Query (`GET /api/v1/me`)**: Retrieves logged-in user profile (`id`, `name`, `email`, `emailVerified`).
- **Sign In Mutation (`POST /api/auth/sign-in/email`)**: Sets cookies on success, triggers query invalidate, redirects to `/dashboard` (or `/welcome`).
- **Sign Up Mutation (`POST /api/auth/sign-up/email`)**: Registers the account, redirects to `/verify-email`.
- **Sign Out Mutation (`POST /api/auth/sign-out`)**: Clears sessions, clears stores, redirects to `/login`.
- **Verify Email Checker**: Polling query against `/api/v1/me` to automatically transition the user to `/welcome` once they verify their email.

---

## 4. Onboarding State Management (Zustand Store)

To ensure **Zero Data Loss** and progress preservation (`AUTH-12`), the onboarding wizard uses a Zustand store (`onboardingStore.ts`) with the `persist` middleware.

### Store Schema (`OnboardingState`)
```typescript
type Step1Data = {
  name: string
  slug?: string
  email: string
  phone?: string
  address?: string
  timezone: string
  minAdvanceMinutes: number
}

type Step2Data = {
  name: string
  email?: string
  phone?: string
}

type Step3Data = {
  name: string
  durationMinutes: number
  priceCents?: number
}

type Step4Data = {
  activeWeekdays: Record<string, boolean> // e.g. { MON: true, TUE: true, ... }
  hours: Record<string, {
    opensAt: string
    closesAt: string
    breakStartsAt?: string | null
    breakEndsAt?: string | null
  }>
}

type OnboardingStore = {
  // Wizard Progress
  currentStep: number
  establishmentId: string | null
  professionalId: string | null
  serviceId: string | null

  // Step Data Cache (Autosaved)
  step1: Step1Data | null
  step2: Step2Data | null
  step3: Step3Data | null
  step4: Step4Data | null

  // Status
  completedSteps: number[] // e.g. [1, 2]
  skippedSteps: number[]

  // Actions
  setStep: (step: number) => void
  saveStep1: (data: Step1Data, establishmentId: string) => void
  saveStep2: (data: Step2Data, professionalId: string) => void
  saveStep3: (data: Step3Data, serviceId: string) => void
  saveStep4: (data: Step4Data) => void
  skipStep: (step: number) => void
  resetOnboarding: () => void
}
```

---

## 5. Verification & Persistence Flows

### Autosave and Retention Flow
1. **User input**: As the user types in any step, the form values are validated locally via Zod.
2. **Next click**: On submitting a step:
   - Perform API calls to save changes to the real PostgreSQL database.
   - Cache data in `onboardingStore` (persisted to LocalStorage).
   - Advance `currentStep` and URL parameter `?step=X`.
3. **Skipping**: Clicking "Pular" calls `skipStep(step)`, records the step as skipped, caches any partial input, and advances to the next step immediately.
4. **Resuming**: If the session expires or the user leaves:
   - On reloading `/welcome`, the store reads `currentStep` from LocalStorage and redirects them to the correct step immediately.

### API Integration Operations
- **Step 1 (Establishment)**: `POST /api/v1/establishments`. Payload parses `name`, `slug`, `email`, `phone`, `timezone`. Store retains returned `establishmentId`.
- **Step 2 (Professional)**: `POST /api/v1/establishments/:establishmentId/professionals`. Payload parses `name`, `email`, `phone`. Store retains returned `professionalId`.
- **Step 3 (Service)**:
  - **Option A (Recommended)**: Create a minimal backend plugin inside `apps/api` (as detailed in section 7) to provide `POST /api/v1/establishments/:id/services` and link the service to the professional.
  - **Option B (Fallback)**: Mock this endpoint in the frontend using MSW (Mock Service Worker) for developer and UI testing.
- **Step 4 (Working Hours)**: For each selected day, call `PUT /api/v1/establishments/:establishmentId/availability/business-hours/:weekday` with opening/closing/break parameters.
- **Step 5 (Confirmation)**: Sends a final confirmation email and resets the onboarding cache, then redirects to `/dashboard`.

---

## 6. Premium UI/UX Aesthetic Spec

We will build a high-fidelity visual experience using **Tailwind CSS v4** to ensure an extremely premium, state-of-the-art SaaS feel:
- **Color Palette**: Harmonious dark/light system. Glassmorphism for card containers (`bg-white/70 backdrop-blur-md dark:bg-zinc-950/70 border border-zinc-200/50 dark:border-zinc-800/50`).
- **Typography**: Modern typography with Google Fonts `Inter` or `Outfit` instead of default browser sans.
- **Visuals**: Curated gradients (`bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500` for branding accents).
- **Micro-animations**: Smooth step-to-step transitions (`transition-all duration-300 ease-in-out`), scale-ups on hover, and custom spinner feedback.
- **No Placeholders**: High-quality SVG icons from Lucide React to create an interactive interface.

---

## 7. Option A: Backend Service CRUD Implementation Details

To allow the Welcome Wizard to work fully end-to-end with the real database during local development, we propose implementing a minimal, robust Service CRUD endpoint in the backend.

### 7.1 New Service Schema (`apps/api/src/modules/availability/services.schema.ts`)
```typescript
import { z } from "zod";
import { establishmentIdParamsSchema } from "~/modules/availability/availability.schema.js";

export const createServiceBodySchema = z.object({
  name: z.string().min(1).max(200).describe("Service name"),
  snapshotDurationMinutes: z.number().int().min(5).max(1440).describe("Duration in minutes"),
  priceCents: z.number().int().min(0).optional().describe("Price in cents"),
});

export type CreateServiceBody = z.infer<typeof createServiceBodySchema>;

export const servicePublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  snapshotDurationMinutes: z.number().int(),
  priceCents: z.number().int().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ServicePublic = z.infer<typeof servicePublicSchema>;
```

### 7.2 Register Route (`POST /api/v1/establishments/:establishmentId/services`)
Registered under the `availabilityModulePlugin` inside `apps/api/src/modules/availability/availability.plugin.ts`:
```typescript
await fastify.register(createServicesRoutesPlugin(servicesService), {
  prefix: "/:establishmentId/services",
});
```
This is fully compatible with Fastify's encapsulated scoping and our established architecture.
