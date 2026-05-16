# Roadmap

## Phase 1: Foundation & Design System
- [ ] Implement `cn()` utility (clsx + tailwind-merge).
- [ ] Establish Tailwind v4 Design Tokens (colors, typography).
- [ ] Base UI Components (Button, Input, Dialog, etc.) with CVA and Storybook 10.
- [ ] Layouts (Public vs Admin).

## Phase 2: Feature Implementation (Ordered)

### 1. Auth
- [ ] Login / Signup / Forgot Password.
- [ ] Integration with Better Auth (via Axios).
- [ ] Protected Route logic in TanStack Router.

### 2. Dashboard
- [ ] Overview metrics.
- [ ] Recent activity / Upcoming appointments.

### 3. Establishments
- [ ] Creation and configuration.
- [ ] Multi-establishment switcher.

### 4. Availability
- [ ] Business hours.
- [ ] Professional schedules & blocks.
- [ ] Holidays.

### 5. Appointments
- [ ] Admin agenda view (FullCalendar).
- [ ] Manual creation/edit/cancellation.

### 6. Public Booking Page
- [ ] Public flow: Service -> Professional -> Slot -> Confirm.
- [ ] Client details & Email confirmation.

### 7. Reports
- [ ] Analytics and business insights per plan.

### 8. Plans
- [ ] Subscription management.
- [ ] Trial logic & upgrade/downgrade flows.

## Phase 3: Polish & Monitoring
- [ ] Sentry integration audit.
- [ ] Performance optimization (SSR/Hydration).
- [ ] MSW mock data completion.

## Phase 4: Post-MVP (Roadmap)
- [ ] WhatsApp Integration.
- [ ] IA Credits & AI Assistant.
- [ ] FAQ Knowledge Base.
- [ ] Playwright E2E.
