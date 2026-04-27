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
