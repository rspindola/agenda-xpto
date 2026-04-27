# Passo a passo — Planos, trial e limites (Módulo 09)

Documentação narrativa dos fluxos principais. Detalhe de aceite: [USER_STORIES.md](USER_STORIES.md). Modelo de negócio: [PRD §10](../../PRD.md).

---

## Regra canónica — Contagem mensal (Starter)

| Aspecto | Definição |
|---------|-----------|
| **O que conta** | Agendamentos **criados** no mês civil (data/hora de criação do registo). |
| **Timezone** | **Timezone do estabelecimento** a que o agendamento pertence (o mesmo usado na operação da agenda desse negócio). |
| **Reinício** | O contador **zera no dia 1** desse timezone (início do mês civil local do estabelecimento). |
| **Limite** | 100 criações no mês → bloqueio de **novos** agendamentos na **página pública** apenas; ver [US-116](USER_STORIES.md). |

**Nota:** A regra única “criados no mês civil” aplica-se a criações via **página pública** e via **painel**, salvo alteração explícita no PRD. Qualquer refinamento por estado (ex.: exclusão de cancelados) alinha ao motor de estados do [módulo 05 — Agendamentos](../05-appointments/USER_STORIES.md).

---

## Fluxo 1 — Onboarding trial → conversão

1. O Admin (`P1`) conclui cadastro e acesso ao painel ([módulo 01](../01-auth/USER_STORIES.md)).
2. O sistema coloca a conta em **trial Pro — 15 dias**, **sem cartão** ([US-111](USER_STORIES.md)).
3. No ecrã de plano / assinatura ([US-110](USER_STORIES.md)), vê dias restantes, limites Pro e mensagem de que o cartão só é pedido na conversão.
4. Aproximando-se do fim, recebe **alertas** no painel e por e-mail nos marcos definidos ([US-112](USER_STORIES.md)).
5. **Se converter:** escolhe Starter, Pro ou Business, introduz método de pagamento e confirma ([US-113](USER_STORIES.md)); passa a plano pago; limites do plano escolhido aplicam-se ([US-117](USER_STORIES.md)).
6. **Se não converter:** ao fim do 15.º dia, **downgrade automático para Starter**; continua a aceder ao painel com limites Starter; e-mail ou mensagem de transição; sem bloqueio total de conta (secção “Fim do trial sem conversão” em [USER_STORIES.md](USER_STORIES.md)).

---

## Fluxo 2 — Dono Starter aproxima-se do limite → upgrade

1. O Admin está em **Starter**; acompanha uso no mês no ecrã de plano ou widget associado ([US-110](USER_STORIES.md)).
2. Ao atingir **80** criações no mês (timezone do estabelecimento), surge **primeiro alerta** “faltam 20” ([US-114](USER_STORIES.md)).
3. Ao atingir **90**, surge **segundo alerta** “faltam 10” ([US-115](USER_STORIES.md)).
4. Ao atingir **100**, a **página pública** deixa de permitir **novos** agendamentos; no painel aparece aviso forte com **CTA de upgrade** ([US-116](USER_STORIES.md)); agendamentos já criados seguem normais.
5. O Admin inicia **upgrade** (ex.: para Pro), completa pagamento; **limites** do novo plano aplicam-se **de imediato**; bloqueio público é levantado se o novo plano for ilimitado em agendamentos ([US-117](USER_STORIES.md)).

---

## Fluxo 3 — Downgrade com conflito (hard gate + assistente)

1. O Admin pede **downgrade** (ex.: Pro → Starter ou Business → Pro) no ecrã de planos.
2. O sistema valida limites do **plano de destino** vs estabelecimentos activos e profissionais activos por estabelecimento.
3. **Se houver conflito** (ex.: 3 estabelecimentos e destino Starter com 1):
   - O fluxo **não conclui**; abre-se um **assistente** ([US-118](USER_STORIES.md)).
   - O assistente lista o que excede o teto e guia: **arquivar/desactivar** estabelecimentos até ao máximo permitido e/ou ajustar profissionais até ao teto; **dados preservados** (nada apagado por defeito).
4. Quando todos os requisitos estão cumpridos, o Admin **confirma** o downgrade.
5. **Facturação:** o novo preço / plano para efeitos de cobrança passa a aplicar-se no **próximo ciclo** de facturação (sem antecipar cobrança “nova” no meio do ciclo, salvo política comercial noutro documento).
6. **Limites:** as regras e validações do plano **mais baixo** aplicam-se **de imediato após a confirmação** (UI, criação de estabelecimentos, profissionais, e regras Starter de agendamentos mensais se o destino for Starter).
7. Confirmação por **e-mail** e estado actualizado no painel ([US-110](USER_STORIES.md)).

---

## Referências

- [USER_STORIES.md](USER_STORIES.md) — US-110 a US-119  
- [diagrams/user-flow/flow.md](diagrams/user-flow/flow.md) — visão em fluxograma  
- [diagrams/state-diagram/states.md](diagrams/state-diagram/states.md) — estados de subscrição e alertas Starter
