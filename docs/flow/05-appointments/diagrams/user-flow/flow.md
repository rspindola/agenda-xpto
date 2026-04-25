# 05-Appointments — Fluxo de Usuário

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> Appts["Clica em<br/>Agendamentos"]
    
    Appts --> ApptsPage["📅 Gerenciar Agendamentos"]
    
    ApptsPage --> FilterSection["Filtrar por:<br/>- Status<br/>- Data<br/>- Profissional"]
    FilterSection --> FilterApply["Aplicar filtros"]
    FilterApply --> ApptsList["📋 Lista de Agendamentos"]
    
    ApptsList --> ApptsAction{Ação?}
    
    ApptsAction -->|Ver detalhe| ViewDetail["Visualizar:<br/>- Cliente<br/>- Serviço<br/>- Data/Hora<br/>- Status<br/>- Link cancelamento"]
    ViewDetail --> ApptsList
    
    ApptsAction -->|Editar| EditAppt["Modificar:<br/>- Data/Hora<br/>- Profissional<br/>- Serviço"]
    EditAppt --> CheckSlot{Horário<br/>disponível?}
    CheckSlot -->|Não| SlotError["❌ Horário indisponível"]
    SlotError --> EditAppt
    CheckSlot -->|Sim| UpdateAppt["Atualizar agendamento"]
    UpdateAppt --> SendNotif["📱 Enviar notificação<br/>ao cliente"]
    SendNotif --> SavedEdit["✅ Agendamento atualizado"]
    SavedEdit --> ApptsList
    
    ApptsAction -->|Confirmar presença| MarkDone["Marcar como Concluído"]
    MarkDone --> CompletedAppt["✅ Status = Concluído"]
    CompletedAppt --> ApptsList
    
    ApptsAction -->|Marcar falta| MarkNoshow["Marcar como No-show"]
    MarkNoshow --> NoshowAppt["⚪ Status = No-show"]
    NoshowAppt --> ApptsList
    
    ApptsAction -->|Cancelar| CancelAppt["Cancelar agendamento"]
    CancelAppt --> AskReason["Motivo (opcional)?"]
    AskReason --> ConfirmCancel["Confirmar cancelamento"]
    ConfirmCancel --> SendCancelMsg["📱 Enviar confirmação<br/>de cancelamento"]
    SendCancelMsg --> CancelledAppt["❌ Status = Cancelado"]
    CancelledAppt --> ApptsList
    
    ApptsPage --> CalendarView["Ver agenda em<br/>vista de Calendário"]
    CalendarView --> CalendarMonth["Mês/Semana/Dia"]
    CalendarMonth --> ClickDay["Clica em dia"]
    ClickDay --> DayAppts["Agendamentos do dia"]
    DayAppts --> ApptsList
    
    ApptsPage --> PublicPageLink["🔗 Compartilhar link<br/>de agendamento público"]
    PublicPageLink --> CopyLink["Link copiado"]
    CopyLink --> ShareOptions["Compartilhar em:<br/>- WhatsApp<br/>- Email<br/>- Social media"]
    
    ApptsList --> BackDash["Voltar ao Dashboard"]
    BackDash --> End([Continuar])
    
    style ApptsList fill:#e1f5ff
    style CalendarView fill:#f3e5f5
```

**Decisões Principais:**
- Status: Confirmado, Cancelado, Concluído, No-show
- Editar apenas se não está em progresso
- Cancelamento deve notificar cliente
- Link público permite cliente clicar para ver slot
- Lembretes automáticos via BullMQ (24h + 2h antes)

**Validações Críticas:**
- ✅ Horário disponível (não conflita)
- ✅ Horário dentro de funcionamento
- ✅ Horário não é feriado
- ✅ Não editar agendamentos "em progresso" (< 15min)
