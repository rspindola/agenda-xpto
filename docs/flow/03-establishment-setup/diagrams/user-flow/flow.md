# Setup - User Flows

## Fluxo A - Configuracoes

# 02-Config — Fluxo de Usuário

```mermaid
flowchart TD
    Start([Usuário após login]) --> Dashboard["📊 Dashboard"]
    Dashboard --> NavConfig["Clica em<br/>Configurações"]
    
    NavConfig --> ConfigPage{Qual config?}
    
    ConfigPage -->|Básico| BasicConfig["📝 Configuração Básica"]
    BasicConfig --> Form1["Preencher:<br/>- Nome estabelecimento<br/>- Slug único<br/>- Telefone<br/>- Endereço"]
    Form1 --> Validate1{Dados válidos<br/>e slug único?}
    Validate1 -->|Não| Error1["❌ Erro de validação"]
    Error1 --> Form1
    Validate1 -->|Sim| SaveBasic["Salvar em database"]
    SaveBasic --> Success1["✅ Configurações salvas"]
    Success1 --> ConfigPage
    
    ConfigPage -->|Horários| HoursConfig["🕐 Horário de Funcionamento"]
    HoursConfig --> WeekForm["Selecionar dias da semana"]
    WeekForm --> TimeForm["Definir:<br/>- Hora abertura<br/>- Hora fechamento<br/>- Intervalo almoço"]
    TimeForm --> ValidateTime{Horários válidos?}
    ValidateTime -->|Não| ErrorTime["❌ Hora inválida"]
    ErrorTime --> TimeForm
    ValidateTime -->|Sim| SaveHours["Salvar blocos<br/>de disponibilidade"]
    SaveHours --> Success2["✅ Horários salvos"]
    Success2 --> ConfigPage
    
    ConfigPage -->|Feriados| HolidaysConfig["🗓️ Feriados e Suspensões"]
    HolidaysConfig --> HolidayList["Ver feriados:<br/>- Data<br/>- Motivo<br/>- Opções editar/remover"]
    HolidayList --> AddHoliday{Ação?}
    AddHoliday -->|Adicionar| AddForm["Data + Descrição"]
    AddForm --> SaveHoliday["Criar holiday"]
    SaveHoliday --> Success3["✅ Feriado adicionado"]
    Success3 --> HolidayList
    
    AddHoliday -->|Editar| EditForm["Modificar data/descrição"]
    EditForm --> UpdateHoliday["Atualizar"]
    UpdateHoliday --> Success4["✅ Feriado atualizado"]
    Success4 --> HolidayList
    
    AddHoliday -->|Remover| DeleteHoliday["Confirmar exclusão"]
    DeleteHoliday --> Success5["✅ Feriado removido"]
    Success5 --> HolidayList
    
    HolidayList --> ConfigPage
    
    ConfigPage -->|Integração| IntegrationConfig["🔗 Integração"]
    IntegrationConfig --> IntChoice{Qual?}
    IntChoice -->|WhatsApp| GoWhatsApp["Ir para 06-WhatsApp"]
    IntChoice -->|Calendário| CalendarSetup["Ir para future module"]
    
    ConfigPage -->|Voltar| BackToDash["Voltar ao Dashboard"]
    BackToDash --> Dashboard
    
    Success1 --> NextStep["Via onboarding:<br/>Próximo: 03-Services"]
    Success2 --> NextStep
    NextStep --> End([Continuar configuração])
```

**Decisões Principais:**
- Slug deve ser único e immutável (chave de URL pública)
- Horários são blocos repetiveis (segunda tem x, terça tem y, etc.)
- Feriados são exceções (remove horários normais daquele dia)
- Validações de horário: abertura < fechamento, intervalo válido

**Validações Críticas:**
- ✅ Slug: apenas letras, números, hífen (regex)
- ✅ Telefone: formato válido
- ✅ Horários: não podem ser negativos ou invertidos
- ✅ Feriados: data futura (ou atual para hoje)

---

## Fluxo B - Servicos e profissionais

# 03-Services — Fluxo de Usuário

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> Services["Clica em<br/>Serviços & Profissionais"]
    
    Services --> ServicesPage["📋 Gerenciar Serviços<br/>e Profissionais"]
    
    ServicesPage --> NavChoice{Qual aba?}
    
    NavChoice -->|Serviços| ServicesList["📌 Lista de Serviços"]
    ServicesList --> ServiceAction{Ação?}
    
    ServiceAction -->|Adicionar| AddService["Preencher:<br/>- Nome<br/>- Duração<br/>- Preço<br/>- Descrição"]
    AddService --> ValidateService{Dados válidos?}
    ValidateService -->|Não| ErrorServ["❌ Erro de validação"]
    ErrorServ --> AddService
    ValidateService -->|Sim| SaveService["Salvar serviço"]
    SaveService --> SuccessService["✅ Serviço criado"]
    SuccessService --> ServicesList
    
    ServiceAction -->|Editar| EditService["Modificar serviço"]
    EditService --> UpdateService["Atualizar"]
    UpdateService --> SuccessService
    
    ServiceAction -->|Deletar| DeleteService["Confirmar exclusão"]
    DeleteService --> CheckDeps{Serviço está em<br/>agendamentos?}
    CheckDeps -->|Sim| CantDelete["⚠️ Não pode deletar<br/>(há agendamentos)"]
    CantDelete --> ServicesList
    CheckDeps -->|Não| DeletedService["Removido"]
    DeletedService --> ServicesList
    
    NavChoice -->|Profissionais| ProfList["👤 Lista de Profissionais"]
    ProfList --> ProfAction{Ação?}
    
    ProfAction -->|Adicionar| AddProf["Preencher:<br/>- Nome<br/>- Email<br/>- Telefone"]
    AddProf --> ValidateProf{Dados válidos?}
    ValidateProf -->|Não| ErrorProf["❌ Erro de validação"]
    ErrorProf --> AddProf
    ValidateProf -->|Sim| SaveProf["Salvar profissional"]
    SaveProf --> AssignServices["✨ Atribuir serviços"]
    AssignServices --> SelectServices["Selecionar serviços<br/>que profissional oferece"]
    SelectServices --> SaveAssign["Salvar atribuições"]
    SaveAssign --> SuccessProf["✅ Profissional criado"]
    SuccessProf --> ProfList
    
    ProfAction -->|Editar| EditProf["Modificar dados"]
    EditProf --> ManageServices["Gerenciar serviços<br/>do profissional"]
    ManageServices --> UpdateProf["Atualizar"]
    UpdateProf --> SuccessProf
    
    ProfAction -->|Deletar| DeleteProf["Confirmar exclusão"]
    DeleteProf --> CheckProfDeps{Profissional está em<br/>agendamentos?}
    CheckProfDeps -->|Sim| CantDeleteProf["⚠️ Não pode deletar<br/>(há agendamentos)"]
    CantDeleteProf --> ProfList
    CheckProfDeps -->|Não| DeletedProf["Removido"]
    DeletedProf --> ProfList
    
    ServicesList --> NavChoice
    ProfList --> NavChoice
    
    NavChoice -->|Voltar| BackDash["Voltar ao Dashboard"]
    BackDash --> End([Continuar])
    
    style ServicesList fill:#e1f5ff
    style ProfList fill:#f3e5f5
```

**Decisões Principais:**
- Serviço = oferecimento genérico (não atrelado a pessoa)
- Profissional = pessoa que oferece serviços
- N:N = Um profissional pode oferecer múltiplos serviços
- Não deletar: soft delete ou constraint para preservar histórico
- Disponibilidade: pode ser por serviço + profissional ou só por profissional

**Validações Críticas:**
- ✅ Duração > 0 minutos
- ✅ Preço ≥ 0
- ✅ Email de profissional único (opcional)
- ✅ Nome não vazio

---

## Fluxo C - Workers assincronos

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
