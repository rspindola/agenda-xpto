# Integrations — Agenda XPTO

## Database & Persistence
- **PostgreSQL:** Primary relational store.
- **Redis:** Used for BullMQ queues and future caching of availability slots.
- **Prisma:** ORM for type-safe database access.

## Authentication
- **Better Auth:** Handles user sessions, registration, login, and email verification. Self-hosted within the API.

## Messaging & Workers
- **BullMQ:** Distributed queue system for asynchronous jobs.
- **Redis:** Backend for BullMQ.

## Communication
- **Resend:** API for sending transactional emails (confirmations, reminders, cancellations).

## Monitoring
- **Pino:** Structured logging for the Fastify server.
