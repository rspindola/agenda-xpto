# Structure — Agenda XPTO

## Monorepo Map
```
agenda-xpto/
├── apps/
│   ├── api/                    # Backend (Node/Fastify)
│   │   ├── prisma/             # Schema and migrations
│   │   └── src/
│   │       ├── modules/        # Feature domains
│   │       ├── shared/         # Common logic, errors, middlewares
│   │       ├── lib/            # Singletons (Prisma, Redis, etc.)
│   │       ├── jobs/           # BullMQ workers
│   │       └── plugins/        # Fastify plugins
│   └── web/                    # Frontend (React/Vite) - IN PROGRESS
├── packages/
│   ├── types/                  # Shared TS types
│   └── validations/            # Shared Zod schemas
├── docs/                       # Product documentation (PRD, ADRs)
├── .agents/
│   └── rules/                  # AI Agent behavior rules
└── turbo.json                  # Turborepo configuration
```

## Module Internals (Backend)
```
src/modules/<module>/
├── <module>.routes.ts          # API Endpoints
├── <module>.service.ts         # Business Logic
├── <module>.repository.ts      # Data Access
├── <module>.schema.ts          # Zod Validation
└── __tests__/                  # Unit and Integration tests
```
