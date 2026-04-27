# ARCHITECTURE.md — AgendaIA
**Versão:** 1.0 | **Data:** Abril 2026 | **Autor:** Solo dev

---

## 1. Visão Geral

AgendaIA é um SaaS de agendamento para pequenos estabelecimentos de beleza e estética. Este documento descreve as decisões técnicas, stack, estrutura de arquivos e padrões adotados no projeto.

Para decisões individuais com contexto e alternativas consideradas, ver [ADRs](#adrs).

---

## 2. Monorepo — Estrutura Raiz

```
agendaia/
├── apps/
│   ├── web/                  # Frontend — React + Vite
│   └── api/                  # Backend — Fastify + Node.js
├── packages/
│   ├── types/                # Tipos TypeScript compartilhados
│   └── validations/          # Schemas Zod compartilhados
├── docs/                     # Documentação do produto
├── docker-compose.yml        # PostgreSQL + Redis local
├── .env.example
├── turbo.json                # Turborepo
└── package.json              # Root workspace
```

Gerenciador de monorepo: **Turborepo** com **pnpm workspaces**.

---

## 3. Stack Completa

### 3.1 Frontend — `apps/web/`

| Camada | Tecnologia | Versão | Motivo |
|---|---|---|---|
| Framework | React | latest | Ecossistema maduro, familiaridade |
| Build | Vite | latest | DX superior, HMR rápido |
| Linguagem | TypeScript | latest | Tipagem compartilhada com backend |
| Estilo | TailwindCSS | v4 | Produtividade alta, sem CSS manual |
| Componentes base | shadcn/ui | latest | Componentes no próprio código, sem lock-in |
| Estado servidor | TanStack Query | v5 | Cache, refetch, loading states automáticos |
| Estado global | Zustand | latest | Simples, sem boilerplate Redux |
| Formulários | React Hook Form | latest | Performance, integração com Zod |
| Validação | Zod | latest | Compartilhado com backend via `packages/validations` |
| Roteamento | React Router | v7 | Layouts aninhados, suporte a loader pattern |
| HTTP client | Axios | latest | Interceptors para auth token |

### 3.2 Backend — `apps/api/`

| Camada | Tecnologia | Versão | Motivo |
|---|---|---|---|
| Runtime | Node.js | LTS | Familiaridade, ecossistema |
| Framework | Fastify | v5 | Performance, TypeScript nativo, schema validation |
| Linguagem | TypeScript | latest | Tipagem end-to-end |
| ORM | Prisma | latest | DX superior, migrations, tipagem automática |
| Validação | Zod | latest | Compartilhado com frontend |
| Autenticação | Better Auth | latest | Moderno, sem serviço externo pago |
| Filas / Jobs | BullMQ | latest | Agendamento de lembretes, retry com backoff |
| E-mail | Resend | latest | API simples, plano gratuito generoso |

### 3.3 Infraestrutura

| Componente | Tecnologia | Motivo |
|---|---|---|
| Banco de dados | PostgreSQL | Relacional, confiável, suporte a JSON |
| Cache / Filas | Redis | BullMQ + cache de slots disponíveis |
| Hospedagem | VPS (Digital Ocean / Hostinger) | Controle total, custo previsível |
| Containers | Docker + Docker Compose | Reproduzível em dev e prod |
| Reverse proxy | Caddy | HTTPS automático, config simples |
| CI/CD | GitHub Actions | Automação de deploy |

---

## 4. Arquitetura do Backend

Arquitetura **modular em camadas por domínio** — inspirada em SOLID e Clean Code, sem a cerimônia da Clean Architecture pura (adequada para solo dev).

### 4.1 Estrutura de arquivos

```
apps/api/
└── src/
    ├── modules/                    # Um diretório por domínio de negócio
    │   ├── auth/
    │   │   ├── auth.routes.ts
    │   │   ├── auth.service.ts
    │   │   └── auth.schema.ts
    │   ├── establishments/         # 03-establishment-setup
    │   │   ├── establishments.routes.ts
    │   │   ├── establishments.service.ts
    │   │   ├── establishments.repository.ts
    │   │   └── establishments.schema.ts
    │   ├── availability/           # 04-availability
    │   ├── appointments/           # 05-appointments
    │   ├── booking/                # 06-public-booking-page (público, sem auth)
    │   ├── notifications/          # 07-notifications
    │   ├── reports/                # 08-reports
    │   └── plans/                  # 09-plans
    ├── jobs/                       # BullMQ workers
    │   ├── queues.ts               # definição das filas
    │   ├── reminder.job.ts         # lembrete 24h e 2h
    │   └── notification.job.ts     # confirmação, cancelamento
    ├── shared/
    │   ├── errors/                 # AppError, classes de erro HTTP
    │   ├── middlewares/            # auth guard, rate limit, tenant
    │   ├── utils/                  # date, slug, pagination
    │   └── types/                  # tipos internos do backend
    ├── lib/
    │   ├── prisma.ts               # instância singleton do Prisma
    │   ├── redis.ts                # instância do Redis
    │   ├── email.ts                # instância do Resend
    │   └── bullmq.ts              # configuração das filas
    ├── plugins/                    # plugins Fastify (cors, jwt, swagger)
    └── app.ts                      # bootstrap do Fastify
```

### 4.2 Camadas por módulo

```
routes      →   service     →   repository  →   Prisma (DB)
(HTTP)          (regras         (queries
                de negócio)     SQL)
```

- **Routes**: recebe request, valida com Zod, chama service, retorna response
- **Service**: lógica de negócio pura, sem conhecer Prisma diretamente
- **Repository**: queries ao banco via Prisma, retorna entidades tipadas
- **Schema**: schemas Zod de input/output da rota (alguns compartilhados via `packages/validations`)

### 4.3 Princípios aplicados

- **Single Responsibility** — cada arquivo tem uma única responsabilidade
- **Dependency Inversion** — services recebem repository por injeção (ou importação direta em MVP, evoluindo para injeção conforme necessidade)
- **Open/Closed** — novos módulos adicionados sem alterar os existentes
- **DRY** — lógica compartilhada em `shared/`, tipos em `packages/types/`
- **Fail Fast** — validação de entrada nas rotas antes de chegar ao service

---

## 5. Arquitetura do Frontend

### 5.1 Estrutura de arquivos

```
apps/web/
├── public/
└── src/
    ├── assets/                     # imagens, ícones, fontes
    ├── components/
    │   ├── ui/                     # componentes base via shadcn/ui
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── modal.tsx
    │   │   └── ...
    │   └── shared/                 # componentes de negócio reutilizáveis
    │       ├── AppointmentCard.tsx
    │       ├── ProfessionalAvatar.tsx
    │       └── ...
    ├── modules/                    # espelha os módulos do docs/flow/
    │   ├── auth/
    │   │   ├── components/         # LoginForm, SignupForm
    │   │   ├── hooks/              # useAuth, useSession
    │   │   └── pages/              # LoginPage, SignupPage
    │   ├── dashboard/              # 02-dashboard
    │   ├── establishment/          # 03-establishment-setup
    │   ├── availability/           # 04-availability
    │   ├── appointments/           # 05-appointments
    │   ├── reports/                # 08-reports
    │   ├── plans/                  # 09-plans
    │   └── booking/                # 06-public-booking-page (cliente, sem auth)
    ├── hooks/                      # hooks globais
    │   ├── useToast.ts
    │   ├── useDebounce.ts
    │   └── useEstablishment.ts     # estabelecimento ativo (multi-tenant)
    ├── lib/
    │   ├── axios.ts                # instância com interceptors de auth
    │   └── queryClient.ts          # configuração do TanStack Query
    ├── stores/                     # Zustand
    │   ├── auth.store.ts
    │   └── establishment.store.ts  # estabelecimento ativo selecionado
    ├── router/
    │   ├── index.tsx               # definição de rotas
    │   ├── layouts/
    │   │   ├── AuthLayout.tsx      # layout área autenticada (sidebar, header)
    │   │   └── PublicLayout.tsx    # layout público (booking, login)
    │   └── guards/
    │       └── AuthGuard.tsx       # redireciona se não autenticado
    ├── styles/
    │   └── globals.css
    └── types/                      # tipos locais do frontend
```

### 5.2 Rotas

```
/                          → redirect /dashboard ou /login
/login                     → PublicLayout
/signup                    → PublicLayout
/forgot-password           → PublicLayout

/dashboard                 → AuthLayout → DashboardPage
/dashboard/appointments    → AuthLayout → AppointmentsPage
/dashboard/availability    → AuthLayout → AvailabilityPage
/dashboard/services        → AuthLayout → ServicesPage
/dashboard/professionals   → AuthLayout → ProfessionalsPage
/dashboard/reports         → AuthLayout → ReportsPage
/dashboard/plans           → AuthLayout → PlansPage
/dashboard/settings        → AuthLayout → SettingsPage

/b/:slug                   → PublicLayout → BookingPage  (cliente final, sem auth)
```

### 5.3 Padrões de dados

- **TanStack Query** gerencia todo estado servidor (fetch, cache, mutações)
- **Zustand** gerencia estado de UI global (estabelecimento ativo, tema, sidebar)
- **React Hook Form + Zod** em todos os formulários
- Sem Redux, sem Context API para dados (apenas para temas/i18n se necessário)

---

## 6. Banco de Dados

### 6.1 Convenções Prisma

- Tabelas em `snake_case`
- Campos de auditoria em todas as tabelas: `created_at`, `updated_at`
- Soft delete com `deleted_at` onde fizer sentido (ex: profissionais, estabelecimentos)
- UUIDs como primary keys
- Enums para estados (ex: `AppointmentStatus`, `PlanType`, `NotificationStatus`)

### 6.2 Módulos principais do schema

```
User                        # dono da conta
Establishment               # estabelecimento (1 user → N establishments)
Professional                # profissional (N:N com Service)
Service                     # serviço (nome, duração, preço)
ServiceCombo                # combo pré-definido
Appointment                 # agendamento
AppointmentService          # serviços de um agendamento (1:N)
Availability                # disponibilidade semanal por profissional
Block                       # bloqueio pontual
Notification                # registro de notificação enviada
Plan                        # plano contratado
Subscription                # assinatura ativa do estabelecimento
```

---

## 7. Filas e Jobs (BullMQ)

```
Fila: notifications
  ├── job: confirmation-email     → disparo imediato após agendamento
  ├── job: reminder-24h           → agendado para 24h antes
  ├── job: reminder-2h            → agendado para 2h antes
  ├── job: cancellation-email     → disparo imediato após cancelamento
  └── job: owner-cancellation     → notificação ao dono

Fila: system
  ├── job: reset-monthly-quota    → cron 00:00 dia 1 (reset Starter)
  └── job: trial-expiry           → cron diário (verificar trials expirando)
```

Retry policy: 3 tentativas com backoff exponencial (1 min → 5 min → 15 min).
Ver detalhes em `docs/flow/07-notifications/`.

---

## 8. Autenticação e Multi-tenancy

- **Better Auth** gerencia sessões, tokens e refresh
- Cada request autenticado carrega `userId` e `establishmentId` ativo
- Middleware de tenant valida que o recurso pertence ao estabelecimento do usuário
- Página pública `/b/:slug` não requer autenticação — resolve estabelecimento pelo slug

---

## 9. Variáveis de Ambiente

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agendaia

# Redis
REDIS_URL=redis://localhost:6379

# Auth
AUTH_SECRET=
AUTH_URL=http://localhost:3001

# Email
RESEND_API_KEY=

# App
NODE_ENV=development
API_URL=http://localhost:3001
WEB_URL=http://localhost:5173
```

---

## 10. ADRs

Os ADRs (Architecture Decision Records) estão na pasta `docs/flow/00-sustain/adr/`.

| ID | Título | Status |
|---|---|---|
| ADR-001 | [Monorepo com Turborepo e pnpm](./adr/ADR-001.md) | Aceito |
| ADR-002 | [Fastify em vez de Express](./adr/ADR-002.md) | Aceito |
| ADR-003 | [Prisma como ORM](./adr/ADR-003.md) | Aceito |
| ADR-004 | [BullMQ para filas de notificações](./adr/ADR-004.md) | Aceito |
| ADR-005 | [Better Auth para autenticação](./adr/ADR-005.md) | Aceito |
| ADR-006 | [Arquitetura modular em camadas (não Clean Architecture pura)](./adr/ADR-006.md) | Aceito |
| ADR-007 | [Caddy como reverse proxy](./adr/ADR-007.md) | Aceito |

---

*Documento vivo — atualizar a cada decisão técnica relevante.*
