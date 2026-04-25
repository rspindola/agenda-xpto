# 05-Appointments — Diagrama de Sequência

## Fluxo Crítico: Criar Agendamento via WhatsApp

```mermaid
sequenceDiagram
    actor Client as 👤 Cliente
    participant WA as 📱 WhatsApp Client
    participant EvAPI as 🔔 Evolution API
    participant Backend as 🚀 Backend API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 💾 Redis
    participant LLM as 🤖 Groq LLM
    participant Worker as ⚙️ BullMQ Worker
    participant Email as 📧 Email Service
    
    Client->>WA: "Quero agendar um corte"
    WA->>EvAPI: Enviar mensagem
    EvAPI->>Backend: POST /webhooks/whatsapp<br/>{sender, text, timestamp}
    
    Backend->>DB: SELECT session FROM chat_sessions<br/>WHERE tenant_id=? AND sender=?
    alt Session não existe
        DB-->>Backend: null
        Backend->>DB: INSERT INTO chat_sessions
        Backend->>Cache: SET session_context
    else Session existe
        DB-->>Backend: session
        Backend->>Cache: GET session_context
    end
    
    Backend->>LLM: POST /chat<br/>{messages, context, system_prompt}
    LLM->>LLM: Processar com RAG<br/>(buscar FAQ)
    LLM-->>Backend: {response, intent, entities}
    
    alt Intent = SCHEDULE
        Backend->>DB: Extrair entities<br/>(serviço, data, hora)
        Backend->>Backend: Gerar lista de slots<br/>disponíveis
        Backend->>EvAPI: Enviar opções<br/>de horários
    else Intent = CONFIRM
        Backend->>DB: Validar slot<br/>disponível
        Backend->>DB: INSERT INTO appointments<br/>(status=pending)
        DB-->>Backend: Appointment created
        
        Backend->>DB: UPDATE chat_sessions<br/>SET appointment_id=?
        Backend->>Cache: DEL session:{tenant_id}:{sender}
        
        Backend->>Backend: Decrementar credits
        Backend->>DB: INSERT INTO credit_logs
        
        Backend->>Worker: Enqueue job:<br/>- Lembrete 24h<br/>- Lembrete 2h<br/>- Auto-update status
        
        Backend->>EvAPI: Enviar confirmação<br/>"Agendado para 18/05 09:00"
        Backend->>Email: Enviar confmação<br/>para cliente
        
    else Intent = CANCEL
        Backend->>DB: Find appointment<br/>by cancel_token
        Backend->>DB: UPDATE appointments<br/>SET status='cancelled'
        Backend->>Worker: Remove reminder jobs
        Backend->>EvAPI: Enviar confirmação<br/>de cancelamento
    end
    
    Backend-->>EvAPI: Response 200 OK
    EvAPI-->>Client: Mensagem de resposta
```

## Fluxo: Processar Lembretes Automáticos

```mermaid
sequenceDiagram
    participant Scheduler as ⏰ Scheduler<br/>(cron 5min)
    participant Worker as ⚙️ BullMQ Worker
    participant DB as 🗄️ PostgreSQL
    participant EvAPI as 🔔 Evolution API
    participant SMS as 📱 SMS Service
    
    Scheduler->>Worker: Rodar job<br/>"process-reminders"
    
    Worker->>DB: SELECT appointments WHERE<br/>status='confirmed'<br/>AND appointment_at BETWEEN<br/>NOW()+24h AND NOW()+24h+5min
    DB-->>Worker: List[appointments]
    
    loop Cada appointment em 24h
        Worker->>DB: SELECT client_phone<br/>FROM appointments
        Worker->>SMS: Enviar SMS<br/>"Lembrete: agendamento<br/>amanhã às 09:00<br/>Cancelar: [link]"
        SMS-->>Worker: SMS sent
        Worker->>DB: INSERT INTO reminder_logs<br/>(appointment_id, type='24h', sent_at=NOW())
    end
    
    Worker->>DB: SELECT appointments WHERE<br/>appointment_at BETWEEN<br/>NOW()+2h AND NOW()+2h+5min
    DB-->>Worker: List[appointments]
    
    loop Cada appointment em 2h
        Worker->>SMS: Enviar SMS<br/>"Lembrete final: seu<br/>agendamento é em 2h"
        SMS-->>Worker: SMS sent
        Worker->>DB: INSERT INTO reminder_logs<br/>(appointment_id, type='2h', sent_at=NOW())
    end
    
    Worker-->>Scheduler: Concluído
```

## Fluxo: Editar Agendamento (Admin)

```mermaid
sequenceDiagram
    actor Admin as 👤 Admin
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 💾 Redis
    participant Worker as ⚙️ Worker
    participant SMS as 📱 SMS
    
    Admin->>Web: Clica editar agendamento
    Web->>API: GET /appointments/{id}
    API->>DB: SELECT * FROM appointments WHERE id = ?
    DB-->>API: Appointment data
    API-->>Web: 200 OK
    Web-->>Admin: Renderiza form
    
    Admin->>Admin: Modifica data/hora/profissional
    Admin->>Web: Clica "Salvar"
    
    Web->>API: PATCH /appointments/{id}<br/>{serviceId, professionalId, appointmentAt}
    
    API->>API: Validação:<br/>- Slot disponível?<br/>- Dentro de funcionamento?<br/>- Não é feriado?
    
    API->>DB: SELECT COUNT(*) FROM appointments<br/>WHERE professional_id = ?<br/>AND appointment_at = ?<br/>AND status != 'cancelled'
    DB-->>API: 0 (disponível)
    
    alt Slot occupied
        API-->>Web: 409 Conflict
        Web-->>Admin: ❌ Horário não disponível
    else Slot free
        API->>Worker: Remover jobs antigos<br/>(lembretes, status update)
        
        API->>DB: UPDATE appointments<br/>SET service_id=?, professional_id=?,<br/>appointment_at=?, updated_at=NOW()
        
        API->>Worker: Enqueue novos jobs<br/>para novo horário
        
        API->>SMS: Enviar SMS ao cliente<br/>"Seu agendamento foi alterado<br/>para [nova data/hora]"
        
        API->>Cache: DEL appointment:{id}
        API-->>Web: 200 OK
        Web-->>Admin: ✅ Agendamento atualizado
    end
```

## Fluxo: Cancelar Agendamento (Cliente)

```mermaid
sequenceDiagram
    actor Client as 👤 Cliente
    participant Link as 🔗 Cancel Link<br/>(Web)
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    participant Worker as ⚙️ Worker
    participant SMS as 📱 SMS
    
    Client->>Link: Clica link de cancelamento
    Link->>API: GET /appointments/cancel/{token}?id=abc
    
    API->>DB: SELECT * FROM appointments<br/>WHERE id = ? AND cancel_token = ?
    DB-->>API: Appointment found
    
    API->>API: Validar:<br/>- Token ainda válido?<br/>- Agendamento não passou?
    
    alt Token inválido ou expirado
        API-->>Link: 400 Bad Request
        Link-->>Client: ❌ Link expirado
    else Token válido
        API->>DB: UPDATE appointments<br/>SET status='cancelled',<br/>cancel_token=NULL<br/>(invalidar token)
        
        API->>Worker: Remover jobs<br/>(lembretes, status)
        
        API->>SMS: Enviar SMS confirmação<br/>"Seu agendamento foi cancelado"
        
        API-->>Link: 200 OK<br/>{message: "Cancelado com sucesso"}
        Link-->>Client: ✅ Agendamento cancelado
    end
```
