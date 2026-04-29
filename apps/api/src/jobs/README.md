# Jobs (BullMQ)

Planeado conforme `docs/flow/00-sustain/ARCHITECTURE.md` §7 (na raiz do monorepo):

## Fila `notifications`

- `confirmation-email` — após agendamento
- `reminder-24h` — 24h antes
- `reminder-2h` — 2h antes
- `cancellation-email` — após cancelamento
- `owner-cancellation` — alerta ao dono

## Fila `system`

- `reset-monthly-quota` — cron dia 1 (plano Starter)
- `trial-expiry` — verificação diária de trials

Retry: 3 tentativas, backoff exponencial (1m → 5m → 15m).
