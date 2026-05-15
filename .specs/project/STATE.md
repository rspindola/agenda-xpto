# State — Agenda XPTO

## Active Focus
- **Frontend Initialization:** Setting up the foundation for `apps/web` modules.
- **Design System:** Ensuring UI consistency with Tailwind v4.

## Key Decisions
- **Backend Complete:** All 9 core modules are fully implemented and tested in `apps/api`.
- **Frontend Framework:** React 19 + TanStack Router + TanStack Query.
- **Styling:** Tailwind CSS v4 (no external UI library components used yet).

## Blockers
- None.

## Deferred Ideas (Post-MVP)
- WhatsApp integration.
- AI features.
- Mobile application.

## Todos
- [ ] Implement Establishment Setup UI.
- [ ] Implement Availability Rules UI.
- [ ] Implement Professional & Service management UI.
- [ ] Build the Public Booking Page.

## Project Memory
- The backend is "canon" (source of truth) for business rules.
- Multi-tenancy is verified via `establishmentId` ownership.
- Slot algorithm is the most complex logic; must be mirrored correctly in UI for previews.
