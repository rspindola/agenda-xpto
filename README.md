# Agenda XPTO

Monorepo **Agenda XPTO** em **pnpm workspaces** + **Turborepo**: produto SaaS de agendamento para estabelecimentos de beleza e estética. Em alguns documentos em `docs/` o produto ainda aparece como **AgendaIA** (legado).

## O que há neste repositório

| Área | Descrição |
|------|-----------|
| [`apps/api`](apps/api) | Backend HTTP (Fastify, Prisma, Better Auth). Detalhes de stack, scripts e fluxo local: **[`apps/api/README.md`](apps/api/README.md)**. |
| [`packages/types`](packages/types) | Pacote **`@agenda-xpto/types`** — tipos TypeScript partilhados. |
| [`packages/validations`](packages/validations) | Pacote **`@agenda-xpto/validations`** — schemas Zod partilhados. |
| [`docs/`](docs/) | PRD, fluxos por módulo, arquitetura e ADRs. |
| [`AGENTS.md`](AGENTS.md) | Contexto para humanos e agentes (estrutura, convenções, o que não implementar no MVP). |

A app web em `apps/web` consta na documentação, mas **ainda não** existe neste repositório.

## Requisitos

- **Node.js** 22.x LTS — [`.nvmrc`](.nvmrc) e `engines` em [`package.json`](package.json)
- **pnpm** 10.x — `packageManager` na raiz
- **Docker** + Docker Compose — PostgreSQL 16 e Redis 7 locais ([`docker-compose.yml`](docker-compose.yml))

## Início rápido

1. Copiar [`.env.example`](.env.example) para **`apps/api/.env`** e ajustar `DATABASE_URL` / `REDIS_URL` conforme o Compose (ver comentários no `.env.example`).
2. Subir infra:

   ```bash
   docker compose up -d
   ```

3. Instalar dependências e preparar a base da API:

   ```bash
   pnpm install
   pnpm --filter api db:generate
   pnpm --filter api db:migrate
   pnpm --filter api db:seed
   ```

4. Desenvolvimento (Turbo executa `dev` nos pacotes que definem o script — API em watch e pacotes com `tsc --watch`):

   ```bash
   pnpm dev
   ```

Variáveis de ambiente, testes com `DATABASE_URL_TEST` e demais scripts da API estão em **[`apps/api/README.md`](apps/api/README.md)**.

## Documentação de produto e arquitetura

| Documento | Conteúdo |
|-----------|-----------|
| [docs/PRD.md](docs/PRD.md) | Escopo e modelo de negócio |
| [docs/flow/00-sustain/ARCHITECTURE.md](docs/flow/00-sustain/ARCHITECTURE.md) | Stack, filas, variáveis de ambiente (seção 9) |
| [docs/flow/00-sustain/DATABASE.md](docs/flow/00-sustain/DATABASE.md) | Modelo de dados e seed de referência (seção 7) |
| [docs/flow/00-sustain/adr/](docs/flow/00-sustain/adr/) | Decisões de arquitetura |

## Scripts na raiz

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instala dependências de todos os workspaces |
| `pnpm dev` | `turbo run dev` |
| `pnpm build` | `turbo run build` |
| `pnpm lint` | `turbo run lint` |
| `pnpm typecheck` | `turbo run typecheck` |
| `pnpm db:migrate` | Encaminha para `db:migrate` da API (`prisma migrate dev`) |
| `pnpm db:seed` | Encaminha para `db:seed` da API (`prisma db seed`) |

Comandos Prisma e testes (`pnpm --filter api test`, etc.) ficam no pacote **`api`** — ver tabela em [`apps/api/README.md`](apps/api/README.md).

## Health check (API)

Com a API na porta configurada (`PORT`, por padrão **3001**):

`GET http://localhost:3001/health` → JSON com `status: "ok"` e `timestamp` em ISO.

## Credenciais de desenvolvimento (seed)

O usuário e a senha de teste gerados por [`apps/api/prisma/seed.ts`](apps/api/prisma/seed.ts) ficam nas constantes no início de `main()` (por padrão **owner@example.com** / **DevSeedPassword123**). Confira o arquivo se alterares o seed localmente.
