# 09-Relatorios-Análise — Fluxo

## User Flow

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> Analytics["📊 Relatórios & Análise"]
    Analytics --> ReportsPage["Dashboard de Análise"]
    
    ReportsPage --> Filters["Filtros:<br/>- Período (semana/mês/ano)<br/>- Profissional<br/>- Serviço"]
    
    Filters --> Reports{Qual relatório?}
    
    Reports -->|Agendamentos| ApptsReport["📅 Agendamentos<br/>- Total confirmados<br/>- Total cancelados<br/>- Taxa no-show<br/>- Duração média"]
    
    Reports -->|Receita| RevenueReport["💰 Receita<br/>- Total gerado<br/>- Por serviço<br/>- Por profissional<br/>- Ticket médio"]
    
    Reports -->|Clientes| ClientsReport["👥 Clientes<br/>- Novos clientes<br/>- Clientes recorrentes<br/>- Taxa de retenção<br/>- Clientes inativos"]
    
    Reports -->|IA| AIReport["🤖 Uso de IA<br/>- Mensagens processadas<br/>- Taxa de conversão<br/>- Créditos gastos<br/>- ROI da IA"]
    
    Reports -->|Profissionais| ProfReport["👨 Performance<br/>- Agendamentos por prof<br/>- Serviços mais<br/>- Avaliação/feedback"]
    
    ApptsReport --> Export["Opções:<br/>[ Exportar PDF ]<br/>[ Exportar CSV ]<br/>[ Imprimir ]"]
    RevenueReport --> Export
    ClientsReport --> Export
    AIReport --> Export
    ProfReport --> Export
    
    Export --> End([Voltar])
```

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ ANALYTICS_SNAPSHOTS : generates
    
    ANALYTICS_SNAPSHOTS {
        uuid id PK
        uuid tenant_id FK
        date snapshot_date
        enum period "day, week, month"
        integer total_appointments
        integer appointments_completed
        integer appointments_cancelled
        integer appointments_noshow
        decimal total_revenue_cents
        integer new_clients
        integer returning_clients
        integer credits_used_ia
        timestamp created_at
    }
```

## Wireframes

```
┌─────────────────────────────────────────────────────────┐
│  Relatórios & Análise                      [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Período: [Mês ▼] [Maio ▼] [2026 ▼]                    │
│                                                         │
│  📊 Resumo do Mês                                        │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ 📅 Appts     │ │ 💰 Receita   │ │ 👥 Clientes  │    │
│  │    245       │ │  R$ 8.575    │ │     89       │    │
│  │ ⬆️ +12% MoM  │ │ ⬆️ +18% MoM  │ │ ⬆️ +5% MoM   │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
│  📈 Gráficos de Tendência                               │
│                                                         │
│  Agendamentos diários:                                  │
│  10 │        ▁   ▂   ▃                                 │
│   8 │    ▃ ▄ █   █   █                                 │
│   6 │  ▂ █ █ █   █   █                                 │
│   4 │▁ █ █ █ █ ▂ █   █                                 │
│   2 │█ █ █ █ █ █ █ ▂ █                                 │
│   0 └─────────────────────────                         │
│     Seg Ter Qua Qui Sex Sab Dom                         │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  📋 Relatórios Disponíveis:                             │
│                                                         │
│  [ Agendamentos ]  [ Receita ]  [ Clientes ]           │
│  [ IA Usage ]      [ Profissionais ]                    │
│                                                         │
│  [ 📥 Exportar PDF ]  [ 📥 Exportar CSV ]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## State / Sequence

```mermaid
stateDiagram-v2
    [*] --> ViewingReports: Acessa Análise
    ViewingReports --> SelectingFilters: Escolhe período
    SelectingFilters --> LoadingData: Carregando dados
    LoadingData --> DisplayingReports: Renderiza gráficos
    DisplayingReports --> ViewingReports
    
    ViewingReports --> ExportingReport: Clica exportar
    ExportingReport --> Exported: Arquivo gerado
    Exported --> ViewingReports
```
