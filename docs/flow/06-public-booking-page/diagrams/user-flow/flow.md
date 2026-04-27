# 06 — Fluxo do cliente na página pública

Diagrama unificado com **Caminho A** (padrão), **Caminho B** (alternativa) e reconvergência até a confirmação.

```mermaid
flowchart TD
    Start([Cliente acessa URL publica]) --> LoadPage[Carrega pagina do estabelecimento]
    LoadPage --> SelectItems[Seleciona servicos e ou combos<br/>Duracao total calculada]

    SelectItems --> ModeChoice{Modo de agendamento}

    ModeChoice -->|Padrao Caminho A| PathA[Escolhe profissional elegivel]
    PathA --> SlotsA[Escolhe data e horario<br/>slots com duracao total]

    ModeChoice -->|Alternar Caminho B| PathB[Escolhe data]
    PathB --> PathB2[Escolhe horario de inicio valido]
    PathB2 --> ListPro[Lista profissionais disponiveis no intervalo]
    ListPro --> PickPro[Escolhe profissional]

    SlotsA --> FormData[Preenche nome telefone email]
    PickPro --> FormData

    FormData --> Submit[Confirma agendamento]
    Submit --> ServerCheck{Servidor valida slot<br/>e antecedencia}
    ServerCheck -->|Falha| ErrorUI[Exibe erro pede novo horario ou profissional]
    ErrorUI --> ModeChoice
    ErrorUI --> SelectItems

    ServerCheck -->|Sucesso| Confirmed[Estado confirmado<br/>para cliente e dono]
    Confirmed --> EmailQueue[E-mail de confirmacao enfileirado]
    EmailQueue --> SuccessUI[Pagina de sucesso com resumo]

    SuccessUI --> End([Fim do fluxo web])

    subgraph cancel [Cancelamento posterior]
        LinkOpen([Cliente abre link de cancelamento]) --> ValidateToken{Token valido}
        ValidateToken -->|Nao| Deny[Mensagem segura]
        ValidateToken -->|Sim| ShowSum[Mostra resumo do agendamento]
        ShowSum --> ConfirmCancel[Cliente confirma cancelamento]
        ConfirmCancel --> Cancelled[Estado cancelado slot liberado]
        Cancelled --> Notifs[E-mails conforme modulo 07]
    end
```

**Legenda breve:**

- Antecedência mínima, feriados e bloqueios filtram slots em **SlotsA** e na escolha de horário em **PathB2**.
- O estado **`pendente` interno** não aparece neste fluxograma visível ao usuário; o nó **Confirmado** representa o que o cliente enxerga após sucesso.
