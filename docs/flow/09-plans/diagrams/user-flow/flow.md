# Módulo 09 — Planos: fluxo do utilizador (AgendaIA)

Visão resumida: trial Pro → uso → conversão ou Starter automático; Starter → alertas de volume → possível cap na página pública; upgrade e downgrade (com gate).

Detalhe: [USER_STORIES.md](../../USER_STORIES.md), [step-by-step.md](../../step-by-step.md), [states.md](../state-diagram/states.md).

---

## Planos (referência)

| Plano | Estabelecimentos | Profissionais | Agendamentos/mês |
|-------|------------------|----------------|------------------|
| Starter | 1 | até 2 | até 100 |
| Pro | até 3 | até 10 por estabelecimento | ilimitado |
| Business | até 10 | ilimitado | ilimitado |

Trial: **15 dias Pro**, sem cartão; cartão só na **conversão**. Fim do trial sem pagamento: **Starter automático**.

---

## Flowchart — trial, limite Starter, upgrade e downgrade

```mermaid
flowchart TD
  signup[Novo cadastro]
  signup --> trialPro[Trial Pro 15 dias sem cartao]
  trialPro --> uso[Uso do painel e agendamentos]
  uso --> alertasTrial{Alertas fim trial}
  alertasTrial --> uso
  uso --> fimTrial{Trial expirou}
  fimTrial -->|conversao com pagamento| planoPago[Plano pago escolhido]
  fimTrial -->|sem conversao| starterAuto[Starter automatico]
  starterAuto --> usoStarter[Operacao Starter]
  usoStarter --> contador{Criados no mes civil timezone estabelecimento}
  contador -->|menos de 80| usoStarter
  contador -->|80 a 89| warn80[Alerta painel faltam 20]
  contador -->|90 a 99| warn90[Alerta painel faltam 10]
  contador -->|100| capPublico[Bloqueio novos na pagina publica]
  warn80 --> usoStarter
  warn90 --> usoStarter
  capPublico --> ctaUpgrade[CTA upgrade no painel]
  uso --> mudancaPlano{Mudanca de plano}
  mudancaPlano -->|upgrade| payUp[Pagamento confirmado]
  payUp --> limitesUp[Limites novos imediatos]
  limitesUp --> uso
  mudancaPlano -->|downgrade| gate{Excede limites destino}
  gate -->|sim| assistente[Assistente hard gate arquivar ajustar]
  assistente --> gate
  gate -->|nao| confDown[Confirmar downgrade]
  confDown --> limitesDown[Limites destino imediatos]
  confDown --> billNext[Facturacao proximo ciclo]
  limitesDown --> uso
  billNext --> uso
  planoPago --> uso
```

---

## Notas de leitura do diagrama

- **Contador mensal:** zera no **dia 1** no timezone do estabelecimento; ver [step-by-step.md](../../step-by-step.md).
- **Upgrade:** após pagamento, **limites** imediatos; levantamento do cap público se o novo plano for ilimitado em agendamentos.
- **Downgrade:** **não** conclui com conflito; **assistente** até conformidade; **dados preservados**; cobrança ao novo tier no **próximo ciclo** após confirmação.

---

## Referências

- [USER_STORIES.md](../../USER_STORIES.md)  
- [step-by-step.md](../../step-by-step.md)  
- [states.md](../state-diagram/states.md)
