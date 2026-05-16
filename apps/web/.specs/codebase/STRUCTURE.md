# Project Structure

**Root:** `apps/web/`

## Directory Tree

```
web/
├── .storybook/         # Storybook configuration
├── src/
│   ├── components/
│   │   ├── storybook/  # Initial component samples (temporary?)
│   │   ├── ui/         # Base UI components
│   │   └── shared/     # Business shared components
│   ├── integrations/
│   │   └── tanstack-query/ # QueryClient & Providers
│   ├── modules/        # Feature modules (auth, dashboard, etc.)
│   ├── routes/         # TanStack Router route definitions
│   ├── lib/            # Singletons (Axios, etc.)
│   ├── hooks/          # Global hooks
│   ├── router.tsx      # Main router entry point
│   ├── styles.css      # Global styles & Tailwind import
│   └── main.tsx        # App entry point (if not using Start default)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Module Organization

### src/components/storybook/

**Purpose:** Contains initial UI components with Storybook integration.
**Key files:** `button.tsx`, `input.tsx`, `dialog.tsx`.

### src/routes/

**Purpose:** TanStack Router routes.
**Key files:** `__root.tsx`, `index.tsx`.

## Where Things Live

**UI Components:** `src/components/ui/`
**Business Components:** `src/components/shared/` or `src/modules/*/components/`
**Routing:** `src/routes/` and `src/router.tsx`
**Global State:** `src/stores/` (Zustand)
**Server State:** `src/integrations/tanstack-query/`
