---
trigger: always_on
---

# Prompt: Reorganizar `.agents/` do Monorepo por Contexto (Back/Front)

## Objetivo

Reorganize a pasta `.agents/` deste monorepo separando as skills e rules de **frontend** para dentro de `apps/web/.agents/`, mantendo no root apenas o que é **backend** ou **compartilhado entre os dois contextos**.

---

## Estrutura alvo

```
.agents/                              ← raiz (backend + compartilhados)
  rules/
    architecture.md
    database-prisma.md
    testing-tdd.md
    security.md
    swagger-docs.md
    language-standards.md             ← compartilhado, fica aqui
    import-organization.md            ← compartilhado, fica aqui
    typescript-conventions.md         ← compartilhado, fica aqui
  skills/
    better-auth-best-practices/
    caveman/
    caveman-commit/
    caveman-compress/
    caveman-help/
    caveman-review/
    compress/
    executing-plans/
    fastify-best-practices/
    github-actions-docs/
    readme-i18n/
    seo-audit/
    vitest/
    web-design-guidelines/
    writing-plans/

apps/web/.agents/                     ← frontend específico (criar)
  rules/
    frontend.md                       ← mover de .agents/rules/
  skills/
    frontend-design/                  ← mover de .agents/skills/
    storybook/                        ← mover de .agents/skills/
    tailwind-design-system/           ← mover de .agents/skills/
    ui-ux-pro-max/                    ← mover de .agents/skills/
    vite/                             ← mover de .agents/skills/
    vitest/                           ← copiar (usado no front também)
    zustand/                          ← mover de .agents/skills/
```

---

## Passos

### 1. Criar a estrutura de destino

```bash
mkdir -p apps/web/.agents/rules
mkdir -p apps/web/.agents/skills
```

### 2. Mover a rule de frontend

```bash
mv .agents/rules/frontend.md apps/web/.agents/rules/frontend.md
```

### 3. Mover as skills de frontend

```bash
mv .agents/skills/frontend-design   apps/web/.agents/skills/frontend-design
mv .agents/skills/storybook         apps/web/.agents/skills/storybook
mv .agents/skills/tailwind-design-system apps/web/.agents/skills/tailwind-design-system
mv .agents/skills/ui-ux-pro-max     apps/web/.agents/skills/ui-ux-pro-max
mv .agents/skills/vite              apps/web/.agents/skills/vite
mv .agents/skills/zustand           apps/web/.agents/skills/zustand
```

### 4. Copiar vitest para o frontend (também usada no back — não remover da raiz)

```bash
cp -r .agents/skills/vitest apps/web/.agents/skills/vitest
```

### 5. Verificar o resultado

Confirme que:

- `.agents/rules/` **não contém mais** `frontend.md`
- `.agents/skills/` **não contém mais** as pastas movidas
- `apps/web/.agents/rules/frontend.md` existe
- `apps/web/.agents/skills/` contém todas as pastas listadas acima

---

## Critérios de classificação usados

| Critério                                                     | Fica na raiz | Vai para apps/web/ |
| ------------------------------------------------------------ | ------------ | ------------------ |
| Exclusivo de Fastify/Prisma/BullMQ/Redis                     | ✅           |                    |
| Exclusivo de React/Vite/Tailwind/Storybook                   |              | ✅                 |
| Usado em ambos os contextos (TypeScript, imports, linguagem) | ✅           |                    |
| Agnóstico (caveman, writing-plans, executing-plans)          | ✅           |                    |
| Vitest                                                       | ✅ (back)    | ✅ copiar (front)  |

---

## O que NÃO fazer

- Não mover `language-standards.md`, `import-organization.md` ou `typescript-conventions.md` — elas se aplicam ao front também e devem ser herdadas do root
- Não remover `vitest` da raiz — o backend usa e tem 268 testes
- Não criar um `.agents/` dentro de `apps/api/` — o backend já está coberto pelo root
- Não alterar nenhum conteúdo de arquivo, apenas mover/copiar

---

## Contexto do projeto

- Monorepo Turborepo + pnpm workspaces
- Backend em `apps/api/` — Fastify v5, Prisma, BullMQ (✅ completo)
- Frontend em `apps/web/` — React 19, Vite 6, TanStack Router/Query, Zustand, Tailwind v4 (⏳ em desenvolvimento)
- Ferramentas: Cursor + Antigravity (ambos carregam `.agents/` por workspace aberto)
- Skills seguem o padrão do `agent-skills` (tech-leads-club)
