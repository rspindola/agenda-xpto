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
