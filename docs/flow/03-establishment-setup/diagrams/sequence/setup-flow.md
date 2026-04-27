# Setup - Diagramas de Sequencia

## Fluxo A - Configuracoes

# 02-Config — Diagrama de Sequência

## Fluxo de Salvar Configuração Básica

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    
    User->>Web: Acessa /config/basic
    Web-->>User: Renderiza formulário
    
    User->>User: Preenche:<br/>- Nome<br/>- Slug<br/>- Telefone
    User->>Web: Clica "Salvar"
    
    Web->>Web: Zod validation<br/>- Slug format (regex)<br/>- Telefone format<br/>- Nome min 3 chars
    
    alt Validação local falha
        Web-->>User: ❌ Erro de validação
    else Validação OK
        Web->>API: PATCH /config/basic<br/>{name, slug, phone...}
        
        API->>API: Zod validation<br/>(duplica validação client)
        API->>API: Rate limit check
        
        API->>DB: SELECT COUNT(*) FROM tenants<br/>WHERE slug = ?<br/>AND id != tenant_id
        DB-->>API: 0 (slug disponível)
        
        alt Slug já existe
            API-->>Web: 409 Conflict<br/>{status: error}
            Web-->>User: ❌ Slug já está em uso
        else Slug disponível
            API->>DB: UPDATE tenants<br/>SET name = ?, slug = ?,<br/>phone = ?,<br/>updated_at = NOW()
            
            DB-->>API: Row updated
            API->>API: Invalidar cache<br/>da URL pública
            API-->>Web: 200 OK<br/>{status: ok, tenant}
            
            Web->>Web: Mostrar toast
            Web-->>User: ✅ Configurações salvas
        end
    end
```

## Fluxo de Salvar Horários de Funcionamento

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 💾 Redis
    
    User->>Web: Acessa /config/hours
    Web-->>User: Renderiza seletor
    
    User->>User: Seleciona dias<br/>e horários
    User->>Web: Clica "Salvar"
    
    Web->>Web: Validação local<br/>- Abertura < Fechamento?<br/>- Intervalo válido?
    
    alt Validação falha
        Web-->>User: ❌ Horário inválido
    else OK
        Web->>API: POST /config/availability<br/>{weekDays: [{day, open, close}]}
        
        API->>API: Validação backend
        API->>DB: DELETE FROM availability_blocks<br/>WHERE tenant_id = ?
        
        DB-->>API: Deleted N rows
        
        API->>DB: INSERT INTO availability_blocks<br/>(tenant_id, day_of_week,<br/>open_time, close_time,<br/>break_start, break_end)<br/>VALUES (...)
        
        DB-->>API: N rows inserted
        API->>Cache: DEL availability:{tenant_id}
        API-->>Web: 201 Created
        
        Web-->>User: ✅ Horários salvos
        Web->>Web: Atualizar UI
    end
```

## Fluxo de Adicionar Feriado

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    
    User->>Web: Clica "+ Adicionar Feriado"
    Web-->>User: Abre modal com form
    
    User->>User: Preenche:<br/>- Data<br/>- Motivo
    User->>Web: Clica "Salvar"
    
    Web->>Web: Validação local<br/>- Data válida?<br/>- Não é passada?
    
    alt Validação falha
        Web-->>User: ❌ Data inválida
    else OK
        Web->>API: POST /config/holidays<br/>{date, reason}
        
        API->>API: Validação backend
        API->>API: Verificar data<br/>não é anterior a hoje
        
        API->>DB: INSERT INTO holidays<br/>(tenant_id, date, reason,<br/>created_at)
        
        DB-->>API: Holiday inserted
        API-->>Web: 201 Created<br/>{holiday}
        
        Web->>Web: Adicionar na lista
        Web-->>User: ✅ Feriado adicionado
    end
    
    User->>Web: Clica editar
    Web-->>User: Abre form preenchido
    
    User->>Web: Modifica e clica "Salvar"
    Web->>API: PATCH /config/holidays/{id}<br/>{date, reason}
    API->>DB: UPDATE holidays<br/>SET date = ?, reason = ?
    DB-->>API: Updated
    API-->>Web: 200 OK
    Web-->>User: ✅ Feriado atualizado
    
    User->>Web: Clica deletar
    Web-->>User: Confirmação modal
    User->>Web: Confirma
    Web->>API: DELETE /config/holidays/{id}
    API->>DB: DELETE FROM holidays<br/>WHERE id = ?
    DB-->>API: Deleted
    API-->>Web: 204 No Content
    Web->>Web: Remover da lista
    Web-->>User: ✅ Feriado removido
```

---

## Fluxo B - Servicos e profissionais

# 03-Services — Diagrama de Sequência

## Fluxo de Criar Serviço

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 💾 Redis
    
    User->>Web: Acessa /services
    Web-->>User: Renderiza lista
    
    User->>Web: Clica "+ Novo Serviço"
    Web-->>User: Abre formulário
    
    User->>User: Preenche:<br/>- Nome<br/>- Duração<br/>- Preço
    User->>Web: Clica "Salvar"
    
    Web->>Web: Validação local (Zod)<br/>- Nome min 3 chars<br/>- Duração > 0<br/>- Preço ≥ 0
    
    alt Validação falha
        Web-->>User: ❌ Erro inline
    else OK
        Web->>API: POST /services<br/>{name, duration, price, description}
        
        API->>API: Zod validation
        API->>DB: INSERT INTO services<br/>(tenant_id, name, duration_minutes,<br/>price_cents, description)<br/>RETURNING id
        
        DB-->>API: Service created
        API->>Cache: DEL services:{tenant_id}
        API-->>Web: 201 Created<br/>{service}
        
        Web->>Web: Adicionar na lista
        Web-->>User: ✅ Serviço criado
    end
```

## Fluxo de Criar Profissional e Atribuir Serviços

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 💾 Redis
    
    User->>Web: Clica "+ Novo Profissional"
    Web-->>User: Abre formulário
    
    User->>User: Preenche:<br/>- Nome<br/>- Email<br/>- Telefone
    User->>User: Seleciona serviços
    User->>Web: Clica "Salvar"
    
    Web->>Web: Validação local<br/>- Nome min 2 chars<br/>- Email format
    
    alt Validação falha
        Web-->>User: ❌ Erro inline
    else OK
        Web->>API: POST /professionals<br/>{name, email, phone, serviceIds}
        
        API->>DB: INSERT INTO professionals<br/>(tenant_id, name, email, phone)<br/>RETURNING id
        
        DB-->>API: Professional created<br/>(id)
        
        API->>DB: INSERT INTO professional_services<br/>(professional_id, service_id)<br/>VALUES (...) [multiple]
        
        DB-->>API: N rows inserted
        API->>Cache: DEL professionals:{tenant_id}
        API-->>Web: 201 Created<br/>{professional, services}
        
        Web->>Web: Adicionar na lista
        Web-->>User: ✅ Profissional criado
    end
```

## Fluxo de Deletar Serviço (com validação)

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    
    User->>Web: Clica deletar em um serviço
    Web->>API: DELETE /services/{id}
    
    API->>DB: SELECT COUNT(*) FROM appointments<br/>WHERE service_id = ?<br/>AND status != 'cancelled'<br/>AND appointment_at > NOW()
    
    DB-->>API: Count (0 ou > 0)
    
    alt Há agendamentos futuros
        API-->>Web: 409 Conflict<br/>{status: error,<br/>message: "Serviço em uso"}
        Web-->>User: ⚠️ Não pode deletar<br/>- Há agendamentos futuros
        
    else Sem agendamentos
        API->>DB: DELETE FROM services<br/>WHERE id = ?
        DB-->>API: Deleted
        API->>Cache: DEL services:{tenant_id}
        API-->>Web: 204 No Content
        Web->>Web: Remover da lista
        Web-->>User: ✅ Serviço removido
    end
```

## Fluxo de Editar Profissional

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant DB as 🗄️ PostgreSQL
    
    User->>Web: Clica editar profissional
    Web->>API: GET /professionals/{id}
    API->>DB: SELECT * FROM professionals WHERE id = ?
    DB-->>API: Professional + services
    API-->>Web: 200 OK<br/>{professional}
    
    Web-->>User: Renderiza form preenchido
    User->>User: Modifica dados<br/>e serviços
    User->>Web: Clica "Salvar"
    
    Web->>API: PATCH /professionals/{id}<br/>{name, email, phone, serviceIds}
    
    API->>DB: UPDATE professionals<br/>SET name = ?, email = ?, phone = ?
    DB-->>API: Updated
    
    API->>DB: DELETE FROM professional_services<br/>WHERE professional_id = ?
    DB-->>API: Deleted
    
    API->>DB: INSERT INTO professional_services<br/>(professional_id, service_id) VALUES (...)
    DB-->>API: N rows inserted
    
    API->>Cache: DEL professionals:{tenant_id}
    API-->>Web: 200 OK<br/>{professional}
    Web-->>User: ✅ Profissional atualizado
```

---

## Fluxo C - Workers assincronos

# 04-Workers — Diagrama de Sequência

## Fluxo: Worker de Lembretes (a cada 5 min)

```mermaid
sequenceDiagram
    participant Scheduler as ⏰ Cron Scheduler
    participant Worker as ⚙️ Worker Process
    participant Queue as 📋 Redis Queue
    participant DB as 🗄️ PostgreSQL
    participant SMS as 📱 SMS Service
    
    Scheduler->>Queue: Enqueue job<br/>name: 'process-reminders'
    Queue-->>Queue: Job em fila
    
    Worker->>Queue: Ler próximo job
    Queue-->>Worker: {job_id, name, data}
    
    Worker->>DB: SELECT * FROM appointments<br/>WHERE status='confirmed'<br/>AND appointment_at<br/>BETWEEN NOW()+24h<br/>AND NOW()+24h+5min
    DB-->>Worker: List[appointments]
    
    loop Para cada appointment
        Worker->>DB: SELECT client_phone
        Worker->>SMS: Enviar SMS 24h reminder
        SMS-->>Worker: SMS queued
        Worker->>DB: INSERT INTO reminder_logs<br/>(appointment_id, type='24h')
    end
    
    Worker->>DB: SELECT * FROM appointments<br/>WHERE appointment_at<br/>BETWEEN NOW()+2h<br/>AND NOW()+2h+5min
    DB-->>Worker: List[appointments]
    
    loop Para cada appointment
        Worker->>DB: SELECT client_phone
        Worker->>SMS: Enviar SMS 2h reminder
        SMS-->>Worker: SMS queued
        Worker->>DB: INSERT INTO reminder_logs<br/>(appointment_id, type='2h')
    end
    
    Worker->>Queue: Mark job completed
    Queue-->>Queue: Job removido da fila
```

## Fluxo: Worker de Auto-Update Status

```mermaid
sequenceDiagram
    participant Scheduler as ⏰ Cron (a cada 15min)
    participant Worker as ⚙️ Worker
    participant Queue as 📋 Queue
    participant DB as 🗄️ PostgreSQL
    participant Admin as 📧 Admin Notifications
    
    Scheduler->>Queue: Enqueue 'check-noshows'
    
    Worker->>Queue: Ler job
    Queue-->>Worker: Job data
    
    Worker->>DB: SELECT * FROM appointments<br/>WHERE status='confirmed'<br/>AND appointment_at < NOW()-15min
    DB-->>Worker: List[old_appointments]
    
    loop Para cada appointment
        Worker->>DB: UPDATE appointments<br/>SET status='no_show'<br/>WHERE id=?
        
        Worker->>DB: SELECT admin_email FROM tenants
        Worker->>Admin: Notificar admin<br/>"Cliente não compareceu"
    end
    
    Worker->>Queue: Mark job completed
```

## Fluxo: Worker de Debitagem de Créditos

```mermaid
sequenceDiagram
    participant Scheduler as ⏰ Cron (a cada 1h)
    participant Worker as ⚙️ Worker
    participant DB as 🗄️ PostgreSQL
    participant Email as 📧 Email Service
    
    Scheduler->>Worker: Trigger 'deduct-credits'
    
    Worker->>DB: SELECT tenant_id,<br/>SUM(credits_used)<br/>FROM credit_logs<br/>WHERE created_at > last_deduction<br/>GROUP BY tenant_id
    DB-->>Worker: {tenant: credits}
    
    loop Para cada tenant
        Worker->>DB: SELECT credits_remaining<br/>FROM tenant_subscriptions
        
        Worker->>DB: UPDATE tenant_subscriptions<br/>SET credits_remaining -= ?,<br/>updated_at=NOW()
        
        Worker->>DB: SELECT credits_remaining
        
        alt Credits < min threshold
            Worker->>Email: Enviar alerta<br/>"Créditos baixos"
        end
        
        alt Credits <= 0
            Worker->>DB: UPDATE tenants<br/>SET status='credits_exhausted'
        end
    end
```
