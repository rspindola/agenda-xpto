# Concerns

## Technical Debt

### Component Location

**File:** `src/components/storybook/`
**Concern:** UI components are currently in a "storybook" folder.
**Impact:** Unclear where production components should live.
**Fix:** Move base UI components to `src/components/ui/` and business components to `src/components/shared/` as per `frontend.md`.

### Styling Consistency

**File:** `src/components/storybook/button.tsx`
**Concern:** The `cn()` helper (Tailwind Merge + CLSX) is not being used despite being mandatory in `frontend.md`.
**Impact:** Difficult class management and potential conflicts.
**Fix:** Implement and use a standard `cn()` utility.

### TanStack Query Configuration

**File:** `src/integrations/tanstack-query/root-provider.tsx`
**Concern:** `QueryClient` is initialized with no default options.
**Impact:** Default `staleTime` of 0 might lead to excessive re-fetching.
**Fix:** Define reasonable default options for the project.

## Scaling & Complexity

### TanStack Start Maturity

**Concern:** TanStack Start is a rapidly evolving framework.
**Impact:** Potential breaking changes or missing documentation for complex SSR scenarios.
**Fix:** Stay updated with TanStack releases and follow their latest patterns.

## Testing Gaps

### Missing Tests

**Concern:** No existing tests found for the initial components in `src/components/storybook/`.
**Impact:** Regression risk during the upcoming development phase.
**Fix:** Add Vitest + Testing Library tests for all base components.
