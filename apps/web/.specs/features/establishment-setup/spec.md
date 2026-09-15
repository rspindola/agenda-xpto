# Establishment Setup Specification — Agenda XPTO Web

## Problem Statement

After onboarding, owners have a single establishment with basic data (name, email, timezone). They need a way to view and edit full establishment settings, create additional establishments (Pro/Business plans), switch between them, and delete establishments they no longer need. The backend CRUD is complete; the frontend has only `list` and `create` wrappers and no settings UI.

This spec defines the **establishment management frontend**: settings page, multi-establishment switcher, create dialog, soft delete — scoped to establishment entity only (professionals and services are separate features).

## Goals

- [ ] Owner can **view and edit** all establishment fields (name, email, phone, address, timezone, slug, minAdvanceMinutes, operationalEmail, isActive) in a settings page.
- [ ] Owner on **Pro/Business** plans can **create additional establishments** via a dialog, up to the plan limit.
- [ ] Owner on **Pro/Business** plans can **switch** between establishments using a header dropdown; the active context updates globally.
- [ ] Owner on **Starter** plan sees only the establishment name in the header (no dropdown, no switcher).
- [ ] Owner can **delete** (soft delete) an establishment with double confirmation (type establishment name).
- [ ] Settings page uses a **sidebar navigation** pattern (estilo GitHub) with sections: Geral, Horários, Profissionais (read-only), Serviços (read-only), Zona de Perigo.
- [ ] Active establishment context is managed via **TanStack Store** and propagated to all queries depending on `establishmentId`.

## Out of Scope

Explicitly excluded for this feature (documented to prevent scope creep).

| Feature | Reason |
| ------- | ------ |
| Professionals CRUD (create, edit, delete) | Separate feature; settings shows read-only list with link |
| Services CRUD (create, edit, delete) | Separate feature; settings shows read-only list with link |
| Business hours edit in settings | Covered by availability feature; settings shows read-only summary |
| Upgrade/downgrade plan flows | Plans feature; this feature only shows limit feedback |
| Inline upgrade button in switcher | Plans feature integration; deferred |
| Establishment logo/image upload | No upload API in backend |
| Re-open onboarding wizard from settings | AUTH-19 (pending, separate) |
| Dashboard overview metrics | Dashboard feature (separate) |

---

## Technical Context (Source of Truth)

### Backend (implemented)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/establishments` | List all owner's establishments |
| `POST` | `/api/v1/establishments` | Create establishment |
| `GET` | `/api/v1/establishments/:id` | Get single establishment by ID |
| `PUT` | `/api/v1/establishments/:id` | Update establishment (full replace) |
| `PATCH` | `/api/v1/establishments/:id` | Partial update establishment |
| `DELETE` | `/api/v1/establishments/:id` | Soft delete (`deleted_at` set) |
| `GET` | `/api/v1/establishments/:id/professionals` | List professionals (for read-only tab) |
| `GET` | `/api/v1/establishments/:id/services` | List services (for read-only tab) |

**Multi-tenancy rule:** Backend validates `establishmentId` ownership against the authenticated `userId`. Never accept `establishmentId` from request body on writes.

**Soft delete:** Sets `deleted_at` timestamp. Soft-deleted establishments are excluded from `GET /api/v1/establishments` (list).

### Plan limits (from AGENTS.md)

| Plan | Max Establishments |
| ---- | ------------------ |
| Starter | 1 |
| Pro | up to 3 |
| Business | up to 10 |

**Note:** Plan info comes from `GET /api/v1/me` or a dedicated plans endpoint. For MVP, the frontend can infer plan limits from session data or a hardcoded map. The exact API shape should be confirmed during Design.

### Existing frontend code

| File | What exists |
| ---- | ----------- |
| `establishments-api.ts` | `list()` and `create()` only — needs `getById`, `update`, `delete` |
| `establishmentKeys` | `all` and `list()` — needs `detail(id)` |
| `establishmentsQueryOptions` | List query — needs detail query |
| `dashboard.tsx` | Stub with header (sign-out button) — switcher will be added here |
| `BusinessStepForm` | Onboarding step 1 form — reusable pattern for create dialog |
| TanStack Store | Decided as sole UI state manager (STATE.md) — `activeEstablishmentId` will live here |

### Route map (target)

| Path | Layout | Access |
| ---- | ------ | ------ |
| `/settings` | `DashboardLayout` + `SettingsSidebar` | Redirect → `/settings/general` |
| `/settings/general` | `SettingsLayout` | Protected + onboarding complete |
| `/settings/hours` | `SettingsLayout` | Protected + onboarding complete |
| `/settings/professionals` | `SettingsLayout` | Protected + onboarding complete |
| `/settings/services` | `SettingsLayout` | Protected + onboarding complete |
| `/settings/danger` | `SettingsLayout` | Protected + onboarding complete |

### Module layout (target)

```
src/modules/establishments/
├── api/
│   ├── establishments-api.ts     # Extended: getById, update, delete
│   └── __tests__/
├── components/
│   ├── establishment-switcher.tsx       # Header dropdown
│   ├── create-establishment-dialog.tsx  # Modal for new establishment
│   ├── general-settings-form.tsx        # Edit form
│   ├── danger-zone-section.tsx          # Delete with confirmation
│   ├── delete-confirmation-dialog.tsx   # Type name to confirm
│   ├── professionals-readonly-list.tsx  # Read-only list + link
│   └── services-readonly-list.tsx       # Read-only list + link
├── hooks/
│   ├── use-active-establishment.ts      # TanStack Store accessor
│   ├── use-update-establishment.ts      # Mutation
│   └── use-delete-establishment.ts      # Mutation
├── schemas/
│   └── establishment.schema.ts          # Zod schemas for edit form
├── stores/
│   └── establishment-store.ts           # activeEstablishmentId (TanStack Store)
├── query-keys.ts                        # Moved from auth module; extended
└── __tests__/

src/routes/_authenticated/
├── settings/
│   ├── route.tsx               # SettingsLayout + sidebar nav
│   ├── general.tsx             # General settings page
│   ├── hours.tsx               # Hours read-only summary
│   ├── professionals.tsx       # Professionals read-only list
│   ├── services.tsx            # Services read-only list
│   └── danger.tsx              # Danger zone page

src/components/layouts/
├── dashboard-layout.tsx        # Header with switcher + main content area
└── settings-layout.tsx         # Sidebar nav + content panel
```

---

## User Stories

### P1: View and edit establishment general settings — MVP

**User Story**: As an establishment owner (`P1`), I want to view and edit my establishment's information (name, email, phone, address, timezone, slug) so that clients see accurate business details.

**Why P1**: Core management task; owners need to update contact info and business details post-onboarding.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings/general` THEN the system SHALL display a form pre-filled with the active establishment's current data from `GET /api/v1/establishments/:id`.
2. WHEN the owner edits fields and clicks "Salvar" THEN the system SHALL call `PATCH /api/v1/establishments/:id` with the changed fields and show a success toast.
3. WHEN the save fails (API error) THEN the system SHALL show an error message and preserve the form state.
4. WHEN the owner changes the `slug` field THEN the system SHALL display a preview of the public booking URL (e.g., `agenda.xpto.com/slug-value`).
5. WHEN the owner toggles `isActive` off THEN the system SHALL show a warning: "Desativar o estabelecimento oculta a página pública de agendamentos."
6. WHEN fields fail Zod validation (e.g., empty name, invalid email) THEN the system SHALL show inline errors and block submit.

**Independent Test**: Navigate to `/settings/general` → edit name → save → reload → confirm name persisted.

---

### P1: Establishment context switcher (Pro/Business) — MVP

**User Story**: As a Pro/Business owner (`P1`), I want to switch between my establishments from the header so that I can manage multiple businesses without navigating away.

**Why P1**: Multi-tenancy is a core value prop for Pro/Business plans; without a switcher, owners with >1 establishment can't access them.

**Acceptance Criteria**:

1. WHEN a Pro/Business owner has multiple establishments THEN the system SHALL display a dropdown in the header showing the active establishment's name with a chevron icon.
2. WHEN the owner clicks the dropdown THEN the system SHALL list all non-deleted establishments with the active one highlighted.
3. WHEN the owner selects a different establishment THEN the system SHALL update the `activeEstablishmentId` in the global store and invalidate all queries scoped to `establishmentId`.
4. WHEN the owner is on a page scoped to an establishment (e.g., `/settings`) and switches context THEN the page SHALL re-render with the new establishment's data.
5. WHEN a Starter owner has exactly 1 establishment THEN the system SHALL display only the establishment name in the header — no dropdown, no chevron, no interaction.
6. WHEN the page loads for the first time THEN the system SHALL set `activeEstablishmentId` to the first establishment from the list query.

**Independent Test**: Owner with 2 establishments → open dropdown → select other → settings page shows different establishment data.

---

### P1: Create additional establishment (Pro/Business) — MVP

**User Story**: As a Pro/Business owner (`P1`), I want to create a new establishment from the switcher dropdown so that I can manage multiple locations.

**Why P1**: Without creation, multi-establishment is incomplete.

**Acceptance Criteria**:

1. WHEN a Pro/Business owner opens the switcher dropdown THEN the system SHALL show a "+ Novo Estabelecimento" button at the bottom.
2. WHEN the owner clicks "+ Novo Estabelecimento" THEN the system SHALL open a dialog with a form: name (required), email (required, prefilled with owner email), timezone (required), phone (optional), address (optional), slug (optional), operationalEmail (optional).
3. WHEN the owner submits valid data THEN the system SHALL call `POST /api/v1/establishments`, invalidate the establishments list query, set the new establishment as active, and close the dialog.
4. WHEN the owner has reached the plan limit THEN the system SHALL disable the "+ Novo Estabelecimento" button and show a tooltip/alert: "Seu plano permite até N estabelecimentos."
5. WHEN creation fails (API error, e.g., duplicate slug) THEN the system SHALL show the error in the dialog without closing it.
6. WHEN a Starter owner opens the header (no dropdown) THEN the system SHALL NOT display any create button.

**Independent Test**: Pro owner with 1 establishment → click "+ Novo" → fill form → submit → new establishment appears in switcher.

---

### P1: Settings sidebar navigation — MVP

**User Story**: As an owner (`P1`), I want a structured settings page with sidebar navigation so that I can find and manage different aspects of my establishment.

**Why P1**: The settings page is the entry point for all establishment configuration.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings` THEN the system SHALL redirect to `/settings/general`.
2. WHEN the owner is on any `/settings/*` page THEN the system SHALL display a left sidebar with navigation items: Geral, Horários de Funcionamento, Profissionais, Serviços, Zona de Perigo.
3. WHEN the owner clicks a sidebar item THEN the system SHALL navigate to the corresponding sub-route and highlight the active item.
4. WHEN the sidebar renders on mobile THEN the system SHALL adapt to a responsive pattern (e.g., horizontal tabs or collapsible menu).
5. WHEN "Zona de Perigo" is clicked THEN the item SHALL be visually distinct (red/destructive color).

**Independent Test**: Navigate to `/settings` → redirected to `/settings/general` → click sidebar items → content changes per section.

---

### P1: Delete establishment (soft delete) — MVP

**User Story**: As an owner (`P1`), I want to delete an establishment I no longer need, with a safety confirmation, so that I don't accidentally lose data.

**Why P1**: Owners who close a location need a way to remove it; critical for data hygiene and plan limit management.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings/danger` THEN the system SHALL show a "Excluir Estabelecimento" section with a warning explaining the action is irreversible.
2. WHEN the owner clicks "Excluir" THEN the system SHALL open a confirmation dialog requiring them to type the establishment name exactly.
3. WHEN the typed name matches the establishment name (case-insensitive) THEN the system SHALL enable the "Confirmar Exclusão" button.
4. WHEN the owner confirms THEN the system SHALL call `DELETE /api/v1/establishments/:id`, invalidate the list query, and:
   - If other establishments remain: switch to the next available establishment and redirect to `/dashboard`.
   - If no establishments remain: redirect to `/onboarding/business` (triggers onboarding guard).
5. WHEN the typed name does not match THEN the "Confirmar Exclusão" button SHALL remain disabled.
6. WHEN the owner has only 1 establishment THEN the system SHALL show an additional warning: "Este é seu único estabelecimento. Ao excluí-lo, você será redirecionado ao processo de configuração inicial."

**Independent Test**: Go to danger zone → type wrong name → button disabled → type correct name → delete → redirected appropriately.

---

### P2: Plan limit feedback in switcher — Should have

**User Story**: As a Pro/Business owner (`P2`), I want to see how many establishments I can still create so that I know when to upgrade.

**Why P2**: Improves UX but doesn't block core functionality.

**Acceptance Criteria**:

1. WHEN the owner opens the switcher dropdown and has N of M allowed establishments THEN the system SHALL display a subtle indicator (e.g., "2 de 3 estabelecimentos").
2. WHEN the owner is at the plan limit THEN the system SHALL show an alert banner: "Seu plano permite até N estabelecimentos. Faça upgrade para adicionar mais."
3. WHEN the owner is 1 away from the limit (N-1 of N) THEN the system SHALL show a softer warning (e.g., "Você pode criar mais 1 estabelecimento").

**Independent Test**: Mock 2 of 3 establishments for Pro plan → dropdown shows "2 de 3" count.

---

### P2: Settings — Hours summary (read-only) — Should have

**User Story**: As an owner (`P2`), I want to see a summary of my establishment's business hours in settings so that I know what's configured without navigating to the availability module.

**Why P2**: Convenience; full hours editing belongs to the availability feature.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings/hours` THEN the system SHALL display a read-only summary of business hours per weekday (from `GET /api/v1/establishments/:id/availability/business-hours` or equivalent).
2. WHEN no hours are configured THEN the system SHALL show an empty state: "Nenhum horário configurado." with a CTA button linking to the availability module (future).
3. WHEN hours exist THEN the system SHALL display each weekday with open/close times and break info.

**Independent Test**: Navigate to `/settings/hours` → see weekday schedule or empty state.

---

### P2: Settings — Professionals read-only list — Should have

**User Story**: As an owner (`P2`), I want to see which professionals are linked to my establishment in settings so I have a quick overview.

**Why P2**: Read-only convenience; CRUD is a separate feature.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings/professionals` THEN the system SHALL display a list of professionals from `GET /api/v1/establishments/:id/professionals`.
2. WHEN no professionals exist THEN the system SHALL show an empty state: "Nenhum profissional cadastrado." with a CTA to the professionals module (future).
3. WHEN professionals exist THEN the system SHALL show name, email, and phone for each.

**Independent Test**: Navigate to `/settings/professionals` → see list or empty state.

---

### P2: Settings — Services read-only list — Should have

**User Story**: As an owner (`P2`), I want to see which services my establishment offers in settings so I have a quick overview.

**Why P2**: Read-only convenience; CRUD is a separate feature.

**Acceptance Criteria**:

1. WHEN the owner navigates to `/settings/services` THEN the system SHALL display a list of services from `GET /api/v1/establishments/:id/services`.
2. WHEN no services exist THEN the system SHALL show an empty state: "Nenhum serviço cadastrado." with a CTA to the services module (future).
3. WHEN services exist THEN the system SHALL show name, duration, and price (formatted from cents to BRL).

**Independent Test**: Navigate to `/settings/services` → see list or empty state.

---

### P3: DashboardLayout with sidebar — Nice to have

**User Story**: As an owner (`P3`), I want a proper dashboard layout with a collapsible sidebar so that navigation to settings, agenda, and other sections is consistent.

**Why P3**: The current dashboard is a stub; a full layout improves UX but is not strictly required for establishment setup. Can be minimal.

**Deferred to** dashboard feature if too large; a minimal version with "Settings" link in header may suffice for MVP.

---

## UI & Components

### Reuse from `src/components/ui/`

| Component | Usage |
| --------- | ----- |
| `Button` | Actions, save, delete, dropdown trigger |
| `Input` | Form fields in general settings and create dialog |
| `Card` | Settings sections, establishment cards in dropdown |
| `Toast` | Success/error feedback on save/delete |
| `Dialog` | Create establishment and delete confirmation modals |

### New components (each requires Storybook story)

| Component | Location | Notes |
| --------- | -------- | ----- |
| `EstablishmentSwitcher` | `src/modules/establishments/components/` | Header dropdown with plan-aware logic |
| `CreateEstablishmentDialog` | `src/modules/establishments/components/` | Modal form extending onboarding pattern |
| `GeneralSettingsForm` | `src/modules/establishments/components/` | TanStack Form + Zod for establishment fields |
| `DangerZoneSection` | `src/modules/establishments/components/` | Warning + delete button |
| `DeleteConfirmationDialog` | `src/modules/establishments/components/` | Type name to confirm |
| `SettingsSidebar` | `src/components/layouts/` or module | GitHub-style nav |
| `ProfessionalsReadonlyList` | `src/modules/establishments/components/` | Read-only list |
| `ServicesReadonlyList` | `src/modules/establishments/components/` | Read-only list |

**Copy language:** UI strings in **Brazilian Portuguese**; code identifiers in **English**.

### SettingsLayout

- Two-column layout: sidebar (left, ~240px) + content panel (right, fluid)
- Responsive: sidebar collapses on mobile
- Sidebar items: icon + label, active highlight, "Zona de Perigo" in red/destructive

---

## Edge Cases

- WHEN API returns `403` on update/delete (establishment not owned by user) THEN the system SHALL show a generic error and redirect to `/dashboard`.
- WHEN network fails during save THEN the system SHALL show a retry-friendly message; form state preserved.
- WHEN the owner double-submits a form THEN the system SHALL disable the submit button while pending.
- WHEN the establishment is deleted by another session THEN the system SHALL handle the 404 on next query and redirect to `/dashboard` or `/onboarding`.
- WHEN the owner deletes the active establishment THEN the system SHALL switch `activeEstablishmentId` to the next available before redirecting.
- WHEN the switcher loads and `activeEstablishmentId` references a deleted establishment THEN the system SHALL fall back to the first available establishment.
- WHEN `establishments.length === 0` after deletion THEN the system SHALL redirect to `/onboarding/business` (existing guard handles this).
- WHEN the create dialog is submitted with a duplicate slug THEN the system SHALL show the API error without closing the dialog.
- WHEN the owner edits slug to empty THEN the backend auto-generates from name — the form SHALL allow empty slug.
- WHEN the owner resizes browser on settings page THEN the sidebar SHALL adapt responsively.

---

## Non-Functional Requirements

| ID | Requirement |
| -- | ----------- |
| EST-NF-01 | All API calls use Axios singleton with `withCredentials: true` |
| EST-NF-02 | Zod schemas align with backend establishment schema constraints |
| EST-NF-03 | Active establishment state persists across page navigation (TanStack Store) |
| EST-NF-04 | MSW handlers for all establishment endpoints in tests and Storybook |
| EST-NF-05 | Settings route guards run before rendering (require session + onboarding complete) |
| EST-NF-06 | Accessible forms: labels, `aria-invalid`, focus on first error |
| EST-NF-07 | Plan limit logic is centralized (not duplicated across switcher and create dialog) |
| EST-NF-08 | Query invalidation after create/update/delete is immediate (no stale data in switcher) |

---

## Requirement Traceability

| Requirement ID | Story | Task | Phase | Status |
| -------------- | ----- | ---- | ----- | ------ |
| EST-01 | P1: View and edit general settings | T1, T5, T8, T13 | Execute | Done |
| EST-02 | P1: Establishment context switcher | T4, T6, T12 | Execute | Done |
| EST-03 | P1: Create additional establishment | T1, T5, T7 | Execute | Done |
| EST-04 | P1: Settings sidebar navigation | T11, T12, T13 | Execute | Done |
| EST-05 | P1: Delete establishment (soft delete) | T5, T9, T13 | Execute | Done |
| EST-06 | P1: Establishments API extension (getById, update, delete) | T2, T5 | Execute | Done |
| EST-07 | P1: Active establishment store (TanStack Store) | T4 | Execute | Done |
| EST-08 | P1: Settings route tree + guards | T12, T13 | Execute | Done |
| EST-09 | P2: Plan limit feedback in switcher | T6 | Execute | Done |
| EST-10 | P2: Settings — Hours summary (read-only) | T5, T10, T13 | Execute | Done |
| EST-11 | P2: Settings — Professionals list (read-only) | T5, T10, T13 | Execute | Done |
| EST-12 | P2: Settings — Services list (read-only) | T5, T10, T13 | Execute | Done |
| EST-13 | UI: EstablishmentSwitcher (+ story) | T6 | Execute | Done |
| EST-14 | UI: CreateEstablishmentDialog (+ story) | T7 | Execute | Done |
| EST-15 | UI: DeleteConfirmationDialog (+ story) | T9 | Execute | Done |
| EST-16 | UI: SettingsSidebar (+ story) | T11 | Execute | Done |
| EST-17 | UI: GeneralSettingsForm (+ story) | T8 | Execute | Done |
| EST-18 | P1: MSW handlers for establishment CRUD | T3 | Execute | Done |
| EST-19 | P3: DashboardLayout with sidebar | — | Deferred | Deferred |

**Coverage:** 19 total, 18 mapped to tasks, 1 deferred (0 unmapped ✅)

---

## Success Criteria

- [x] Owner can edit all establishment fields in `/settings/general` and see changes persist after reload.
- [x] Pro/Business owner can create a second establishment via dialog and switch to it immediately.
- [x] Starter owner sees only the establishment name in the header — no dropdown interaction.
- [x] Owner can delete an establishment with double confirmation; context switches to next or triggers onboarding.
- [x] Settings sidebar navigation works across all sections (general, hours, professionals, services, danger).
- [x] Plan limit is enforced in the UI: button disabled + message when at limit.
- [x] `pnpm lint && pnpm test` pass for new establishment module tests and Storybook stories.

---

## References

| Document | Path |
| -------- | ---- |
| Roadmap (item #3) | `.specs/project/ROADMAP.md` |
| Context (discuss decisions) | `.specs/features/establishment-setup/context.md` |
| Auth spec (onboarding creates first establishment) | `.specs/features/auth/spec.md` |
| Existing establishments API | `src/modules/establishments/api/establishments-api.ts` |
| Existing MSW handlers | `src/test/msw/handlers/establishments-handlers.ts` |
| Onboarding business form (reuse pattern) | `src/modules/onboarding/components/business-step-form.tsx` |
| Dashboard stub (switcher target) | `src/routes/_authenticated/dashboard.tsx` |
| State decisions | `.specs/project/STATE.md` |
| Backend user stories | `docs/flow/03-establishment-setup/USER_STORIES.md` |

---

## Resolved Decisions

Captured in `context.md` (2026-09-15). Summary:

| Topic | Decision |
| ----- | -------- |
| Escopo | CRUD de estabelecimentos + switcher + settings (sem profissionais/serviços CRUD) |
| Switcher | Dropdown no header; oculto no Starter; visível no Pro/Business |
| Lista | Sem página separada — o dropdown é a lista |
| Criação pós-onboarding | Dialog/modal com formulário estendido do onboarding |
| Settings | Sidebar lateral estilo GitHub (`/settings/*`) |
| Profissionais/Serviços tab | Read-only list + link para futuras features |
| Limites do plano | Alert/badge + botão desabilitado no limite |
| Exclusão | Confirmação dupla (digitar nome), soft delete |
| Troca de contexto | TanStack Store + invalidação de queries (agent discretion) |
| Campos do formulário | Todos os editáveis do `EstablishmentPublic` (agent discretion) |

---

*Spec status: **Approved** (2026-09-15). Design status: **Approved** ([`design.md`](file:///Users/renatocastro/workspace/agenda-xpto/apps/web/.specs/features/establishment-setup/design.md)). Tasks status: **Completed** ([`tasks.md`](file:///Users/renatocastro/workspace/agenda-xpto/apps/web/.specs/features/establishment-setup/tasks.md)). Feature status: **Validated**.*
