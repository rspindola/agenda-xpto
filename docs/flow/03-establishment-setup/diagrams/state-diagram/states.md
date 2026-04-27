# Setup - Diagramas de Estado

## Estados A - Configuracoes

# 02-Config — Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> ConfigPending: Tenant criado<br/>(após signup)
    
    ConfigPending --> BasicConfigForm: Acessa configurações<br/>básicas
    BasicConfigForm --> SettingBasic: Preenche dados
    SettingBasic --> ValidatingBasic: Submit form
    ValidatingBasic --> ValidError: Slug já existe<br/>ou inválido
    ValidError --> BasicConfigForm
    
    ValidatingBasic --> BasicConfigDone: Dados validados
    BasicConfigDone --> SavedBasic: Salvo em database
    SavedBasic --> PartiallyConfigured
    
    PartiallyConfigured --> HoursConfigForm: Configurar horários
    HoursConfigForm --> SelectingDays: Selecionar dias<br/>da semana
    SelectingDays --> SetTimes: Definir horários<br/>e intervalo
    SetTimes --> ValidatingTimes: Submit form
    ValidatingTimes --> TimeError: Horário inválido<br/>(abertura > fechamento)
    TimeError --> SetTimes
    
    ValidatingTimes --> TimesDone: Horários validados
    TimesDone --> SavedHours: Blocos de disponibilidade<br/>salvos
    SavedHours --> PartiallyConfigured2
    
    PartiallyConfigured2 --> HolidaysForm: Adicionar feriados
    HolidaysForm --> AddingHoliday: Preencher data<br/>+ descrição
    AddingHoliday --> ValidatingHoliday: Submit
    ValidatingHoliday --> HolidayError: Data inválida<br/>ou passada
    HolidayError --> AddingHoliday
    
    ValidatingHoliday --> HolidayDone: Feriado válido
    HolidayDone --> SavedHoliday: Salvo em database
    SavedHoliday --> PartiallyConfigured2
    
    PartiallyConfigured2 --> EditingHoliday: Clica editar<br/>feriado
    EditingHoliday --> UpdatingHoliday: Modificar
    UpdatingHoliday --> SavedHoliday
    
    PartiallyConfigured2 --> DeletingHoliday: Clica deletar<br/>feriado
    DeletingHoliday --> ConfirmDelete: Confirmação
    ConfirmDelete --> DeletedHoliday: Removido
    DeletedHoliday --> PartiallyConfigured2
    
    PartiallyConfigured2 --> Configured: Todas configurações<br/>obrigatórias done
    Configured --> Dashboard: Redirecionar para<br/>próxima etapa
    Dashboard --> [*]
    
    Configured --> EditingConfig: Usuário volta para<br/>editar config
    EditingConfig --> BasicConfigForm
    EditingConfig --> HoursConfigForm
    EditingConfig --> HolidaysForm
    
    note right of ConfigPending
      Tenant não pode prosseguir
      sem config básica
    end note
    
    note right of Configured
      Tenant agora pode ir para
      03-Services para criar
      serviços e profissionais
    end note
```

## Estados de Validação de Formulários

```mermaid
stateDiagram-v2
    Idle --> FormOpen: Usuário clica<br/>editar/novo
    FormOpen --> Filled: Preenchendo dados
    
    Filled --> IsValid: User pressiona<br/>Enter/Submit
    
    IsValid --> ClientValidation: Zod validation
    ClientValidation --> ClientError: Erros encontrados
    ClientError --> Filled: Mostrar erros<br/>inline
    
    ClientValidation --> Valid: Passou
    Valid --> SubmittingForm: Loading...
    
    SubmittingForm --> ServerValidation: Backend valida
    ServerValidation --> ServerError: Erro no servidor<br/>(ex: slug existe)
    ServerError --> Filled: Mostrar toast error
    
    ServerValidation --> SavedDB: Sucesso!<br/>Salvo no DB
    SavedDB --> Success: ✅ Toast + Reload
    Success --> Idle
    
    note right of ClientError
      Validação local é rápida
      (email format, slug regex, etc)
    end note
    
    note right of ServerError
      Validação servidor checa<br/>constraints únicos (slug, email)
    end note
```

---

## Estados B - Servicos e profissionais

# 03-Services — Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> ServicesList: Acessa Serviços
    
    ServicesList --> CreatingService: Clica + Novo
    CreatingService --> FillingService: Preencher form
    FillingService --> ValidatingService: Submit
    
    ValidatingService --> ServiceError: Duração/preço<br/>inválido
    ServiceError --> FillingService
    
    ValidatingService --> ServiceValid: Dados OK
    ServiceValid --> SavedService: Inserido em DB
    SavedService --> ServicesList
    
    ServicesList --> EditingService: Clica editar
    EditingService --> FillingService
    
    ServicesList --> DeletingService: Clica deletar
    DeletingService --> CheckActive: Tem<br/>agendamentos?
    CheckActive -->|Sim| CantDelete: ⚠️ Não pode
    CantDelete --> ServicesList
    CheckActive -->|No| DeletedService: Removido
    DeletedService --> ServicesList
    
    ServicesList --> ProfessionalsList: Aba Profissionais
    
    ProfessionalsList --> CreatingProf: Clica + Novo
    CreatingProf --> FillingProf: Preencher dados
    FillingProf --> SelectingServices: Escolher serviços<br/>que oferece
    SelectingServices --> ValidatingProf: Submit
    
    ValidatingProf --> ProfError: Email inválido<br/>ou nome vazio
    ProfError --> FillingProf
    
    ValidatingProf --> ProfValid: Dados OK
    ProfValid --> SavedProf: Inserido em DB<br/>+ N:N relationships
    SavedProf --> ProfessionalsList
    
    ProfessionalsList --> EditingProf: Clica editar
    EditingProf --> FillingProf
    EditingProf --> ManagingServices: Atualizar<br/>serviços
    ManagingServices --> SelectingServices
    
    ProfessionalsList --> DeletingProf: Clica deletar
    DeletingProf --> CheckProfActive: Tem<br/>agendamentos?
    CheckProfActive -->|Sim| CantDeleteProf: ⚠️ Não pode
    CantDeleteProf --> ProfessionalsList
    CheckProfActive -->|No| DeletedProf: Removido
    DeletedProf --> ProfessionalsList
    
    ProfessionalsList --> BackToDash: Voltar
    ServicesList --> BackToDash
    BackToDash --> [*]
    
    note right of SavedService
      Agora disponível para
      novos agendamentos
    end note
    
    note right of SavedProf
      Pode ser atribuído
      a agendamentos
    end note
```

## Estados de Operação de Serviços

```mermaid
stateDiagram-v2
    Active --> Editing: Usuário<br/>clica editar
    Editing --> Updated: Salva mudanças
    Updated --> Active
    
    Active --> MarkDeleting: Clica deletar<br/>sem agendamentos
    MarkDeleting --> Deleted
    
    Active --> Locked: Tem<br/>agendamentos<br/>futuros
    Locked --> CantDelete: Bloqueado
    
    note right of Active
      Serviço pode ser oferecido
      em novos agendamentos
    end note
    
    note right of Locked
      Soft delete ou
      archive recomendado
    end note
```

---

## Estados C - Workers assincronos

# 04-Workers — Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> Idle: Worker aguardando jobs
    
    Idle --> JobEnqueued: Job adicionado à fila<br/>BullMQ
    
    JobEnqueued --> Processing: Worker lê job<br/>da fila
    Processing --> Executing: Executando tarefa
    
    Executing --> Success: ✅ Job completado
    Success --> Completed: Remover da fila
    Completed --> Idle
    
    Executing --> Error: ❌ Erro durante<br/>execução
    
    Error --> RetryCheck: Tentativas<br/>restantes?
    RetryCheck -->|Sim (< 3)| Backoff: Aguardar com<br/>backoff exponencial
    Backoff --> JobEnqueued
    
    RetryCheck -->|Não (>= 3)| DeadLetter: Enviar para<br/>Dead Letter Queue
    DeadLetter --> Failed: 🔴 Job falhado
    Failed --> AlertOps: Notificar operações
    AlertOps --> Idle
    
    Processing --> Stalled: Job travou<br/>(timeout)
    Stalled --> ManualIntervention: Admin deve<br/>investigar
    ManualIntervention --> Idle
    
    note right of Processing
      Timeout = 30s
      (configurável)
    end note
    
    note right of DeadLetter
      Mantém histórico
      para análise e
      replay manual
    end note
```

## Estados de Retry

```mermaid
stateDiagram-v2
    Initial: Tentativa 1
    Retry1: Tentativa 2<br/>(delay = 2s)
    Retry2: Tentativa 3<br/>(delay = 4s)
    Failed: Failed
    
    Initial --> Error1: Erro
    Error1 --> Retry1
    
    Retry1 --> Error2: Erro
    Error2 --> Retry2
    
    Retry2 --> Error3: Erro
    Error3 --> Failed
    
    Initial --> Success
    Retry1 --> Success
    Retry2 --> Success
    
    note right of Retry1
      Backoff exponencial:
      base = 2s × attempt
    end note
```
