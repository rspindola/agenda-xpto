# 07-IA-Credits — Fluxo / Diagrama

## User Flow

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> Nav["💳 Créditos IA"]
    Nav --> CreditsPage["Página de Gerenciamento<br/>de Créditos"]
    
    CreditsPage --> Display["Exibir:<br/>- Créditos restantes<br/>- Créditos totais<br/>- Taxa de consumo"]
    Display --> Breakdown["Breakdown de uso:<br/>- WhatsApp: XX%<br/>- Web booking: XX%"]
    Breakdown --> History["Histórico de consumo:<br/>- Data<br/>- Ação<br/>- Créditos gastos"]
    
    History --> Action{Qual ação?}
    
    Action -->|Comprar Créditos| PurchasePage["Comprar créditos<br/>adicionais"]
    PurchasePage --> Pricing["Ver preços:<br/>- 100 = R$ 10<br/>- 500 = R$ 40<br/>- 1000 = R$ 70"]
    Pricing --> SelectPackage["Selecionar pacote"]
    SelectPackage --> Checkout["Ir para checkout<br/>(Stripe)"]
    Checkout --> Payment["Completar pagamento"]
    Payment --> Success["✅ Créditos adicionados"]
    Success --> CreditsPage
    
    Action -->|Ver Plano| ViewPlan["Ir para 10-Plans"]
    
    Action -->|Alertas| AlertConfig["Configurar alertas<br/>- Quando atingir XX%?"]
    AlertConfig --> CreditsPage
    
    Action -->|Voltar| Back["Voltar ao Dashboard"]
    Back --> End([Continuar])
```

## Wireframes

```
┌─────────────────────────────────────────────────────────┐
│  Créditos IA                               [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💳 Créditos Restantes                                  │
│                                                         │
│  ╔═════════════════════════════════════════════════╗   │
│  ║        450 de 500 créditos                      ║   │
│  ║        ████████████░░░ 90%                      ║   │
│  ║        R$ 44,50 / R$ 49,50                      ║   │
│  ║                                                 ║   │
│  ║  ⚠️ Aviso: Créditos acabando!                   ║   │
│  ║  Seu plano Starter reseta em 12 dias.          ║   │
│  ║                                                 ║   │
│  ║        [ Comprar mais créditos ]                ║   │
│  ╚═════════════════════════════════════════════════╝   │
│                                                         │
│  📊 Consumo deste Mês                                   │
│                                                         │
│  WhatsApp:      320 créditos (85%)  ██████████░        │
│  Web Booking:   30 créditos (15%)   ██░░░░░░░░          │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  📝 Histórico de Consumo                                │
│                                                         │
│  18/05 14:32  WhatsApp conversation     20 créditos    │
│  18/05 12:00  WhatsApp conversation     15 créditos    │
│  18/05 09:30  Web booking page          5 créditos     │
│                                                         │
│  [ Ver mais ]                                           │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [ 🔔 Configurar Alertas ]  [ 📊 Ver Plano ]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ CREDIT_LOGS : consumes
    TENANTS ||--o{ CREDIT_PURCHASES : buys
    
    CREDIT_LOGS {
        uuid id PK
        uuid tenant_id FK
        uuid resource_id FK "appointment_id ou null"
        enum action "whatsapp_conversation, web_booking, llm_query"
        integer credits_used
        integer tokens_used
        string model_used "groq, openai"
        timestamp created_at
    }
    
    CREDIT_PURCHASES {
        uuid id PK
        uuid tenant_id FK
        integer credits_purchased
        decimal amount_paid_cents
        enum status "pending, completed, failed"
        string stripe_payment_id
        timestamp completed_at
        timestamp created_at
    }
```
