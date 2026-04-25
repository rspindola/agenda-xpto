# 08-FAQ — Fluxo / Estados / Wireframes / ERD

## User Flow

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> FAQ["📚 Knowledge Base (FAQ)"]
    FAQ --> ListPage["Lista de FAQs"]
    ListPage --> Action{Ação?}
    
    Action -->|Adicionar| AddFAQ["Preencher:<br/>- Pergunta<br/>- Resposta<br/>- Categoria"]
    AddFAQ --> GenerateEmbed["Sistema gera embedding<br/>(OpenAI text-embedding-3-small)"]
    GenerateEmbed --> StorePgVector["Armazenar em pgvector<br/>(PostgreSQL)"]
    StorePgVector --> SavedFAQ["✅ FAQ adicionado"]
    SavedFAQ --> ListPage
    
    Action -->|Editar| EditFAQ["Modificar conteúdo"]
    EditFAQ --> RegenerateEmbed["Regenerar embedding"]
    RegenerateEmbed --> SavedFAQ
    
    Action -->|Deletar| DeleteFAQ["Remover FAQ"]
    DeleteFAQ --> SavedFAQ
    
    ListPage --> UsageStats["Ver estatísticas:<br/>- Vezes citado no RAG<br/>- Relevância<br/>- Data criação"]
    
    UsageStats --> RAGIntegration["📍 Integração com RAG:<br/>Quando LLM processa<br/>mensagem do cliente,<br/>busca top-3 FAQs"]
    
    RAGIntegration --> End([Voltar])
```

## ERD

```mermaid
erDiagram
    TENANTS ||--o{ KNOWLEDGE_DOCUMENTS : owns
    
    KNOWLEDGE_DOCUMENTS {
        uuid id PK
        uuid tenant_id FK
        string title "pergunta"
        text content "resposta"
        string category "ex: serviços, horários"
        vector embedding "pgvector"
        integer usage_count "vezes retornado no RAG"
        float relevance_score "0-1"
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }
```

## Wireframes

```
┌─────────────────────────────────────────────────────────┐
│  Knowledge Base                            [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│             [ + Adicionar FAQ ]                        │
│                                                         │
│  FAQs Cadastradas:                                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ❓ Qual é o valor do corte masculino?           │  │
│  │ Resposta: O corte masculino custa R$ 35...      │  │
│  │ Categoria: Serviços                              │  │
│  │ Usado: 23 vezes | Score: 0.92                   │  │
│  │ [Editar] [Deletar]                               │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ❓ Qual é o horário de funcionamento?           │  │
│  │ Resposta: Abrimos de seg-sex 9h-18h...          │  │
│  │ Categoria: Horários                              │  │
│  │ Usado: 45 vezes | Score: 0.98                   │  │
│  │ [Editar] [Deletar]                               │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> ViewingFAQs
    ViewingFAQs --> CreatingFAQ: Clica + Add
    CreatingFAQ --> Embedding: Submit
    Embedding --> Stored: Embedding calculado<br/>+ armazenado
    Stored --> ViewingFAQs
    
    ViewingFAQs --> EditingFAQ: Clica editar
    EditingFAQ --> Stored
    
    ViewingFAQs --> DeletingFAQ: Clica deletar
    DeletingFAQ --> Deleted: Removido
    Deleted --> ViewingFAQs
```
