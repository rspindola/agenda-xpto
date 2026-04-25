# 06-WhatsApp Integration — Diagrama de Sequência

## Fluxo: Conectar WhatsApp (QR Code)

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant EvAPI as 🔔 Evolution API
    participant WA as 📱 WhatsApp
    
    User->>Web: Acessa /whatsapp
    Web-->>User: Renderiza opções
    
    User->>Web: Clica "Configurar Agora" (Opção A)
    Web->>API: POST /whatsapp/generate-qr
    
    API->>EvAPI: POST /instances/create<br/>{instance_name, token}
    EvAPI-->>API: {instanceId, status}
    
    API->>EvAPI: POST /instances/{id}/qrcode
    EvAPI-->>API: {qrcode_base64, expires_at}
    
    API->>DB: INSERT INTO whatsapp_instances<br/>(tenant_id, evolution_id, status='qr_generated')
    API-->>Web: 200 OK<br/>{qrcode_image, expiresIn}
    
    Web-->>User: Renderiza QR Code
    Web->>Web: Poll a cada 5s:<br/>GET /whatsapp/status
    
    User->>WA: Abre WhatsApp → Dispositivos Vinculados
    User->>WA: Clica "Vincular Dispositivo"
    User->>WA: Aponta câmera para QR
    WA->>WA: Autentica
    WA-->>EvAPI: Webhook: instance_connected
    
    EvAPI-->>API: POST /webhooks/whatsapp<br/>{event: 'connection_update',<br/>status: 'authenticated',<br/>instance_id}
    
    API->>DB: UPDATE whatsapp_instances<br/>SET status='connected',<br/>whatsapp_number=?,<br/>connected_at=NOW()
    
    API-->>Web: 200 OK
    Web->>API: GET /whatsapp/status
    API-->>Web: {status: 'connected', number: '+55...'}
    
    Web-->>User: ✅ WhatsApp conectado!
    Web->>Web: Redirecionar /dashboard
```

## Fluxo: Receber Mensagem e Processar

```mermaid
sequenceDiagram
    actor Client as 👤 Cliente
    participant WA as 📱 WhatsApp
    participant EvAPI as 🔔 Evolution API
    participant API as 🚀 Backend API
    participant LLM as 🤖 Groq LLM
    participant RAG as 🔍 RAG (pgvector)
    participant DB as 🗄️ PostgreSQL
    participant Worker as ⚙️ Worker
    
    Client->>WA: Envia mensagem
    WA->>EvAPI: Recebe msg (Evolution monitora)
    EvAPI->>API: POST /webhooks/whatsapp/messages<br/>{sender, message, timestamp}
    
    API->>DB: SELECT tenant_id, evolution_id<br/>FROM whatsapp_instances
    DB-->>API: tenant_id
    
    API->>DB: SELECT * FROM chat_sessions<br/>WHERE sender = ? AND tenant_id = ?
    
    alt Session não existe
        DB-->>API: null
        API->>DB: INSERT INTO chat_sessions
        API->>DB: SELECT * FROM chat_sessions
    else Session existe
        DB-->>API: session_data
    end
    
    API->>RAG: Buscar documentos relevantes<br/>(embeddings) da knowledge base
    RAG-->>API: Top 3 chunks relevantes
    
    API->>LLM: POST /v1/chat/completions<br/>{<br/>  messages: [...history],<br/>  context: ...rag_chunks,<br/>  system_prompt<br/>}
    
    LLM-->>API: {response, tokens_used}
    
    API->>DB: INSERT INTO chat_messages<br/>(session_id, role, content, tokens)
    
    API->>DB: UPDATE tenants<br/>SET credits_used = credits_used + tokens
    
    alt Resposta contém intenção AGENDAR
        API->>API: Gerar disponibilidade
        API->>API: Extrair entities<br/>(serviço, data, prof)
    else Resposta normal
        API->>API: response é final
    end
    
    API->>EvAPI: POST /instances/{id}/send<br/>{to, message}
    EvAPI->>WA: Enviar resposta via WA
    WA-->>Client: Mensagem recebida
    
    API-->>API: 200 OK (webhook respondido)
```

## Fluxo: Desconectar WhatsApp

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web Client
    participant API as 🚀 API
    participant EvAPI as 🔔 Evolution API
    participant DB as 🗄️ PostgreSQL
    
    User->>Web: Clica "Desconectar"
    Web-->>User: Confirmação modal
    User->>Web: Confirma
    
    Web->>API: DELETE /whatsapp
    
    API->>EvAPI: DELETE /instances/{instance_id}
    EvAPI-->>API: 200 OK (instância deletada)
    
    API->>DB: UPDATE whatsapp_instances<br/>SET status='disconnected',<br/>disconnected_at=NOW()
    
    API->>DB: UPDATE chat_sessions<br/>SET is_active=false<br/>WHERE tenant_id=?
    
    API-->>Web: 200 OK
    Web-->>User: ✅ Desconectado
    Web->>Web: Redirecionar /whatsapp
```

## Fluxo: Gerar QR Code Automático (Renovação)

```mermaid
sequenceDiagram
    participant EvAPI as 🔔 Evolution API
    participant Scheduler as ⏰ Scheduler<br/>(a cada 15s)
    participant DB as 🗄️ PostgreSQL
    participant Web as 🌐 Web Client
    
    Scheduler->>EvAPI: GET /instances/{id}/qrcode
    EvAPI-->>Scheduler: {new_qrcode, expires_at}
    
    Scheduler->>DB: UPDATE whatsapp_instances<br/>SET qrcode_base64=?,<br/>qrcode_expires_at=?
    
    DB-->>Scheduler: Updated
    
    Web->>Web: Polling a cada 5s:<br/>GET /whatsapp/status
    Web-->>Web: Detecta novo QR
    Web->>Web: Renderiza novo QR na UI
```
