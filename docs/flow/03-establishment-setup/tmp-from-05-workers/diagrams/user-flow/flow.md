# 04-Workers — Fluxo de Usuário

```mermaid
flowchart TD
    Start([Sistema]) --> Worker["🔄 BullMQ Workers<br/>(background jobs)"]
    
    Worker --> ReminderWorker["⏰ Reminder Worker"]
    ReminderWorker --> Every5Min["Executa a cada 5 minutos"]
    Every5Min --> Query1["Buscar agendamentos<br/>com status='confirmed'"]
    Query1 --> Send24h["Enviar SMS 24h antes"]
    Send24h --> Log24h["Registrar reminder log"]
    Log24h --> Send2h["Enviar SMS 2h antes"]
    Send2h --> Log2h["Registrar reminder log"]
    
    Worker --> StatusWorker["🔄 Status Auto-Update"]
    StatusWorker --> Check["Após pass appointment_at<br/>+ 15 minutos"]
    Check --> CheckNoShow["Status still confirmed?"]
    CheckNoShow -->|Sim| NoShow["Marcar no-show"]
    NoShow --> NotifyAdmin["Notificar admin"]
    
    Worker --> CreditWorker["💰 Credit Deduction"]
    CreditWorker --> EveryHour["Executa a cada hora"]
    EveryHour --> SummarizeCredits["Resumir consumo<br/>de IA do período"]
    SummarizeCredits --> Debit["Deduct credits<br/>da quota"]
    Debit --> CheckQuota["Quota < min?"]
    CheckQuota -->|Sim| AlertTenant["🚨 Alerta tenant:<br/>créditos baixos"]
    
    Worker --> CleanupWorker["🧹 Cleanup"]
    CleanupWorker --> Daily["Executa 1x/dia (2h AM)"]
    Daily --> DeleteExpiredTokens["Deletar reset_tokens<br/>expirados"]
    DeleteExpiredTokens --> DeleteExpiredSessions["Deletar sessions<br/>expiradas"]
    DeleteExpiredSessions --> ArchiveOldLogs["Arquivar logs<br/>antigos"]
    
    Worker --> FailureHandling["❌ Error Handling"]
    FailureHandling --> Retry["Retry 3x com<br/>backoff exponencial"]
    Retry --> LogError["Registrar erro<br/>em log"]
    LogError --> AlertOps["Alerta ops se crítico"]
    
    Worker --> Monitoring["📊 Monitoring"]
    Monitoring --> QueueStatus["Status da fila"]
    Monitoring --> FailedJobs["Jobs falhados"]
    Monitoring --> PerformanceMetrics["Latência dos jobs"]
    
    style ReminderWorker fill:#e1f5ff
    style StatusWorker fill:#e1f5ff
    style CreditWorker fill:#fff3e0
```

**Responsabilidades Críticas:**
- Lembretes automáticos (24h + 2h)
- Auto-update de status para no-show
- Debitagem de créditos de IA
- Limpeza de dados expirados
- Logs e alertas

**Tecnologia:**
- BullMQ (Redis-backed queue)
- Retry com backoff exponencial
- Dead Letter Queue (DLQ) para falhas
