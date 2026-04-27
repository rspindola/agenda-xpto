# 05 — Agendamentos: diagrama de estados

Alinhado ao modelo do [módulo 06 — página pública](../../06-public-booking-page/diagrams/state-diagram/states.md): **`pendente` é apenas transitório e interno** (criação atômica); **o cliente vê `confirmado` imediatamente** após agendamento bem-sucedido. Lembretes e envio de e-mail são tratados no [módulo 07](../../07-notifications/USER_STORIES.md), não como estados do agendamento.

---

## Ciclo de vida do agendamento

| Estado | Visível ao cliente (página pública) | Notas |
|--------|-------------------------------------|--------|
| `pendente` (interno) | Não | Existe só durante o processamento da criação; não rotular na UI. |
| `confirmado` | Sim | Estado estável após sucesso; cancelamento via link e lembretes partem daqui. |
| `concluído` | Opcional / painel | Marcado no painel após atendimento. |
| `nao_compareceu` | Não (painel / dono) | Equivale ao fluxo operacional de no-show. |
| `cancelado` | Sim (após cancelar) | Cliente ou dono; slot liberado. |

```mermaid
stateDiagram-v2
    direction LR

    [*] --> PendenteInterno: Criacao do agendamento<br/>em andamento

    state "pendente (interno)" as PendenteInterno
    note right of PendenteInterno
        Nunca exibido ao cliente
        na UI publica
    end note

    PendenteInterno --> confirmado: Persistencia OK<br/>e regras validadas

    confirmado --> concluido: Dono marca<br/>atendimento concluido

    confirmado --> nao_compareceu: Passou janela<br/>operacional no-show

    PendenteInterno --> cancelado: Falha de negocio<br/>antes de sucesso ao cliente

    confirmado --> cancelado: Cliente link ou<br/>Dono no painel

    concluido --> [*]
    nao_compareceu --> [*]
    cancelado --> [*]
```

---

## Estados de slot de horário

```mermaid
stateDiagram-v2
    Available: 🟢 Disponível
    Booked: 🔴 Reservado
    Unavailable: ⚪ Indisponível

    Available --> Booked: Agendamento criado
    Booked --> Available: Agendamento cancelado
    Booked --> Completed: Agendamento concluído

    Available --> Unavailable: Feriado<br/>ou fechado
    Unavailable --> Available: Feriado removido<br/>ou reabre

    note right of Available
      Pode receber novo
      agendamento
    end note

    note right of Booked
      Ocupado por agendamento
      confirmado ou concluído
      até liberar slot
    end note

    note right of Unavailable
      Bloco de horário
      não disponível
    end note
```
