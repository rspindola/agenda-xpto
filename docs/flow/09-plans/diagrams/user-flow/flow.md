# 10-Plans — Fluxo

## User Flow

```mermaid
flowchart TD
    Start([Usuário]) --> PlansPage["💳 Planos & Subscrição"]
    PlansPage --> ViewPlans["Ver planos disponíveis:<br/>- Trial (500 créditos)<br/>- Starter (1500 créditos)<br/>- Pro (8000 créditos)<br/>- Business (30000 créditos)"]
    
    ViewPlans --> CurrentPlan["Plano atual: Starter"]
    CurrentPlan --> Action{Qual ação?}
    
    Action -->|Upgrade| SelectNewPlan["Selecionar novo plano"]
    SelectNewPlan --> Pricing["Ver preço:<br/>Starter: R$ 49/mês<br/>Pro: R$ 99/mês<br/>Business: R$ 199/mês"]
    Pricing --> Checkout["Ir para Stripe"]
    Checkout --> Payment["Completar pagamento"]
    Payment --> Updated["✅ Plano atualizado"]
    Updated --> PlansPage
    
    Action -->|Downgrade| DowngradeConfirm["Confirmar downgrade"]
    DowngradeConfirm --> BeCareful["⚠️ Você perderá<br/>créditos excedentes"]
    BeCareful --> Downgraded["Plano reduzido"]
    Downgraded --> PlansPage
    
    Action -->|Cancel| CancelSub["Cancelar subscrição"]
    CancelSub --> ConfirmCancel["Confirmar"]
    ConfirmCancel --> Cancelled["❌ Subscrição cancelada<br/>Plano volta para Trial"]
    Cancelled --> PlansPage
    
    PlansPage --> End([Voltar])
```

## Wireframes

```
┌─────────────────────────────────────────────────────────┐
│  Planos & Subscrição                       [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sua Subscrição Atual                                   │
│  ╔═════════════════════════════════════════════════╗   │
│  ║ 🟢 Starter — R$ 49/mês                         ║   │
│  ║                                                 ║   │
│  ║ ✅ 1.500 créditos/mês                           ║   │
│  ║ ✅ Agendamentos ilimitados                      ║   │
│  ║ ✅ Até 3 profissionais                          ║   │
│  ║ ✅ Lembretes automáticos                        ║   │
│  ║ ✅ Dashboard básico                             ║   │
│  ║                                                 ║   │
│  ║ Próxima renovação: 18/06/2026                   ║   │
│  ║ [ Cancelar Subscrição ]                         ║   │
│  ╚═════════════════════════════════════════════════╝   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Outros Planos Disponíveis                              │
│                                                         │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ 🆓 Trial         │ │ 💎 Pro           │             │
│  │ (Upgrade Plan)   │ │ R$ 99/mês        │             │
│  │                  │ │                  │             │
│  │ 500 créditos     │ │ 8.000 créditos   │             │
│  │ [ Manter ]       │ │ [ Upgrade ]      │             │
│  └──────────────────┘ └──────────────────┘             │
│                                                         │
│  ┌──────────────────┐                                   │
│  │ 🏢 Business      │                                   │
│  │ R$ 199/mês       │                                   │
│  │                  │                                   │
│  │ 30.000 créditos  │                                   │
│  │ [ Upgrade ]      │                                   │
│  └──────────────────┘                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ SUBSCRIPTIONS : has
    
    SUBSCRIPTIONS {
        uuid id PK
        uuid tenant_id FK "unique"
        enum plan_type "trial, starter, pro, business"
        integer credits_per_month
        decimal price_cents_monthly
        string stripe_subscription_id
        enum status "active, cancelled, past_due"
        timestamp billing_cycle_start
        timestamp billing_cycle_end
        timestamp cancellation_date
        timestamp created_at
        timestamp updated_at
    }
```
