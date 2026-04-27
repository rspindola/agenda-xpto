# 02 — Dashboard: wireframes ASCII (painel)

Escopo alinhado ao [PRD](../../../../PRD.md) (MVP): **sem** gráficos de tendência, **sem** receita/faturamento, **sem** comparativos com períodos anteriores (ver [módulo 08](../../../08-reports/USER_STORIES.md)).  
User stories: [USER_STORIES.md](../../USER_STORIES.md).

---

## Página: Dashboard (início do painel)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Painel                                    [Estabelecimento ▼]   │
│          Salão Exemplo Lda                          Ana (conta)  [Sair] │
├────────────┬─────────────────────────────────────────────────────────────┤
│ Painel     │  DASHBOARD                                                     │
│ Agenda     │  Estabelecimento activo: Salão Centro                         │
│ Disponib.  │──────────────────────────────────────────────────────────────│
│ Notificaç. │  RESUMO (semana = semana civil corrente)                       │
│ Estabelec. │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ (…)        │  │ Hoje        │ │ Esta semana│ │ Cancelamentos (semana)  │ │
│            │  │   6         │ │   28       │ │   2                     │ │
│            │  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│            │──────────────────────────────────────────────────────────────│
│            │  NO-SHOW (últimos 30 dias corridos)                             │
│            │  Taxa: 4,2%   (3 não compareceram / 71 confirmados no período) │
│            │  [Ver agenda — marcar concluído / no-show]                     │
│            │──────────────────────────────────────────────────────────────│
│            │  PRÓXIMO HORÁRIO LIVRE (próximos 7 dias)                         │
│            │  • Ana Silva      — Sex 14:30                                  │
│            │  • Bruno Costa    — (Sem horários livres nos próximos 7 dias)  │
│            │      [Abrir Disponibilidade →]                                 │
│            │  • …                                                           │
│            │──────────────────────────────────────────────────────────────│
│            │  ALERTAS                                                       │
│            │  ⚠ Agendamentos confirmados sem profissional: 1  [Ver →]    │
│            │  ⚠ Conflitos pós-bloqueio (US-417) pendentes: 2     [Resolver →]│
│            │  ⚠ Falha definitiva — lembrete 2h: 1 agendamento   [Detalhe →] │
│            │──────────────────────────────────────────────────────────────│
│            │  PRÓXIMOS AGENDAMENTOS                                         │
│            │  Hoje 09:00  Corte    Ana     Maria Souza          [Abrir]     │
│            │  Hoje 11:00  Barba   Bruno   João Lima             [Abrir]     │
│            │  Amanhã 15:00 Manic. (—)    Carla Nunes            [Abrir]     │
│            │  …                                                             │
│            │  [ Ver agenda completa ]                                       │
│            │──────────────────────────────────────────────────────────────│
│            │  ATALHOS                                                       │
│            │  [ Agenda ]  [ Disponibilidade ]  [ Notificações ]  [ Setup ] │
│            │  [ Pré-visualizar página pública ]                             │
└────────────┴──────────────────────────────────────────────────────────────┘
```

**Notas de comportamento**

- **Estabelecimento ▼** — [US-102](../../USER_STORIES.md); ao mudar, todos os blocos actualizam.
- **Cancelamentos (semana)** — só semana corrente ([US-101](../../USER_STORIES.md)).
- **No-show** — janela fixa 30 dias; denominador = confirmados no período; numerador = `no_show` no período ([US-104](../../USER_STORIES.md)).
- **Próximo horário livre** — horizonte 7 dias; linha sem slot mostra mensagem + botão para módulo 04 ([US-105](../../USER_STORIES.md)).
- **Alertas** — sem profissional só `confirmed` ([US-106](../../USER_STORIES.md)); conflitos só pendentes pós-[US-417](../../../04-availability/USER_STORIES.md) ([US-107](../../USER_STORIES.md)); notificação só falha definitiva **lembrete 2h** ([US-108](../../USER_STORIES.md)).
- **Próximos agendamentos** — colunas obrigatórias quando há dados; `(—)` no profissional quando vazio e coerente com alerta ([US-103](../../USER_STORIES.md)).

---

## Variante: nenhum slot em nenhum profissional

```
│            │  PRÓXIMO HORÁRIO LIVRE (próximos 7 dias)                         │
│            │  Não há horários livres nos próximos 7 dias para este negócio. │
│            │  [ Abrir Disponibilidade para ajustar regras ]                   │
```

---

## Referência cruzada

- Passo a passo narrativo: [step-by-step.md](../../step-by-step.md)
