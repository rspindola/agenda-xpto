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
