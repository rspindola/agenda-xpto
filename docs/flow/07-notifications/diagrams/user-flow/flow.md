# 07 — Diagrama de fluxo: notificações, gatilhos e retry

Visão em flowchart dos **gatilhos** por tipo de notificação, do **retry** em falha transitória e da **decisão** de alertar o dono quando o lembrete crítico (2h) falha de forma definitiva. Detalhe de sequência worker ↔ provedor: [sequence/flow.md](../sequence/flow.md). Política de produto: [USER_STORIES.md](../../USER_STORIES.md).

```mermaid
flowchart TD
    subgraph triggers [Gatilhos por tipo]
        T1[Agendamento criado e confirmado]
        T2[Scheduler: 24h antes do horario]
        T3[Scheduler: 2h antes do horario]
        T4[Cancelamento valido via link ou fluxo equivalente]
    end

    T1 --> J1[Enfileira BOOKING_CONFIRMATION]
    T2 --> J2[Enfileira REMINDER_24H]
    T3 --> J3[Enfileira REMINDER_2H]
    T4 --> J4[Enfileira CANCEL_CONFIRM_CLIENT]
    T4 --> J5[Enfileira OWNER_CANCELLED_BY_CLIENT]

    subgraph worker [Worker e provedor]
        J1 --> W[Worker processa job]
        J2 --> W
        J3 --> W
        J4 --> W
        J5 --> W
        W --> ESP[Tenta envio provedor email]
    end

    ESP --> OK{Sucesso 2xx}
    OK -->|Sim| DBOK[Atualiza notificacao enviada]
    OK -->|Nao| REC{Erro recuperavel}
    REC -->|Sim| RT[Log tentativa N]
    RT --> RQ[Reagenda fila backoff 1m 5m 15m]
    RQ --> W
    REC -->|Nao ou esgotou tentativas| FAIL[Estado falha definitiva + log]

    FAIL --> DEC{Tipo REMINDER_2H}
    DEC -->|Sim| OWN[E-mail alerta ao dono US-707]
    DEC -->|Nao| LOGONLY[Somente log US-707]
```

**Idempotência:** o alerta ao dono para falha definitiva do lembrete **2h** não deve duplicar para o mesmo evento de falha (US-703 / US-707).

**Resumo da política (após esgotar retries):**

| Tipo (conceitual) | Falha definitiva |
|-------------------|------------------|
| Confirmação de agendamento | Apenas log |
| Lembrete 24h | Apenas log |
| Lembrete 2h | Log + e-mail ao dono |
| Confirmação cancelamento cliente | Apenas log |
| Notificação ao dono (cliente cancelou) | Apenas log |

Parâmetros sugeridos: até **3 tentativas**, intervalos **1 min → 5 min → 15 min** (configurável por ambiente).
