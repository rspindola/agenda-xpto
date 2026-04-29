# Agenda XPTO API — Backend

Este pacote é o **backend** do monorepo **Agenda XPTO**: API HTTP para agendamento em estabelecimentos de beleza e estética (a documentação de domínio em `docs/` pode usar o nome **AgendaIA** em alguns ficheiros legados).

A aplicação usa **Fastify v5** com **TypeScript**, **Prisma** (PostgreSQL) e uma organização **modular por domínio** (rotas, serviços, repositórios, schemas), alinhada a [ARCHITECTURE.md §4](../../docs/flow/00-sustain/ARCHITECTURE.md), sem impor Clean Architecture / DDD completos.

## Tecnologias e integrações

- **Runtime:** Node.js 22.x LTS (ver `engines` no `package.json` da raiz do monorepo)
- **Framework:** [Fastify](https://fastify.dev/) v5
- **Linguagem:** TypeScript
- **Base de dados:** PostgreSQL com [Prisma](https://www.prisma.io/) 6.x
- **Autenticação:** [Better Auth](https://www.better-auth.com/) (instância em `src/lib/auth.ts`; rotas `/api/auth/*` ficam no módulo `auth`)
- **Filas:** [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/) (definição de filas em `src/jobs/queues.ts`)
- **E-mail:** [Resend](https://resend.com/) (`src/lib/email.ts`)
- **Validação:** [Zod](https://zod.dev/) v4 (partilhável com o frontend via `@agenda-xpto/validations`; `fastify-type-provider-zod` requer Zod 4)
- **HTTP:** `@fastify/cors` registado em `app.ts`; `@fastify/jwt` instalado para uso futuro (ainda não registado no bootstrap)

**Infra local:** PostgreSQL 16 e Redis 7 via Docker Compose na **raiz** do monorepo (`../../docker-compose.yml`).

## Arquitetura e estrutura de pastas

O código vive em `src/`, com domínios sob `modules/`, jobs BullMQ, partilhados e integrações.

### Estrutura actual (scaffold)

```
apps/api/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prisma/
│   ├── schema.prisma      # modelo canónico — ver DATABASE.md §3
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts             # bootstrap Fastify, CORS, /health, shutdown
│   ├── modules/           # domínios (pastas reservadas; rotas/serviços a implementar)
│   │   ├── auth/
│   │   ├── establishments/
│   │   ├── availability/
│   │   ├── appointments/
│   │   ├── booking/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── plans/
│   ├── jobs/
│   │   ├── queues.ts      # filas notifications + system
│   │   └── README.md
│   ├── shared/
│   │   ├── errors/        # AppError
│   │   ├── middlewares/
│   │   └── utils/
│   ├── lib/               # prisma, redis, email, bullmq, auth (Better Auth)
│   └── plugins/           # extensões Fastify (ver README em plugins/)
```

### Camadas por módulo (objectivo)

Conforme a documentação: **routes** → **service** → **repository** → **Prisma**; validação de entrada com **Zod** (schemas de rota / `packages/validations`).

## Funcionalidades (produto)

O detalhe está nas user stories em `docs/flow/`. Em alto nível:

1. **Autenticação e conta** — sessões Better Auth; multi-tenant por estabelecimento.
2. **Estabelecimentos** — cadastro, slug público, timezone, expediente e feriados.
3. **Disponibilidade** — horários por profissional, bloqueios, motor de slots.
4. **Agendamentos** — ciclo de vida, serviços com snapshot, cancelamento com token.
5. **Reserva pública** — página por slug (`/b/:slug` no frontend planeado).
6. **Notificações** — e-mails e jobs (confirmação, lembretes, cancelamento).
7. **Relatórios e planos** — módulos previstos na documentação.

A API expõe hoje **`GET /health`** (`{ status, timestamp }`) como verificação de vida; o restante das rotas de negócio será acrescentado por módulo.

## Configuração e instalação

Este pacote faz parte de um **monorepo pnpm** com Turborepo. Na raiz do repositório:

### Pré-requisitos

- Node.js 22.x (recomendado; ver `.nvmrc` na raiz)
- pnpm 10.x
- Docker (para Postgres e Redis locais)

### Passos

1. **Instalar dependências** (na raiz do monorepo):

   ```bash
   pnpm install
   ```

2. **Variáveis de ambiente**

   - Copiar [`../../.env.example`](../../.env.example) para **`apps/api/.env`** (ficheiro ignorado pelo Git).
   - Garantir que `DATABASE_URL` e `REDIS_URL` coincidem com o Docker Compose (por defeito Postgres e Redis em `127.0.0.1`).
   - Para testes de integração (`pnpm test:integration`), definir **`DATABASE_URL_TEST`** apontando para uma base **separada** no **mesmo** servidor PostgreSQL (ex.: `agenda_xpto_test`). Criar a base manualmente (sem segundo contentor):

     ```bash
     docker compose exec postgres psql -U agenda_xpto -d agenda_xpto -c "CREATE DATABASE agenda_xpto_test;"
     ```

     (Ajusta o nome do serviço do Compose se for diferente de `postgres`.)

   Lista de chaves alinhada a [ARCHITECTURE.md §9](../../docs/flow/00-sustain/ARCHITECTURE.md).

3. **Subir Postgres e Redis** (na raiz do monorepo):

   ```bash
   docker compose up -d
   ```

4. **Prisma — gerar cliente, migrar e seed**

   ```bash
   pnpm --filter api db:generate
   pnpm --filter api db:migrate
   pnpm --filter api db:seed
   ```

5. **Arrancar em desenvolvimento**

   ```bash
   pnpm --filter api dev
   ```

   Ou, a partir da raiz, `pnpm dev` (Turbo inclui este pacote).

6. **Produção** (após `pnpm --filter api build`):

   ```bash
   pnpm --filter api start
   ```

Porta por defeito: **`PORT=3001`** (ver `.env.example` na raiz).

## Scripts disponíveis (`package.json`)

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | `tsx watch src/app.ts` — desenvolvimento com reload |
| `pnpm build` | `tsc` — compila para `dist/` |
| `pnpm start` | `node dist/app.js` — execução pós-build |
| `pnpm db:generate` | `prisma generate` |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | `prisma db seed` (executa `prisma/seed.ts`) |
| `pnpm db:studio` | `prisma studio` |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint com `--fix` |
| `pnpm test` | Vitest — apenas testes unitários (`*.test.ts` exceto `*.repository.test.ts`) |
| `pnpm test:integration` | Vitest — apenas `*.repository.test.ts` (requer `DATABASE_URL_TEST`) |
| `pnpm test:all` | Unitários + integração |
| `pnpm test:coverage` | Unitários com cobertura v8 (limiar 80% nas linhas incluídas em `vitest.config.ts`) |

## Documentação relacionada

| Documento | Conteúdo |
|-----------|----------|
| [DATABASE.md §3](../../docs/flow/00-sustain/DATABASE.md) | Schema Prisma de referência e convenções |
| [DATABASE.md §7](../../docs/flow/00-sustain/DATABASE.md) | Descrição do seed de desenvolvimento |
| [ARCHITECTURE.md §4](../../docs/flow/00-sustain/ARCHITECTURE.md) | Estrutura alvo do backend e camadas |
| [ARCHITECTURE.md §7](../../docs/flow/00-sustain/ARCHITECTURE.md) | Filas BullMQ (jobs planeados) |
| [README.md na raiz](../../README.md) | Visão geral do monorepo |

## Documentação OpenAPI (Swagger)

Com **`NODE_ENV !== production`**, a API regista `@fastify/swagger` + `@fastify/swagger-ui`:

- **Swagger UI:** `http://localhost:3001/docs` (ajusta `PORT` se necessário)
- **OpenAPI JSON:** `GET /docs/json`

Em **produção**, `/docs` e `/docs/json` **não** são expostos. O título da especificação é **Agenda XPTO API**.

Rotas devem usar schemas Zod e `fastify-type-provider-zod` (ver regra `.cursor/rules/swagger-docs.mdc` na raiz do monorepo).

## Health check

Com o servidor a correr:

```bash
curl -s http://localhost:3001/health
```

Resposta esperada: JSON com `"status": "ok"` e `timestamp` em ISO 8601.

---

Após o seed, existe utilizador de teste descrito em `prisma/seed.ts` (e-mail **teste@example.com** e palavra-passe definida no próprio script).
