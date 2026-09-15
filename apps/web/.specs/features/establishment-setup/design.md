# Establishment Setup Design

**Spec:** `.specs/features/establishment-setup/spec.md`  
**Context:** `.specs/features/establishment-setup/context.md`  
**Status:** Draft (2026-09-15)

---

## Architecture Overview

The establishment setup feature manages the lifecycle and multi-tenancy context of establishments in the frontend. It integrates **TanStack Store** for the active establishment ID, **TanStack Query** for caching and cache invalidation, **TanStack Form + Zod** for validated forms, **Axios** with credentials for API transport, and **TanStack Router** for nested layout routes (`/_authenticated/settings/*`).

```mermaid
flowchart TB
  subgraph Router [TanStack Router]
    DL["DashboardLayout (Header + Navigation)"]
    SL["SettingsLayout (/settings/*)"]
    R_Gen["/settings/general"]
    R_Hours["/settings/hours"]
    R_Prof["/settings/professionals"]
    R_Serv["/settings/services"]
    R_Danger["/settings/danger"]
  end

  subgraph State [State Management]
    ES["establishmentStore (@tanstack/react-store)\nactiveEstablishmentId"]
    TQ["TanStack Query Cache\n- establishmentKeys.list()\n- establishmentKeys.detail(id)\n- establishmentKeys.professionals(id)\n- establishmentKeys.services(id)\n- establishmentKeys.hours(id)"]
  end

  subgraph Components [Establishment Components]
    SW["EstablishmentSwitcher (Header)"]
    CD["CreateEstablishmentDialog (Modal)"]
    GF["GeneralSettingsForm (/settings/general)"]
    DZ["DangerZoneSection & DeleteConfirmationDialog (/settings/danger)"]
    SS["SettingsSidebar"]
    PL["ProfessionalsReadonlyList"]
    SLS["ServicesReadonlyList"]
    HL["HoursReadonlySummary"]
  end

  subgraph Api [API Layer (Axios)]
    EA["establishmentsApi\n- list()\n- getById(id)\n- create(body)\n- update(id, body)\n- delete(id)\n- getProfessionals(id)\n- getServices(id)\n- getBusinessHours(id)"]
  end

  DL --> SW
  SW --> ES
  SW --> CD
  DL --> SL
  SL --> SS
  SL --> R_Gen & R_Hours & R_Prof & R_Serv & R_Danger
  R_Gen --> GF
  R_Danger --> DZ
  R_Prof --> PL
  R_Serv --> SLS
  R_Hours --> HL

  GF & DZ & CD --> TQ
  PL & SLS & HL --> TQ
  TQ --> EA
  ES -.-> |drives query keys| TQ
```

---

## State & Context Architecture

### 1. Active Establishment Store (`establishmentStore`)
- Built with `@tanstack/react-store` (per project decision in `STATE.md`).
- Holds `{ activeEstablishmentId: string | null }`.
- Persists to `localStorage` key `agenda_xpto_active_establishment_id` for session continuity across page reloads.
- Exposes `useActiveEstablishment()` hook:
  1. Reads `activeEstablishmentId` from store.
  2. Reads `establishments` from `useQuery(establishmentKeys.list())`.
  3. If `activeEstablishmentId` is null or does not match any existing establishment in the list, automatically falls back to `establishments[0]?.id` and syncs the store.
  4. Returns `{ activeEstablishmentId, activeEstablishment, establishments, isLoading, setActiveEstablishmentId }`.

### 2. Plan Limit Resolver
- Plans:
  - **Starter**: `maxEstablishments: 1`
  - **Pro**: `maxEstablishments: 3`
  - **Business**: `maxEstablishments: 10`
- Extracted from `sessionData.user.plan` or defaults to `Starter` (or `Pro` during trial).
- Helper function `getPlanEstablishmentLimit(planName: string)` returns `{ max: number, isAtLimit: boolean, remaining: number }`.

### 3. Context Switch Flow
When an owner switches the establishment via `EstablishmentSwitcher`:
1. `setActiveEstablishmentId(newId)` updates the TanStack Store.
2. Active establishment ID is updated in `localStorage`.
3. All queries dependent on the establishment ID automatically re-evaluate because their `queryKey` includes `activeEstablishmentId` (e.g. `establishmentKeys.detail(activeEstablishmentId)`).

---

## Code Reuse Analysis

### Existing Components & Utilities to Leverage

| Asset | Location | How to Use |
| ----- | -------- | ---------- |
| `Button` | `#/components/ui/button.tsx` | Actions, form submit, switcher trigger, danger actions |
| `Input` | `#/components/ui/input.tsx` | All form inputs (name, slug, email, phone, etc.) |
| `Card` | `#/components/ui/card.tsx` | Form containers and settings sections |
| `Dialog` | `#/components/ui/dialog.tsx` | `CreateEstablishmentDialog` and `DeleteConfirmationDialog` |
| `Toast` | `#/components/ui/toast.tsx` | Success/error notifications on save and delete |
| `cn` | `#/lib/utils.ts` | Tailwind class merging |
| `api` | `#/lib/axios.ts` | Base Axios client with `withCredentials: true` |
| `ensureOnboardingComplete` | `#/modules/auth/lib/route-guards.ts` | Route guard protecting all `/_authenticated/settings/*` routes |
| `sessionQueryOptions` | `#/modules/auth/queries/session-queries.ts` | Access current user session and plan info |

---

## Route Structure

```
src/routes/_authenticated/
├── dashboard.tsx                   # Updated to use DashboardLayout & EstablishmentSwitcher
├── settings/
│   ├── route.tsx                   # Layout route: enforces ensureOnboardingComplete, renders SettingsLayout
│   ├── index.tsx                   # Redirects to /settings/general
│   ├── general.tsx                 # General settings form (EST-01)
│   ├── hours.tsx                   # Business hours read-only summary (EST-10)
│   ├── professionals.tsx           # Professionals read-only list (EST-11)
│   ├── services.tsx                # Services read-only list (EST-12)
│   └── danger.tsx                  # Danger zone & soft delete (EST-05)
```

---

## Module Layout (`apps/web/src/modules/establishments/`)

```
src/modules/establishments/
├── api/
│   ├── establishments-api.ts             # Complete CRUD + related entities API
│   └── __tests__/
│       └── establishments-api.test.ts    # Comprehensive API tests
├── components/
│   ├── establishment-switcher.tsx        # Header switcher dropdown + plan limit feedback
│   ├── establishment-switcher.stories.tsx
│   ├── create-establishment-dialog.tsx   # Modal to create additional establishment
│   ├── create-establishment-dialog.stories.tsx
│   ├── general-settings-form.tsx         # Full edit form (TanStack Form + Zod)
│   ├── general-settings-form.stories.tsx
│   ├── danger-zone-section.tsx           # Danger zone card + trigger
│   ├── danger-zone-section.stories.tsx
│   ├── delete-confirmation-dialog.tsx    # Two-step confirmation (type name)
│   ├── delete-confirmation-dialog.stories.tsx
│   ├── settings-sidebar.tsx              # GitHub-style secondary nav
│   ├── settings-sidebar.stories.tsx
│   ├── professionals-readonly-list.tsx   # Read-only list + CTA
│   ├── professionals-readonly-list.stories.tsx
│   ├── services-readonly-list.tsx        # Read-only list + CTA (BRL formatted)
│   ├── services-readonly-list.stories.tsx
│   ├── hours-readonly-summary.tsx        # Read-only weekday hours summary
│   └── hours-readonly-summary.stories.tsx
├── hooks/
│   ├── use-active-establishment.ts       # Store accessor + auto-fallback hook
│   ├── use-establishment-queries.ts      # Query options for detail, profs, servs, hours
│   ├── use-update-establishment.ts       # Mutation for PATCH /establishments/:id
│   ├── use-delete-establishment.ts       # Mutation for DELETE /establishments/:id
│   └── use-create-establishment.ts       # Mutation for POST /establishments
├── schemas/
│   └── establishment.schema.ts           # Zod validation schemas for forms & entities
├── stores/
│   └── establishment-store.ts            # TanStack Store for active establishment ID
├── query-keys.ts                         # Complete query key factory for establishments
└── __tests__/
    ├── use-active-establishment.test.ts
    ├── establishment-store.test.ts
    └── establishment.schema.test.ts
```

---

## Component Specifications & Interfaces

### 1. `EstablishmentStore`
- **Location:** `src/modules/establishments/stores/establishment-store.ts`
- **Interface:**
```typescript
export type EstablishmentStoreState = {
  activeEstablishmentId: string | null
}

export const establishmentStore: Store<EstablishmentStoreState>
export function setActiveEstablishmentId(id: string | null): void
export function resetEstablishmentStore(): void
```

### 2. `establishmentsApi`
- **Location:** `src/modules/establishments/api/establishments-api.ts`
- **Methods:**
```typescript
export const establishmentsApi = {
  async list(): Promise<EstablishmentPublic[]>
  async getById(id: string): Promise<EstablishmentPublic>
  async create(body: CreateEstablishmentBody): Promise<EstablishmentPublic>
  async update(id: string, body: UpdateEstablishmentBody): Promise<EstablishmentPublic>
  async delete(id: string): Promise<{ success: true }>
  async getProfessionals(id: string): Promise<ProfessionalSummary[]>
  async getServices(id: string): Promise<ServiceSummary[]>
  async getBusinessHours(id: string): Promise<BusinessHoursSummary[]>
}
```

### 3. `EstablishmentSwitcher`
- **Purpose:** Dropdown in top header allowing Pro/Business users to switch active establishment or open creation modal; displays static name for Starter users.
- **Location:** `src/modules/establishments/components/establishment-switcher.tsx`
- **Props:**
```typescript
export type EstablishmentSwitcherProps = {
  className?: string
}
```
- **Behavior:**
  - On Starter plan: Renders plain badge/text with active establishment name.
  - On Pro/Business: Renders interactive dropdown with list of establishments, active checkmark, plan count ("2 de 3 estabelecimentos"), limit warning banner if at limit, and "+ Novo Estabelecimento" button (disabled if limit reached).

### 4. `CreateEstablishmentDialog`
- **Purpose:** Dialog modal for creating a new establishment post-onboarding.
- **Location:** `src/modules/establishments/components/create-establishment-dialog.tsx`
- **Props:**
```typescript
export type CreateEstablishmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (created: EstablishmentPublic) => void
}
```
- **Fields:**
  - `name` (required, string 2..100)
  - `email` (required, email, prefilled with owner email)
  - `timezone` (required, dropdown, default America/Sao_Paulo)
  - `phone` (optional, string)
  - `address` (optional, string)
  - `slug` (optional, string)
  - `operationalEmail` (optional, email)

### 5. `GeneralSettingsForm`
- **Purpose:** Edit establishment general settings with preview of public booking URL and active/inactive toggle.
- **Location:** `src/modules/establishments/components/general-settings-form.tsx`
- **Props:**
```typescript
export type GeneralSettingsFormProps = {
  establishment: EstablishmentPublic
}
```
- **Behavior:**
  - Uses TanStack Form + `updateEstablishmentSchema`.
  - Slug input displays live public preview: `agenda.xpto.com/slug-value`.
  - Inactive toggle shows alert warning: "Desativar o estabelecimento oculta a página pública de agendamentos."
  - Save button shows loading spinner during mutation.
  - Success toast upon successful `PATCH`.

### 6. `DeleteConfirmationDialog` & `DangerZoneSection`
- **Purpose:** Irreversible soft-delete of active establishment requiring double confirmation.
- **Location:** `src/modules/establishments/components/danger-zone-section.tsx` & `delete-confirmation-dialog.tsx`
- **Props:**
```typescript
export type DeleteConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  establishment: EstablishmentPublic
  totalEstablishments: number
}
```
- **Behavior:**
  - Requires user to type the establishment name in an input.
  - Confirmation button is disabled until input matches `establishment.name` (case-insensitive trim).
  - If `totalEstablishments === 1`, displays prominent warning: "Este é seu único estabelecimento. Ao excluí-lo, você será redirecionado ao processo de configuração inicial."
  - On confirm: calls `DELETE /api/v1/establishments/:id`.
  - On success: invalidates establishment queries, updates store to next available establishment, navigates to `/dashboard` (or `/onboarding/business` if no establishments remain).

### 7. `SettingsSidebar` & `SettingsLayout`
- **Purpose:** Two-column GitHub-style settings page layout with navigation links.
- **Location:** `src/modules/establishments/components/settings-sidebar.tsx` & `src/components/layouts/settings-layout.tsx`
- **Nav items:**
  - Geral (`/settings/general`)
  - Horários de Funcionamento (`/settings/hours`)
  - Profissionais (`/settings/professionals`)
  - Serviços (`/settings/services`)
  - Zona de Perigo (`/settings/danger`) — styled in destructive red.

---

## Data Models & Validation Schemas

```typescript
// src/modules/establishments/schemas/establishment.schema.ts
import { z } from 'zod'

export const createEstablishmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens').optional().or(z.literal('')),
  email: z.string().email('E-mail comercial inválido'),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
  minAdvanceMinutes: z.number().int().min(0).max(1440).optional(),
  isActive: z.boolean().optional().default(true),
  operationalEmail: z.string().email('E-mail operacional inválido').optional().or(z.literal('')),
})

export const updateEstablishmentSchema = createEstablishmentSchema.partial()

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>

export type ProfessionalSummary = {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
}

export type ServiceSummary = {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
  isActive: boolean
}

export type BusinessHoursSummary = {
  weekday: number
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}
```

---

## Error Handling Strategy

| Error Scenario | Handling | User Feedback |
| -------------- | -------- | ------------- |
| `403 Forbidden` (not owner) | Catch error in mutation/query | Generic error banner + redirect to `/dashboard` |
| `409 Conflict` (duplicate slug) | Caught in form submission | Form error on `slug` field: "Este slug já está em uso por outro estabelecimento" |
| `404 Not Found` (already deleted) | Query failure handler | Invalidates establishment cache and resets active establishment |
| Network error on Save | Mutation `onError` | Toast error: "Falha na conexão. Suas alterações não foram salvas." Form values preserved |
| Double submission | Form isSubmitting / mutation isPending | Submit button disabled with loading spinner |

---

## Tech Decisions & Rationale

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| **State Manager** | TanStack Store (`@tanstack/react-store`) | Matches project architecture guideline (`STATE.md`) without introducing Zustand redundancy |
| **Update Method** | `PATCH /api/v1/establishments/:id` | Allows selective partial updates for general settings |
| **Persistence** | `localStorage` for `activeEstablishmentId` | Retains selected business context across tabs and page reloads |
| **Plan Limits** | Inferred from user plan in session (`sessionQueryOptions`) | Decoupled UI feedback matching Starter (1), Pro (3), Business (10) |
| **Delete confirmation** | Double-confirmation modal (type establishment name) | Prevents accidental loss of business data, consistent with GitHub/Vercel pattern |

---

## Verification & Testing Plan

1. **Unit & Hook Tests (Vitest):**
   - `establishmentStore` (initial state, updates, resets).
   - `useActiveEstablishment` (selection, fallback when null, list sync).
   - `establishment.schema` (validation rules for all fields).
   - `establishmentsApi` (all CRUD and read-only endpoints).
2. **Component Tests (Vitest + Testing Library):**
   - `EstablishmentSwitcher` (Starter view vs Pro dropdown, plan limit display, switch callback).
   - `CreateEstablishmentDialog` (validation, submit, duplicate slug handling).
   - `GeneralSettingsForm` (pre-fill, field editing, submit mutation, error state).
   - `DeleteConfirmationDialog` (button disabled until exact name typed, delete execution).
3. **Storybook Stories:**
   - Stories for all 8 components covering normal, loading, error, empty, and limit-reached states.
4. **MSW Handlers:**
   - Extended handlers in `src/test/msw/handlers/establishments-handlers.ts` for `GET /:id`, `PATCH /:id`, `DELETE /:id`, `GET /:id/professionals`, `GET /:id/services`, `GET /:id/availability/business-hours`.
