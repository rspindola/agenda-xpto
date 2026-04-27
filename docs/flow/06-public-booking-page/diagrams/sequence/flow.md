# 06 — Diagrama de sequência: página pública de agendamento

Fluxo ponta a ponta do cliente na página pública: resolução do estabelecimento, seleção de serviços e slots (com regras do módulo 04), confirmação com enfileiramento de notificações (módulo 07) e cancelamento via token. Estados do agendamento: ver [states.md](../state-diagram/states.md).

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API publica booking
    participant DB as Banco de dados
    participant M04 as Modulo 04 disponibilidade
    participant Q as Fila notificacoes m07

    Note over C,DB: 1 Landing por slug US-601
    C->>API: GET pagina publica slug
    API->>DB: Resolve estabelecimento por slug
    alt Slug valido e ativo
        DB-->>API: Dados publicos estabelecimento
        API-->>C: 200 nome foto endereco branding
    else Inativo ou inexistente
        API-->>C: 404 mensagem amigavel sem vazamento
    end

    Note over C,M04: 2 Servicos e slots US-602 a US-606
    C->>API: Selecao itens servicos combos
    API->>API: Calcula duracao total e preco
    C->>API: Caminho A profissional OU Caminho B data
    API->>M04: Consulta regras antecedencia feriados bloqueios
    API->>DB: Profissionais elegiveis e ou slots continuos
    M04-->>API: Janelas validas para bloco duracao total
    API-->>C: Slots disponiveis e ou lista profissionais

    Note over C,Q: 3 Confirmar agendamento US-607
    C->>API: POST agendamento dados cliente
    API->>DB: Valida concorrencia e antecedencia novamente
    alt Slot ainda livre
        API->>DB: Persiste confirmado cliente ve confirmado
        API->>Q: Enfileira confirmacao email
        API-->>C: 200 sucesso sem esperar provedor email
    else Slot ocupado
        API-->>C: 409 erro pedir nova escolha
    end

    Note over C,Q: 4 Cancelar via link US-608
    C->>API: GET POST cancelamento com token
    API->>DB: Valida token e estado confirmado
    alt Token valido e confirmado
        API->>DB: Estado cancelado slot liberado token invalidado
        API->>Q: Enfileira email cliente e notificacao dono
        API-->>C: 200 confirmacao UI explicita
    else Token invalido ou ja cancelado
        API-->>C: Mensagem adequada sem dados de terceiros
    end
```

**Notas:**

- O módulo **04** pode ser invocado como serviço interno da API (mesmo processo) ou como limites claros no diagrama; o importante é que **antecedência mínima**, **feriados**, **bloqueios** e **cálculo de intervalo contínuo** seguem as regras documentadas em `docs/flow/04-availability/`.
- Estado `pendente` é apenas **transitório e interno**; a resposta de sucesso ao cliente reflete **confirmado**, alinhado às USER_STORIES e ao [states.md](../state-diagram/states.md).
