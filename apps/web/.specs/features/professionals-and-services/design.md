# Professionals and Services Design

**Spec**: `.specs/features/professionals-and-services/spec.md`
**Context**: `.specs/features/professionals-and-services/context.md`
**Status**: Draft

---

## Architecture Overview

The feature unifies Professionals and Services into a single section under Settings. We will implement this using **TanStack Router nested routes** acting as tabs. This approach provides a seamless "tabbed" visual experience while retaining deep linking and browser history benefits.

```mermaid
graph TD
    A[SettingsSidebar] --> B[/settings/team-and-services]
    B --> C{Nested Routes / Tabs}
    C -->|/professionals| D[Professionals View]
    C -->|/services| E[Services View]
    
    D --> F[Professional Form Dialog]
    F --> G[Link Services & Set Overrides]
    
    E --> H[Service Form Dialog]
    H --> I[Link Professionals]
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --- | --- | --- |
| `SettingsSidebar` | `src/modules/establishments/...` | Update links to remove separate professional/services routes and point to `/settings/team-and-services/professionals` |
| UI Components (`Button`, `Card`, `Dialog`, `Input`, `Checkbox`) | `src/components/ui/` | Build the CRUD interfaces and modals |
| `useQuery`, `useMutation` | `@tanstack/react-query` | Data fetching and mutations against the Fastify backend |

### Integration Points

| System | Integration Method |
| --- | --- |
| Backend API | Create new Axios API instances: `professionalsApi` and `servicesApi` in the frontend |
| Global State | `activeEstablishmentId` from the store will be passed to API calls to fetch tenant-specific data |

---

## Components

### 1. Route: Team and Services Layout
- **Purpose**: Provides the tab navigation structure separating Professionals and Services.
- **Location**: `src/routes/_authenticated/settings/team-and-services/route.tsx`
- **Reuses**: TanStack `Outlet` and custom Tab styling (using `Link` with active states).

### 2. Route: Professionals Tab
- **Purpose**: Displays the list of professionals using a **Card format** with Create/Edit/Delete actions. Includes a Trash icon to trigger a soft-delete confirmation modal.
- **Location**: `src/routes/_authenticated/settings/team-and-services/professionals.tsx`

### 3. Route: Services Tab
- **Purpose**: Displays the list of services using a **Card format** with Create/Edit/Delete actions. Combos will have a visual badge. Includes a Trash icon to trigger a soft-delete confirmation modal.
- **Location**: `src/routes/_authenticated/settings/team-and-services/services.tsx`

### 4. ProfessionalFormModal
- **Purpose**: Dialog containing the React Hook Form to create/edit a Professional. Includes a sub-section for linking services and setting `priceOverrideCents`.
- **Location**: `src/modules/professionals/components/professional-form-modal.tsx`
- **Dependencies**: `react-hook-form`, `zod`, `servicesApi` (to load available services to link).

### 5. ServiceFormModal
- **Purpose**: Dialog to create/edit a Service (name, durationMinutes, priceCents, catalogCombo). Includes a sub-section to select which professionals perform it.
- **Location**: `src/modules/services/components/service-form-modal.tsx`
- **Dependencies**: `react-hook-form`, `zod`, `professionalsApi`.

---

## Data Models (Frontend Types)

### Professional
```typescript
interface Professional {
  id: string
  establishmentId: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  // Services linked to this professional
  services?: ProfessionalServiceLink[]
}
```

### Service
```typescript
interface Service {
  id: string
  establishmentId: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  catalogCombo: boolean
  createdAt: string
  // Professionals linked to this service
  professionals?: ProfessionalServiceLink[]
}
```

### ProfessionalServiceLink
```typescript
interface ProfessionalServiceLink {
  professionalId: string
  serviceId: string
  priceOverrideCents: number | null
}
```

---

## Tech Decisions (only non-obvious ones)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Tab Implementation | TanStack Router Nested Routes | Better UX for page reloads, deep linking, and keeps component tree shallower compared to state-based tabs. |
| M:N Linkage API | Save linkage together with the main entity | We will send the `services` array when creating/updating a Professional, and vice-versa, assuming the backend supports nested writes or a dedicated sync endpoint. |
| Price Overrides | Optional toggle per link | Based on Context decisions: a toggle prevents UI clutter when 90% of services use the base price. |
| List Visualization | Card View | Provides a cleaner UI for avatars and badges compared to a dense table layout. |
| Soft Delete | Trash icon + Modal | Simpler UX. Keeps danger actions out of the edit form. |
