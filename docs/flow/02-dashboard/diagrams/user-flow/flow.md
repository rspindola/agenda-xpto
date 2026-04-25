# 00-Dashboard — Fluxo / Wireframes / Estados / Sequência / ERD

## User Flow

```mermaid
flowchart TD
    Start([Usuário faz login]) --> Dashboard["📊 Dashboard Principal"]
    Dashboard --> Overview["🏠 Visão Geral"]
    Overview --> Content["Exibir:<br/>- Próximos agendamentos<br/>- Estatísticas do mês<br/>- Créditos IA restantes<br/>- Plano ativo"]
    
    Content --> Sidebar["Navegação Lateral"]
    Sidebar --> Menu1["📋 Agendamentos"]
    Sidebar --> Menu2["📱 WhatsApp"]
    Sidebar --> Menu3["⚙️ Configurações"]
    Sidebar --> Menu4["💰 Créditos/Plano"]
    Sidebar --> Menu5["📊 Relatórios"]
    Sidebar --> Menu6["📚 FAQ"]
    Sidebar --> Menu7["💼 Afiliados"]
    
    Menu1 --> Route1["→ 05-Appointments"]
    Menu2 --> Route2["→ 06-WhatsApp"]
    Menu3 --> Route3["→ 02-Config + 03-Services"]
    Menu4 --> Route4["→ 07-IA-Credits + 10-Plans"]
    Menu5 --> Route5["→ 09-Analytics"]
    Menu6 --> Route6["→ 08-FAQ"]
    Menu7 --> Route7["→ 11-Affiliates"]
    
    Dashboard --> Cards["📈 Cards de Métricas"]
    Cards --> Card1["🟢 Agendamentos<br/>esta semana"]
    Cards --> Card2["📱 Mensagens<br/>recebidas"]
    Cards --> Card3["💳 Créditos<br/>restantes"]
    Cards --> Card4["⭐ Taxa de<br/>no-show"]
    
    Dashboard --> Activity["📝 Atividade Recente"]
    Activity --> Recent["Últimas ações:<br/>- Agendamentos criados<br/>- Clientes adicionados<br/>- Créditos debitados"]
    
    Dashboard --> Logout["Clica Logout"]
    Logout --> End([Sessão encerrada])
```

## Wireframes

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard                          [👤 João Silva] [⊙ ⋮]  │
├─┬───────────────────────────────────────────────────────────┤
│ │ 📋 Agendamentos                                            │
│ │ 📱 WhatsApp                                                │
│ │ ⚙️ Configurações                                           │
│ │ 💰 Planos & Créditos                                       │
│ │ 📊 Relatórios                                              │
│ │ 📚 FAQ                                                     │
│ │ 💼 Afiliados                                               │
│ │ ⚙️ Minha Conta                                             │
│ │ 🚪 Sair                                                    │
│ └───────────────────────────────────────────────────────────┤
│                                                              │
│  Boas-vindas, João Silva! 👋                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 🟢 Próximos  │  │ 📱 Mensagens │  │ 💳 Créditos  │     │
│  │   Agendamen │  │   Recebidas  │  │   Restantes  │     │
│  │     15      │  │      234     │  │     450/500  │     │
│  │ esta semana │  │   este mês   │  │   (90%)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ⭐ Taxa      │  │ 📈 Revenue   │  │ 👥 Clientes  │     │
│  │   No-show    │  │   (Mês)      │  │   Ativos     │     │
│  │     2%       │  │   R$ 1.250   │  │     142      │     │
│  │  excelente!  │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📅 Próximos Agendamentos                                   │
│                                                              │
│  🟢 Amanhã 09:00 — João Silva — Corte Masculino            │
│  🟢 Amanhã 14:30 — Maria Silva — Barba                     │
│  🟢 Em 2 dias 10:00 — Carlos Santos — Combo                │
│  [ Ver Todos ]                                              │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📝 Atividade Recente                                       │
│                                                              │
│  18/05 14:32 — Agendamento criado (cliente: Ana)           │
│  18/05 13:15 — Créditos debitados (120 tokens)             │
│  18/05 09:00 — Agendamento concluído (João)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ DASHBOARD_METRICS : has
    TENANTS ||--o{ ACTIVITY_LOGS : generates
    
    DASHBOARD_METRICS {
        uuid id PK
        uuid tenant_id FK
        date metric_date
        integer appointments_confirmed
        integer appointments_cancelled
        integer appointments_noshow
        integer messages_received
        integer credits_used
        integer credits_remaining
        decimal revenue_generated
        integer active_clients
        timestamp created_at
        timestamp updated_at
    }
    
    ACTIVITY_LOGS {
        uuid id PK
        uuid tenant_id FK
        enum action "appointment_created, appointment_cancelled, credit_deducted, whatsapp_connected"
        json metadata "{appointmentId, creditsUsed, etc}"
        timestamp created_at
    }
```
