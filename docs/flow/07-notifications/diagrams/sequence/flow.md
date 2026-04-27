# 07 — Diagrama de sequência: disparo de notificação com retry

Fluxo genérico de envio assíncrono com falha transitória e política de falha definitiva. A decisão de **alertar ou não o dono** ocorre no worker conforme o **tipo** da notificação (ver [USER_STORIES.md](../../USER_STORIES.md)).

```mermaid
sequenceDiagram
    participant API as API Agendamentos
    participant DB as Banco de dados
    participant Q as Fila de notificacoes
    participant W as Worker de e-mail
    participant ESP as Provedor de e-mail
    participant LOG as Log estruturado
    participant OWN as E-mail do dono

    API->>DB: Persiste agendamento confirmado
    API->>DB: Insere notificacao status pendente
    API->>Q: Enfileira notification_id
    API-->>API: Resposta HTTP 200 sem esperar ESP

    Q->>W: Entrega job
    W->>DB: Carrega notificacao e template
    W->>ESP: Enviar e-mail tentativa N

    alt Sucesso
        ESP-->>W: 2xx aceito
        W->>DB: Atualiza notificacao para enviada
    else Falha recuperavel
        ESP-->>W: Erro temporario ou timeout
        W->>LOG: Registra falha tentativa N
        W->>DB: Atualiza falha ou proximo_retry_em
        W->>Q: Reagendar com backoff exponencial
        Note over Q,W: Ate 3 tentativas 1min 5min 15min
    end

    Note over W,OWN: Apos esgotar retries W atualiza falha_definitiva<br/>registra log e se tipo REMINDER_2H envia alerta ao dono
```

**Notas:**

- Para `BOOKING_CONFIRMATION`, `REMINDER_24H`, `CANCEL_CONFIRM_CLIENT` e `OWNER_CANCELLED_BY_CLIENT`, o bloco `opt Apenas se tipo REMINDER_2H` **não** executa: apenas log na falha definitiva (conforme política acordada).
- A API de cancelamento segue padrão análogo: persistência → notificações enfileiradas → workers independentes.
