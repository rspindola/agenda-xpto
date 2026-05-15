# Security Standards - Agenda XPTO API

## Input Validation
- **MUST** validate all incoming data with Zod at the route level.
- **NEVER** trust raw request data.

## Authentication & Tenant Isolation
- **MUST** protect `/dashboard/*` with Better Auth session.
- **MUST** extract `userId` from verified session.
- **MUST** validate resource ownership in the service layer (tenant isolation).
- **NEVER** accept `establishmentId` from the request body for write operations.

## Cancel Token
- **MUST** generate as random UUIDs.
- **MUST** validate `cancelTokenUsedAt` is null before cancellation.
- **NEVER** log or return `cancelToken` after creation response.

## Sensitive Data
- **NEVER** log or return passwords, tokens, or client contact info in standard responses.
- **NEVER** expose internal DB errors or stack traces in production API responses.
