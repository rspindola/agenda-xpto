# Feature Spec: Design System (Agenda XPTO)

Define foundational design tokens, base UI components, and styling patterns for the Agenda XPTO web application.

## 1. Vision & Goals

- **Professionalism**: Clean, functional interface for beauty establishment owners.
- **Consistency**: Centralized theme tokens and reusable UI components.
- **Productivity**: High-quality DX with Tailwind v4, CVA, and Storybook.
- **Accessibility**: WCAG 2.1 compliance (aria roles, keyboard nav).

## 2. Requirements

### 2.1 Design Tokens (Tailwind v4 @theme)

- [DS-001] **Colors**: Primary (Brand), Secondary, Accents, Semantic (Success, Error, Warning, Info), Neutrals (Slate/Zinc).
- [DS-002] **Typography**: Google Font (Inter/Outfit), fluid sizing, readable hierarchy.
- [DS-003] **Spacing & Layout**: Standardized scale (rem based).
- [DS-004] **Shadows & Borders**: Subtle elevation, consistent radius (md/lg).

### 2.2 Base UI Components (src/components/ui/)

- [DS-101] **Button**: Variants (Primary, Secondary, Ghost, Outline, Danger), Sizes (Sm, Md, Lg), Loading state.
- [DS-102] **Input**: Text, Password, Email, with Label and Error states.
- [DS-103] **Dialog/Modal**: Responsive, accessible, portal-based.
- [DS-104] **RadioGroup**: Custom styles, accessible.
- [DS-105] **Slider**: Range selection.
- [DS-106] **Checkbox**: custom checked state.
- [DS-107] **Toast**: Notification system (Sonner or custom).
- [DS-108] **Card**: Container for dashboard widgets.

### 2.3 Shared Business Components (src/components/shared/)

- [DS-201] **AppointmentCard**: Specific card for appointment lists.

### 2.4 Technical Standards

- [DS-301] **Styling**: Tailwind CSS v4 CSS-first approach.
- [DS-302] **Utilities**: `cn` helper (clsx + tailwind-merge).
- [DS-303] **Components**: Functional components, React 19, named exports, `type` for props.
- [DS-304] **Documentation**: Storybook 10 story for EVERY `ui/` component.
- [DS-305] **Testing**: Vitest + Testing Library for all interactive components.

## 3. Constraints & Dependencies

- **Stack**: React 19, Vite 6, Tailwind v4.
- **Library**: Lucide React for icons.
- **SSR**: TanStack Start compatibility (use `use client` where needed).

## 4. User Decisions (Implicit)

- Use `cva` for variant management.
- Refactor existing components from `src/components/storybook/` to `src/components/ui/`.
