# Agenda XPTO

Monorepo da **Agenda XPTO** (pnpm workspaces + Turborepo). A documentação de domínio em `docs/` pode referir-se ao produto como **AgendaIA** em alguns ficheiros legados.

## Requisitos

- **Node.js** 22.x LTS (ver [`.nvmrc`](.nvmrc) e `engines` em [`package.json`](package.json))
- **pnpm** 10.x (ver `packageManager` na raiz)
- **Docker** + Docker Compose (PostgreSQL 16 e Redis 7 locais)

## Estrutura do repositório

```
├── apps/
│   └── api/                 # API — Fastify 5, Prisma 6, Better Auth (instância), BullMQ, Resend
├── packages/
│   ├── types/               # @agenda-xpto/types — tipos partilhados
│   └── validations/       # @agenda-xpto/validations — schemas Zod partilhados
├── docs/                   # PRD, fluxos, arquitectura, ADRs
├── docker-compose.yml
├── .env.example
├── turbo.json
└── package.json
```

O frontend `apps/web` está planeado na documentação mas **ainda não** existe neste repositório.

## Documentação

| Documento | Conteúdo |
|-----------|-----------|
| [docs/flow/00-sustain/ARCHITECTURE.md](docs/flow/00-sustain/ARCHITECTURE.md) | Stack, estrutura prevista do backend e frontend, filas BullMQ, variáveis de ambiente (§9) |
| [docs/flow/00-sustain/DATABASE.md](docs/flow/00-sustain/DATABASE.md) | Modelo de dados, schema Prisma de referência (§3), seed descrito (§7) |
| [docs/flow/00-sustain/adr/](docs/flow/00-sustain/adr/) | ADRs (Turborepo, Fastify, Prisma, BullMQ, Better Auth, etc.) |

## Variáveis de ambiente

A lista canónica de chaves está em [ARCHITECTURE.md §9](docs/flow/00-sustain/ARCHITECTURE.md) e espelhada em [`.env.example`](.env.example). Inclui `PORT` (API, por defeito **3001**) usada pela aplicação.

Para desenvolvimento local da API:

1. Copiar `.env.example` para `apps/api/.env` e ajustar valores (o ficheiro `apps/api/.env` não deve ser commitado).
2. Alinhar `DATABASE_URL` e `POSTGRES_*` com o utilizador, palavra-passe e base definidos no Compose (ver `.env.example`).

## Infra local (Docker)

```bash
docker compose up -d
```

Serviços definidos em [`docker-compose.yml`](docker-compose.yml):

- **PostgreSQL 16** — porta `127.0.0.1:5432`, variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (valores por defeito `agenda_xpto` — ver `.env.example`)
- **Redis 7** — persistência AOF, porta `127.0.0.1:6379`

## Scripts na raiz

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instala dependências de todos os workspaces |
| `pnpm dev` | `turbo run dev` (API em `tsx watch`, packages em `tsc --watch` onde aplicável) |
| `pnpm build` | Compilação com cache e ordem topológica |
| `pnpm lint` | ESLint nos pacotes que definem o script |
| `pnpm db:migrate` | Encaminha para o script `db:migrate` da API (`prisma migrate dev`) |
| `pnpm db:seed` | Encaminha para o script `db:seed` da API (`prisma db seed`) |

## API (`apps/api`)

Scripts principais (ver [`apps/api/package.json`](apps/api/package.json)):

| Script | Comando |
|--------|---------|
| `dev` | `tsx watch src/app.ts` |
| `build` / `start` | `tsc` / `node dist/app.js` |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:seed` | `prisma db seed` (executa `prisma/seed.ts` via `tsx`) |
| `db:studio` | `prisma studio` |
| `lint` | `eslint .` |

Fluxo típico após o Docker estar a correr:

```bash
pnpm install
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
pnpm dev
```

**Health check:** `GET http://localhost:3001/health` → resposta JSON com `status: "ok"` e `timestamp` ISO.

O seed de desenvolvimento cria dados de exemplo; utilizador de teste descrito no código do seed: **teste@example.com** (palavra-passe definida em [`apps/api/prisma/seed.ts`](apps/api/prisma/seed.ts)).

## Stack da API (resumo)

Conforme [ARCHITECTURE.md §3.2](docs/flow/00-sustain/ARCHITECTURE.md): Node.js, **Fastify v5**, TypeScript, **Prisma** (PostgreSQL), **Zod**, **Better Auth**, **BullMQ** + **Redis**, **Resend**. O pacote `@fastify/jwt` está instalado; o registo no servidor fica para quando as rotas o precisarem (rotas Better Auth `/api/auth/*` estão planeadas no módulo `auth`).

## Pacotes partilhados

- **`@agenda-xpto/types`** — [`packages/types`](packages/types)
- **`@agenda-xpto/validations`** — [`packages/validations`](packages/validations)

Os `paths` no [`tsconfig.json`](tsconfig.json) da raiz apontam para estes pacotes para resolução no editor; a API declara-os como dependências `workspace:*`.
