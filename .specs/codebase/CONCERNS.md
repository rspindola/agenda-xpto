# Concerns & Tech Debt — Agenda XPTO

## Complex Areas
- **Slot Algorithm:** The logic for calculating available time slots involves intersecting business hours, professional availability, holidays, blocks, and existing appointments. It is performance-critical and sensitive to timezone offsets.
- **Multi-tenancy:** Ensuring that a user cannot access or modify resources belonging to another establishment is paramount. Every repository query must include `establishmentId`.

## Risks
- **Concurrency:** Race conditions during appointment creation (double booking). Mitigated by pessimistic locking or `SELECT ... FOR UPDATE` in the slot validation transaction.
- **Plan Limits:** Enforcement of appointment quotas for the Starter plan requires accurate monthly tracking and reset jobs.

## Tech Debt / Limitations
- **PENDING State:** Appointments are created directly as `CONFIRMED`. The `PENDING` state only exists in memory during the creation process.
- **Frontend Sync:** Shared types/validations are currently placeholders and need to be populated as the frontend develops.
- **Better Auth Prisma Adapter:** Ensure the schema remains synced with Better Auth requirements if upgraded.
