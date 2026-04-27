# Passo a passo — Relatórios (Módulo 08)

Narrativa para o dono (**Admin**). Critérios: [USER_STORIES.md](USER_STORIES.md). Resumo rápido no painel: [módulo 02 — Dashboard](../02-dashboard/USER_STORIES.md). Planos: [módulo 09](../09-plans/USER_STORIES.md).

---

## Fluxo principal — escolher relatório, filtrar, ver, exportar

1. O Admin faz login ([módulo 01](../01-auth/USER_STORIES.md)) e abre o painel.
2. Navega para **Relatórios** ([US-120](USER_STORIES.md)).
3. Vê o **catálogo** de relatórios: básicos sempre acessíveis; entradas **Pro** com indicação visual no **Starter** ([US-120](USER_STORIES.md)).
4. Selecciona um relatório **básico** (ex.: realizados, cancelamentos, no-show, por profissional, por serviço — [US-122](USER_STORIES.md) a [US-126](USER_STORIES.md)) **ou** um relatório **Pro** (pico, rentabilidade/hora, retorno/antecedência/motivo — [US-128](USER_STORIES.md) a [US-130](USER_STORIES.md)).
5. Define **filtros** ([US-121](USER_STORIES.md)): data início, data fim (máximo **366** dias), estabelecimento, profissional; aplica.
6. O sistema mostra a **tabela** ou visualização acordada para esse relatório.
7. Opcionalmente clica **Exportar CSV** ou **Exportar PDF** ([US-127](USER_STORIES.md)); o ficheiro reflecte os filtros actuais.

**Nota:** O [dashboard](../02-dashboard/USER_STORIES.md) mostra **resumo** do dia/semana e no-show em **30 dias fixos** ([US-104](../02-dashboard/USER_STORIES.md)); os relatórios aqui são **histórico detalhado** com **período customizável** — não duplicar regras no código sem referência cruzada a este módulo.

---

## Fluxo — relatório Pro bloqueado (Starter) → upgrade

1. No plano **Starter**, o Admin abre **Relatórios** ([US-120](USER_STORIES.md)).
2. Clica num relatório marcado como **Pro** (cadeado).
3. Vê **pré-visualização bloqueada** ou mensagem equivalente e **CTA de upgrade** ([US-119](../09-plans/USER_STORIES.md)).
4. Segue o CTA para o fluxo de **planos e subscrição** ([módulo 09](../09-plans/step-by-step.md)); após upgrade para **Pro** ou **Business**, regressa aos relatórios e o conteúdo **Pro** fica desbloqueado.
5. **Exportação** de relatórios Pro continua sujeita a estar desbloqueado ([US-127](USER_STORIES.md)).

---

## Regras de dados (resumo)

| Relatório | Regra curta |
|-----------|--------------|
| Realizados ([US-122](USER_STORIES.md)) | `completed` + `start_at` no intervalo |
| Cancelamentos ([US-123](USER_STORIES.md)) | `cancelled` + `cancelled_at` no intervalo; **fallback:** `start_at` no intervalo |
| No-show ([US-124](USER_STORIES.md)) | Mesma fórmula que dashboard [US-104](../02-dashboard/USER_STORIES.md), janela = filtro |
| Pico ([US-128](USER_STORIES.md)) | Dia da semana + hora 60 min; `confirmed` / `completed` / `no_show`; sem `cancelled` |
| Retorno ([US-130](USER_STORIES.md)) | % clientes com ≥2 agendamentos (`start_at` no período; estados `confirmed` / `completed` / `no_show`; sem `cancelled`) |
| Motivo cancelamento ([US-130](USER_STORIES.md)) | Só quando existir captura no **05/06** |

---

## Referências

- [USER_STORIES.md](USER_STORIES.md)  
- [diagrams/user-flow/flow.md](diagrams/user-flow/flow.md)  
- [diagrams/wireframes/pages.md](diagrams/wireframes/pages.md)
