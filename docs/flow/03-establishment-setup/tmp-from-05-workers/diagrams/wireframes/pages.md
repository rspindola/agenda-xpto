# 04-Workers — Wireframes

## Dashboard: Monitoramento de Workers

```
┌─────────────────────────────────────────────────────────┐
│  Monitoramento de Workers                  [🔄 Refresh]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Status Geral: 🟢 Operacional                           │
│                                                         │
│  Filas de Trabalho:                                     │
│                                                         │
│  📋 Fila de Lembretes                                   │
│     Pendentes: 234 | Processados: 12,456 | Falhados: 2 │
│     Taxa: 15 jobs/min | Latência média: 245ms           │
│                                                         │
│  💰 Fila de Créditos                                    │
│     Pendentes: 0 | Processados: 156 | Falhados: 0      │
│     Taxa: 1 job/hora | Última exec: há 23 min          │
│                                                         │
│  🔄 Fila de Status Auto-Update                          │
│     Pendentes: 45 | Processados: 8,234 | Falhados: 0   │
│     Taxa: 5 jobs/min | Latência média: 120ms            │
│                                                         │
│  🧹 Fila de Cleanup                                     │
│     Pendentes: 0 | Processados: 30 | Falhados: 0       │
│     Taxa: 1 job/dia | Última exec: ontem às 02:00       │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ❌ Jobs Falhados (DLQ)                                 │
│                                                         │
│  2 jobs na Dead Letter Queue:                           │
│  - reminder:24h (appointment_id: ...) — há 2 horas      │
│    Erro: SMS service timeout                            │
│  - credit:deduct (tenant_id: ...) — há 6 horas          │
│    Erro: Database connection failed                     │
│                                                         │
│  [ Tentar Novamente ]  [ Ver Detalhes ]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
