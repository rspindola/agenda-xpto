# 07 — Wireframes ASCII: painel do dono — notificações e alertas

Telas ou secções do **painel autenticado** relacionadas a falhas críticas de notificação e, opcionalmente, histórico de envios. Base: [USER_STORIES.md](../../USER_STORIES.md) (US-707, US-703).

---

## 1. Dashboard — secção de alertas (falha crítica)

Referência de produto: **US-707** — alerta ao dono quando há **falha definitiva** no envio do **lembrete de 2h** (lembrete crítico).

```
+------------------------------------------------------------------+
|  Dashboard                                                       |
+------------------------------------------------------------------+
|  [!] ALERTA — Falha ao enviar lembrete de 2 horas                |
|      Agendamento #abc123 · 18/04 15:30 · Cliente: M*** S***      |
|      O cliente pode nao ter recebido o ultimo lembrete.          |
|      [ Ver na agenda ]    [ Marcar como visto ]                  |
+------------------------------------------------------------------+
|  ... resto do dashboard (resumo do dia, proximos agendamentos)   |
+------------------------------------------------------------------+
```

- Conteúdo mínimo identificável do agendamento, **sem** token completo ou dados excessivos (LGPD / US-707).
- Não exibir alerta deste tipo para falhas de confirmação inicial ou lembrete 24h.

---

## 2. Log de notificações (painel)

**UI opcional no MVP.** O sistema já exige **auditoria em log estruturado** (US-706); uma tela dedicada no painel pode vir em iteração posterior.

```
+------------------------------------------------------------------+
|  Notificacoes (opcional MVP)                                     |
+------------------------------------------------------------------+
|  Data/Hora       Tipo              Destinatario    Estado        |
|  17/04 10:01     Confirmacao       cli***@...     Enviada       |
|  17/04 09:58     Lembrete 24h      cli***@...     Retry         |
|  17/04 08:00     Lembrete 2h       cli***@...     Falhou        |
+------------------------------------------------------------------+
|  Filtros: [ Todos ] [ Falhas ] [ Ultimos 7 dias ]               |
+------------------------------------------------------------------+
```

Se o MVP não incluir esta página, operadores confiam em **logs técnicos** e no **alerta do dashboard** para o caso crítico (2h).
