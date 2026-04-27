# 07 — Notificações: passo a passo

Fluxos de disparo por tipo, retry e tratamento de falha. Complementa as [USER_STORIES](./USER_STORIES.md).

---

## Convenções

- **Fila/worker:** envios são processados de forma assíncrona (fila ou worker), salvo observação explícita.
- **Tentativas:** até 3, com espera **1 min → 5 min → 15 min** (ajustável por ambiente) entre falhas consecutivas.
- **Estado da notificação:** ver [diagrams/state-diagram/states.md](./diagrams/state-diagram/states.md).

---

## 1. Confirmação de agendamento (imediato)

1. API conclui criação do agendamento (`confirmado` para o cliente).
2. Sistema cria registro de notificação tipo `BOOKING_CONFIRMATION` em estado **pendente**.
3. Worker envia e-mail via provedor.
4. **Sucesso:** estado **enviada**; fim.
5. **Falha recuperável:** agendar **retry 1** após 1 min → em nova falha, **retry 2** após 5 min → em nova falha, **retry 3** após 15 min.
6. **Falha definitiva** após 3 falhas: estado **falha_definitiva**; **apenas log** (sem e-mail ao dono).

---

## 2. Lembrete 24 horas antes

1. Scheduler ou job recorrente identifica agendamentos **confirmados** cuja janela de disparo (ex.: entre T−24h e T−24h+δ) ainda não recebeu este lembrete.
2. Cria notificação `REMINDER_24H` **pendente**.
3. Mesmo ciclo de envio e retry da seção 1.
4. **Falha definitiva:** **somente log**; **não** notificar o dono.

**Cancelamento do job:** se o agendamento passar a **cancelado** ou **concluído** antes do envio, o lembrete é **cancelado/suprimido** (não enviar).

---

## 3. Lembrete 2 horas antes

1. Idem ao 24h, com janela centrada em T−2h e tipo `REMINDER_2H`.
2. Retry idêntico.
3. **Falha definitiva:** **log** + **e-mail ao dono** (alerta de falha no lembrete crítico), com identificação do agendamento para ação manual se necessário.

---

## 4. Confirmação de cancelamento (cliente)

1. Após persistir **cancelado** no agendamento originado pelo link do cliente.
2. Enfileira `CANCEL_CONFIRM_CLIENT` com retry silencioso.
3. **Falha definitiva:** apenas log (sem cascata de alerta ao dono por este e-mail).

---

## 5. Notificação ao dono — cliente cancelou

1. Em paralelo ou sequência logo após o cancelamento válido (ordem relativa ao e-mail do cliente não precisa bloquear um ao outro).
2. Tipo `OWNER_CANCELLED_BY_CLIENT`; retry silencioso.
3. **Falha definitiva:** log; dono pode não ser avisado — operação aceita risco documentado ou fila de “dead letter” para suporte interno.

---

## Fluxo de retry (genérico)

```text
pendente → tentativa_1
  ├─ sucesso → enviada
  └─ falha → aguarda Δ1 → tentativa_2
        ├─ sucesso → enviada
        └─ falha → aguarda Δ2 → tentativa_3
              ├─ sucesso → enviada
              └─ falha → falha_definitiva (+ ações por tipo: log / e-mail dono)
```

Durante retries, o estado pode ser modelado como **falha** intercalada com reagendamento; o diagrama de estados consolida a visão lógica.

---

## Idempotência e duplicidade

- Chave única por tipo + agendamento + janela temporal (ex.: `REMINDER_24H` + `appointment_id` + data do slot) evita envio duplicado do mesmo lembrete.
- Reprocessamento seguro do worker não deve gerar segundo e-mail de confirmação para o mesmo `notification_id`.
