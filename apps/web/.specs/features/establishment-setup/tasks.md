# Establishment Setup Tasks

**Design:** `.specs/features/establishment-setup/design.md`  
**Spec:** `.specs/features/establishment-setup/spec.md`  
**Context:** `.specs/features/establishment-setup/context.md`  
**Status:** Draft (2026-09-15)

---

## Execution Plan

### Phase 1: Foundation (Sequential)
Core state, API transport, schemas, and MSW handlers.

```
T1 ──→ T2 ──┬──→ T3
            ├──→ T4 ──→ T5
            └──→ T5
```

### Phase 2: Core Components & Stories (Parallel OK)
Independent UI components with co-located tests and stories.

```
Phase 1 complete:
  ├── T6 [P]  EstablishmentSwitcher (+ Story + Test)
  ├── T7 [P]  CreateEstablishmentDialog (+ Story + Test)
  ├── T8 [P]  GeneralSettingsForm (+ Story + Test)
  ├── T9 [P]  DangerZoneSection & DeleteConfirmationDialog (+ Story + Test)
  └── T10 [P] Read-only Components: Hours, Professionals, Services (+ Stories + Tests)
```

### Phase 3: Layouts & Navigation (Sequential)
Sidebar navigation and layout wrappers.

```
T11 ──→ T12
```

### Phase 4: Route Tree & Pages (Sequential)
Settings routes assembly and end-to-end integration tests.

```
T6, T7, T8, T9, T10, T12 ──→ T13
```

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 (Schemas) ──→ T2 (API & Query Keys) ──→ T3 (MSW Handlers)
                                         ──→ T4 (Store & Hook) ──→ T5 (Mutations)

Phase 2 (Parallel):
  T4, T5 complete:
    ├── T6 [P]  EstablishmentSwitcher
    ├── T7 [P]  CreateEstablishmentDialog
    ├── T8 [P]  GeneralSettingsForm
    ├── T9 [P]  DangerZone & DeleteConfirmationDialog
    └── T10 [P] Hours, Professionals, Services Readonly Components

Phase 3 (Sequential):
  T11 (SettingsSidebar) ──→ T12 (SettingsLayout & Dashboard Integration)

Phase 4 (Sequential):
  T6, T7, T8, T9, T10, T12 complete:
    └── T13 (Settings Route Tree & Sub-Routes Integration)
```

---

## Pre-Approval Verification

### Check 1: Task Granularity
| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Schemas & Types | 1 file + test | ✅ Granular |
| T2: API Client & Query Keys | 2 files + test | ✅ Granular |
| T3: MSW Handlers Extension | 1 file | ✅ Granular |
| T4: Store & useActiveEstablishment Hook | 2 files + test | ✅ Granular |
| T5: Query & Mutation Hooks | 3 files + test | ✅ Granular |
| T6: EstablishmentSwitcher Component | 1 component + story + test | ✅ Granular |
| T7: CreateEstablishmentDialog Component | 1 component + story + test | ✅ Granular |
| T8: GeneralSettingsForm Component | 1 component + story + test | ✅ Granular |
| T9: DangerZone & DeleteDialog | 2 components + stories + test | ✅ Granular |
| T10: Readonly Summaries (Hours/Profs/Servs) | 3 components + stories + test | ✅ Granular |
| T11: SettingsSidebar Component | 1 component + story + test | ✅ Granular |
| T12: Layouts Integration | 2 layouts + test | ✅ Granular |
| T13: Settings Route Tree & Pages | 7 route files + integration test | ✅ Granular |

### Check 2: Diagram-Definition Cross-Check
| Task | Depends On (Task Body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T2 | T2 → T4 | ✅ Match |
| T5 | T2, T4 | T2, T4 → T5 | ✅ Match |
| T6 | T4, T5 | T4, T5 → T6 | ✅ Match |
| T7 | T1, T5 | T1, T5 → T7 | ✅ Match |
| T8 | T1, T5 | T1, T5 → T8 | ✅ Match |
| T9 | T5 | T5 → T9 | ✅ Match |
| T10 | T5 | T5 → T10 | ✅ Match |
| T11 | None | None → T11 | ✅ Match |
| T12 | T6, T11 | T6, T11 → T12 | ✅ Match |
| T13 | T6, T7, T8, T9, T10, T12 | T6..T10, T12 → T13 | ✅ Match |

### Check 3: Test Co-location Validation
| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Zod Schemas | unit | unit | ✅ OK |
| T2 | API Client | unit | unit | ✅ OK |
| T3 | MSW Handlers | unit | unit | ✅ OK |
| T4 | Store & Hook | unit | unit | ✅ OK |
| T5 | Mutation Hooks | unit | unit | ✅ OK |
| T6 | UI Component | unit + story | unit | ✅ OK |
| T7 | UI Component | unit + story | unit | ✅ OK |
| T8 | UI Component | unit + story | unit | ✅ OK |
| T9 | UI Component | unit + story | unit | ✅ OK |
| T10 | UI Component | unit + story | unit | ✅ OK |
| T11 | UI Component | unit + story | unit | ✅ OK |
| T12 | Layout Components | unit | unit | ✅ OK |
| T13 | Routes & Pages | integration | integration | ✅ OK |

---

## Task Breakdown

### T1: Establishment Validation Schemas & Inferred Types

**What:** Create Zod schemas for create and update establishment payloads, summary types for read-only entities, and unit tests.  
**Where:** `src/modules/establishments/schemas/establishment.schema.ts`, `src/modules/establishments/__tests__/establishment.schema.test.ts`  
**Depends on:** None  
**Reuses:** `zod`  
**Requirement:** EST-01, EST-03, EST-NF-02  

**Done when:**
- [x] `createEstablishmentSchema` and `updateEstablishmentSchema` defined and exported
- [x] Slug validation enforces lowercase alphanumeric and hyphens
- [x] Types `CreateEstablishmentInput`, `UpdateEstablishmentInput`, `ProfessionalSummary`, `ServiceSummary`, `BusinessHoursSummary` exported
- [x] Unit tests verify valid and invalid payloads
- [x] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): add validation schemas and inferred types`

---

### T2: Establishments API Client Extension & Query Key Factory

**What:** Extend `establishmentsApi` with `getById`, `update` (PATCH), `delete`, `getProfessionals`, `getServices`, and `getBusinessHours`; create dedicated query key factory in `src/modules/establishments/query-keys.ts`.  
**Where:** `src/modules/establishments/api/establishments-api.ts`, `src/modules/establishments/query-keys.ts`, `src/modules/establishments/__tests__/establishments-api.test.ts`  
**Depends on:** T1  
**Reuses:** `#/lib/axios.ts`  
**Requirement:** EST-06, EST-NF-01, EST-NF-08  

**Done when:**
- [ ] `establishmentsApi` has methods: `list()`, `getById(id)`, `create(body)`, `update(id, body)`, `delete(id)`, `getProfessionals(id)`, `getServices(id)`, `getBusinessHours(id)`
- [ ] `establishmentKeys` factory exported with `all`, `list()`, `detail(id)`, `professionals(id)`, `services(id)`, `hours(id)`
- [ ] Unit tests cover all API client methods
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): extend api client and query keys factory`

---

### T3: MSW Mock Handlers for Establishment Endpoints

**What:** Extend MSW handlers for all establishment CRUD and sub-resource routes to support tests and Storybook.  
**Where:** `src/test/msw/handlers/establishments-handlers.ts`  
**Depends on:** T2  
**Reuses:** `msw`  
**Requirement:** EST-18, EST-NF-04  

**Done when:**
- [ ] MSW handlers respond to `GET /api/v1/establishments/:id`, `PATCH /api/v1/establishments/:id`, `DELETE /api/v1/establishments/:id`
- [ ] MSW handlers respond to `GET /api/v1/establishments/:id/professionals`, `GET /api/v1/establishments/:id/services`, `GET /api/v1/establishments/:id/availability/business-hours`
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `test(establishments): add msw handlers for establishment endpoints`

---

### T4: Active Establishment Store & `useActiveEstablishment` Hook

**What:** Create TanStack Store for `activeEstablishmentId` with `localStorage` persistence and the `useActiveEstablishment` hook with automatic fallback to the first available establishment.  
**Where:** `src/modules/establishments/stores/establishment-store.ts`, `src/modules/establishments/hooks/use-active-establishment.ts`, `src/modules/establishments/__tests__/use-active-establishment.test.ts`  
**Depends on:** T2  
**Reuses:** `@tanstack/react-store`, `sessionQueryOptions`  
**Requirement:** EST-02, EST-07, EST-NF-03  

**Done when:**
- [ ] `establishmentStore` holds and syncs `activeEstablishmentId` with `localStorage`
- [ ] `useActiveEstablishment()` returns `{ activeEstablishmentId, activeEstablishment, establishments, isLoading, setActiveEstablishmentId }`
- [ ] Falls back automatically to `establishments[0].id` when current ID is null or not found in list
- [ ] Unit tests verify store actions, persistence, and hook fallback behavior
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement active establishment store and hook`

---

### T5: Establishment Mutation and Query Hooks

**What:** Implement React Query hooks for detail queries, update mutation (`PATCH`), delete mutation (`DELETE`), create mutation (`POST`), and sub-resource queries.  
**Where:** `src/modules/establishments/hooks/use-establishment-queries.ts`, `src/modules/establishments/hooks/use-update-establishment.ts`, `src/modules/establishments/hooks/use-delete-establishment.ts`, `src/modules/establishments/hooks/use-create-establishment.ts`, `src/modules/establishments/__tests__/use-establishment-mutations.test.ts`  
**Depends on:** T2, T4  
**Reuses:** `@tanstack/react-query`, `establishmentKeys`  
**Requirement:** EST-01, EST-03, EST-05, EST-06, EST-10, EST-11, EST-12  

**Done when:**
- [ ] `useEstablishmentDetail(id)`, `useEstablishmentProfessionals(id)`, `useEstablishmentServices(id)`, `useEstablishmentHours(id)` exported
- [ ] `useUpdateEstablishment()` invalidates `establishmentKeys.detail(id)` and `establishmentKeys.list()` on success
- [ ] `useDeleteEstablishment()` invalidates `establishmentKeys.list()` on success
- [ ] `useCreateEstablishment()` invalidates `establishmentKeys.list()` and sets new establishment active
- [ ] Unit tests verify cache invalidation and mutation execution
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement react query mutation and query hooks`

---

### T6: `EstablishmentSwitcher` Component [P]

**What:** Implement header switcher dropdown with plan-aware behavior (static name on Starter, interactive dropdown on Pro/Business, plan limit progress, "+ Novo Estabelecimento" trigger).  
**Where:** `src/modules/establishments/components/establishment-switcher.tsx`, `src/modules/establishments/components/establishment-switcher.stories.tsx`, `src/modules/establishments/components/__tests__/establishment-switcher.test.tsx`  
**Depends on:** T4, T5  
**Reuses:** `Button`, `useActiveEstablishment`, `sessionQueryOptions`  
**Requirement:** EST-02, EST-09, EST-13, EST-NF-07  

**Done when:**
- [ ] Displays static establishment name for Starter plan (no chevron, no dropdown)
- [ ] Displays dropdown menu for Pro/Business plans with establishment list, checkmark for active, and count ("N de M estabelecimentos")
- [ ] Shows limit warning banner and disables "+ Novo" button when plan limit is reached
- [ ] Unit tests verify Starter vs Pro behavior and context switching
- [ ] Storybook stories cover Starter, Pro with 1/3, Pro at limit (3/3), and loading state
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement EstablishmentSwitcher component and stories`

---

### T7: `CreateEstablishmentDialog` Component [P]

**What:** Implement dialog modal for creating a new establishment post-onboarding with form validation and duplicate slug handling.  
**Where:** `src/modules/establishments/components/create-establishment-dialog.tsx`, `src/modules/establishments/components/create-establishment-dialog.stories.tsx`, `src/modules/establishments/components/__tests__/create-establishment-dialog.test.tsx`  
**Depends on:** T1, T5  
**Reuses:** `Dialog`, `Input`, `Button`, `useForm`, `createEstablishmentSchema`  
**Requirement:** EST-03, EST-14  

**Done when:**
- [ ] Dialog opens/closes via controlled `open` prop
- [ ] Form contains: name, email (prefilled), timezone, phone, address, slug, operationalEmail
- [ ] Submits valid data via `useCreateEstablishment`, closes dialog, and sets new establishment as active
- [ ] Displays server error in dialog without closing if submission fails
- [ ] Unit tests verify form validation and submit flow
- [ ] Storybook stories cover open state, loading, and validation error state
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement CreateEstablishmentDialog component and stories`

---

### T8: `GeneralSettingsForm` Component [P]

**What:** Implement general settings form in TanStack Form + Zod for editing name, email, phone, address, timezone, slug (with live URL preview), minAdvanceMinutes, operationalEmail, and isActive toggle (with warning).  
**Where:** `src/modules/establishments/components/general-settings-form.tsx`, `src/modules/establishments/components/general-settings-form.stories.tsx`, `src/modules/establishments/components/__tests__/general-settings-form.test.tsx`  
**Depends on:** T1, T5  
**Reuses:** `Input`, `Button`, `Card`, `Toast`, `updateEstablishmentSchema`, `useUpdateEstablishment`  
**Requirement:** EST-01, EST-17, EST-NF-06  

**Done when:**
- [ ] Pre-fills all fields from active establishment data
- [ ] Displays live URL preview below slug input (`agenda.xpto.com/:slug`)
- [ ] Displays warning when `isActive` toggle is switched off
- [ ] Submits changed fields via `useUpdateEstablishment` with toast feedback
- [ ] Unit tests verify field editing, validation errors, and save action
- [ ] Storybook stories cover default, dirty, and submitting states
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement GeneralSettingsForm component and stories`

---

### T9: `DangerZoneSection` & `DeleteConfirmationDialog` Components [P]

**What:** Implement danger zone section card and double-confirmation dialog requiring user to type the establishment name to delete (soft-delete).  
**Where:** `src/modules/establishments/components/danger-zone-section.tsx`, `src/modules/establishments/components/delete-confirmation-dialog.tsx`, `src/modules/establishments/components/delete-confirmation-dialog.stories.tsx`, `src/modules/establishments/components/__tests__/delete-confirmation-dialog.test.tsx`  
**Depends on:** T5  
**Reuses:** `Dialog`, `Input`, `Button`, `Card`, `useDeleteEstablishment`  
**Requirement:** EST-05, EST-15  

**Done when:**
- [ ] Danger zone card displays warning about irreversible action
- [ ] Confirmation dialog requires typing establishment name exactly; button disabled until match
- [ ] Shows special warning if it is the owner's only establishment
- [ ] Calls `useDeleteEstablishment` upon confirmation
- [ ] Unit tests verify name matching validation and delete trigger
- [ ] Storybook stories cover danger card, dialog empty input, dialog matched input, and single-establishment warning
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement DangerZoneSection and DeleteConfirmationDialog`

---

### T10: Read-only Summaries (Hours, Professionals, Services) [P]

**What:** Implement read-only summary components for business hours, professionals list, and services list (with BRL currency formatting and CTA links to future modules).  
**Where:** `src/modules/establishments/components/hours-readonly-summary.tsx`, `src/modules/establishments/components/professionals-readonly-list.tsx`, `src/modules/establishments/components/services-readonly-list.tsx`, `.stories.tsx`, `src/modules/establishments/components/__tests__/readonly-lists.test.tsx`  
**Depends on:** T5  
**Reuses:** `Card`, `Button`, `useEstablishmentHours`, `useEstablishmentProfessionals`, `useEstablishmentServices`  
**Requirement:** EST-10, EST-11, EST-12  

**Done when:**
- [ ] `HoursReadonlySummary` displays weekday schedule or empty state with CTA
- [ ] `ProfessionalsReadonlyList` displays linked professionals or empty state with CTA
- [ ] `ServicesReadonlyList` displays service duration & price formatted in BRL (`R$ XX,XX`) or empty state with CTA
- [ ] Unit tests verify list rendering and empty states
- [ ] Storybook stories cover populated and empty states for each component
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement readonly summary components for hours, profs, and services`

---

### T11: `SettingsSidebar` Component

**What:** Implement GitHub-style navigation sidebar with active route highlighting, destructive styling for "Zona de Perigo", and responsive mobile layout.  
**Where:** `src/modules/establishments/components/settings-sidebar.tsx`, `src/modules/establishments/components/settings-sidebar.stories.tsx`, `src/modules/establishments/components/__tests__/settings-sidebar.test.tsx`  
**Depends on:** None  
**Reuses:** `Link` from `@tanstack/react-router`, `cn`  
**Requirement:** EST-04, EST-16  

**Done when:**
- [ ] Renders links: Geral, Horários, Profissionais, Serviços, Zona de Perigo
- [ ] Highlights active sub-route based on current router pathname
- [ ] Applies destructive/red text styling to "Zona de Perigo"
- [ ] Responsive styling (collapses or transforms into horizontal tabs on mobile)
- [ ] Unit tests verify navigation link rendering and active state
- [ ] Storybook stories cover desktop and mobile variants
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement SettingsSidebar component and stories`

---

### T12: `SettingsLayout` & `DashboardLayout` Header Integration

**What:** Create `SettingsLayout` container (sidebar + content panel) and update `dashboard.tsx` header to include `EstablishmentSwitcher` and link to `/settings`.  
**Where:** `src/components/layouts/settings-layout.tsx`, `src/routes/_authenticated/dashboard.tsx`, `src/components/layouts/__tests__/settings-layout.test.tsx`  
**Depends on:** T6, T11  
**Reuses:** `SettingsSidebar`, `EstablishmentSwitcher`  
**Requirement:** EST-02, EST-04, EST-08  

**Done when:**
- [ ] `SettingsLayout` renders two-column container with sidebar on left and outlet/children on right
- [ ] `dashboard.tsx` header integrates `EstablishmentSwitcher` alongside user greeting and sign out
- [ ] Unit tests verify layout structure and switcher presence
- [ ] Gate check passes: `pnpm test`

**Tests:** unit  
**Gate:** quick (`pnpm test`)  
**Commit:** `feat(establishments): implement SettingsLayout and update dashboard header`

---

### T13: Settings Route Tree & Integration Verification

**What:** Create TanStack Router sub-routes under `src/routes/_authenticated/settings/`, enforce onboarding guards, connect all components, and run full integration tests.  
**Where:** `src/routes/_authenticated/settings/route.tsx`, `src/routes/_authenticated/settings/index.tsx`, `src/routes/_authenticated/settings/general.tsx`, `src/routes/_authenticated/settings/hours.tsx`, `src/routes/_authenticated/settings/professionals.tsx`, `src/routes/_authenticated/settings/services.tsx`, `src/routes/_authenticated/settings/danger.tsx`, `src/routes/__tests__/settings-routes.test.tsx`  
**Depends on:** T6, T7, T8, T9, T10, T12  
**Reuses:** `ensureOnboardingComplete`, `SettingsLayout`, all establishment components  
**Requirement:** EST-01, EST-04, EST-05, EST-08, EST-10, EST-11, EST-12, EST-NF-05  

**Done when:**
- [ ] `/settings` automatically redirects to `/settings/general`
- [ ] Sub-routes `/settings/general`, `/settings/hours`, `/settings/professionals`, `/settings/services`, `/settings/danger` render respective components
- [ ] Context switching updates all settings sub-pages in real time
- [ ] Deleting active establishment redirects to next establishment or `/onboarding/business`
- [ ] Full test suite passes: `pnpm test` and `pnpm lint`
- [ ] Gate check passes: `pnpm test`

**Tests:** integration  
**Gate:** full (`pnpm test && pnpm lint`)  
**Commit:** `feat(establishments): implement settings route tree and sub-pages`
