# External Integrations

## Server State Management

**Service:** TanStack Query
**Purpose:** Handle async data fetching, caching, and synchronization.
**Implementation:** `src/integrations/tanstack-query/`
**Configuration:** `root-provider.tsx` exports `getContext` for router integration.

## Monitoring

**Service:** Sentry
**Purpose:** Error tracking and performance monitoring.
**Implementation:** `instrument.server.mjs` (present in project root).
**Configuration:** `VITE_SENTRY_DSN` env var.

## UI Components (Calendar)

**Service:** FullCalendar
**Purpose:** Provide complex calendar and scheduling interfaces (DayGrid, TimeGrid).
**Implementation:** `src/modules/availability/` or `src/modules/appointments/` (planned).
**Configuration:** React wrapper with Tailwind CSS v4 styling.

## HTTP Client

**Service:** Axios
**Purpose:** Handle API requests to the backend.
**Implementation:** `src/lib/axios.ts` (planned singleton).
**Configuration:** Interceptors for auth and error handling.

## Component Documentation

**Service:** Storybook
**Purpose:** UI component development and documentation.
**Location:** `.storybook/`, `src/**/*.stories.tsx`
