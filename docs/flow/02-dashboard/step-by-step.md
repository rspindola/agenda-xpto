# Dashboard — passo a passo (dono)

O **dashboard** é a primeira página do painel administrativo depois do login. Mostra só dados do **estabelecimento activo**; se tiver vários negócios, o selector no topo define qual está em foco ([PRD §4.5](../../PRD.md), [US-102](USER_STORIES.md)).

---

## 1. Abrir o painel

1. O dono faz login ([módulo 01](../01-auth/USER_STORIES.md)).
2. O sistema redireciona para o **dashboard** do último estabelecimento usado ou do primeiro disponível.

**O que vê de imediato:**

- **Resumo:** agendamentos de **hoje**, total na **semana corrente**, **cancelamentos** registados na **semana corrente** ([US-101](USER_STORIES.md)).
- **Taxa de no-show** dos **últimos 30 dias corridos** (`no_show` / `confirmed` no período; ver [US-104](USER_STORIES.md)).
- **Próximo horário livre** por profissional nos **próximos 7 dias**; se não houver slots, mensagem e atalho para [Disponibilidade](../04-availability/step-by-step.md) ([US-105](USER_STORIES.md)).
- **Lista dos próximos agendamentos** com serviço, profissional, horário e cliente ([US-103](USER_STORIES.md)).
- **Alertas:** confirmados **sem profissional** ([US-106](USER_STORIES.md)); **conflitos pendentes** pós-[US-417](../04-availability/USER_STORIES.md) ([US-107](USER_STORIES.md)); **falha definitiva** só no lembrete de **2h** ([US-108](USER_STORIES.md)).

---

## 2. O que pode fazer *sem* sair do conceito de dashboard

- Mudar o **estabelecimento activo** e ver o ecrã actualizar ([US-102](USER_STORIES.md)).
- Ler resumos, percentagens e listas curtas.
- Clicar num **próximo agendamento** para ir ao detalhe/edição na **agenda** ([US-103](USER_STORIES.md), [US-503](../05-appointments/USER_STORIES.md)).
- Usar **atalhos** dos alertas e do bloco “sem slots” para abrir **Disponibilidade**, **Notificações** ou **Agenda** conforme o caso ([US-109](USER_STORIES.md)).

Não há no MVP gráficos de tendência, receita nem comparativos com outros períodos — isso fica para [relatórios](../08-reports/USER_STORIES.md).

---

## 3. Quando precisa de outro módulo

| Objetivo | Onde ir |
|----------|---------|
| Ver ou editar a **agenda** em calendário (dia/semana/mês), filtros, muitos eventos | [Agendamentos — calendário](../05-appointments/USER_STORIES.md) ([US-504](../05-appointments/USER_STORIES.md)) |
| Alterar **expediente**, disponibilidade por profissional, **bloqueios**, feriados, antecedência mínima | [Disponibilidade](../04-availability/USER_STORIES.md) |
| Rever **envios de e-mail**, retries, falhas (detalhe além do alerta de 2h) | [Notificações](../07-notifications/USER_STORIES.md) |
| Dados do negócio, serviços, profissionais, slug da **página pública** | [Setup do estabelecimento](../03-establishment-setup/USER_STORIES.md) |
| Testar o fluxo **como cliente** | [Página pública de agendamento](../06-public-booking-page/USER_STORIES.md) |

---

## 4. Boas práticas

- Abrir o painel no início do dia para bater o olho no **resumo**, nos **alertas** e nos **próximos horários livres** por profissional.
- Tratar primeiro **conflitos US-417** e **agendamentos sem profissional** — impacto directo na operação.
- Se aparecer **falha definitiva no lembrete de 2h**, considerar contacto manual ao cliente ([US-703](../07-notifications/USER_STORIES.md)).

---

## Layout do ecrã (referência visual)

A estrutura em blocos do ecrã está desenhada em [diagrams/wireframes/pages.md](diagrams/wireframes/pages.md) (wireframe ASCII). Não se usa imagem estática neste documento.
