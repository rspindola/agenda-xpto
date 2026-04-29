# 06-WhatsApp Integration — Fluxo de Usuário

```mermaid
flowchart TD
    Start([Usuário no Dashboard]) --> Nav["Clica em<br/>Integração WhatsApp"]
    
    Nav --> IntegrationPage["🔗 Configurar WhatsApp"]
    
    IntegrationPage --> CheckStatus{WhatsApp já<br/>conectado?}
    
    CheckStatus -->|Não| OptionA["📱 Opção A:<br/>Agenda XPTO API QR Code<br/>(Recomendado)"]
    OptionA --> QRSetup["Clica<br/>'Configurar Agora'"]
    QRSetup --> GenerateQR["Sistema gera QR Code"]
    GenerateQR --> DisplayQR["🔲 QR Code exibido"]
    DisplayQR --> UserAction["Usuário abre WhatsApp<br/>no celular"]
    UserAction --> ScanQR["Dispositivos Vinculados<br/>→ Vincular Dispositivo"]
    ScanQR --> CameraOpen["Aponta câmera<br/>para QR Code"]
    CameraOpen --> Scanning["⏳ Escaneando..."]
    Scanning --> Connected["✅ Conectado!<br/>Status = 'ready'"]
    Connected --> IntegrationPage
    
    CheckStatus -->|Não| OptionB["Opção B:<br/>API Oficial Meta<br/>(Em desenvolvimento)"]
    OptionB --> MetaSetup["Preencher dados<br/>Meta Business API"]
    
    CheckStatus -->|Sim| Connected
    
    Connected --> ConfigOptions["⚙️ Opções de<br/>Configuração"]
    ConfigOptions --> ActionChoice{Qual ação?}
    
    ActionChoice -->|Desconectar| Disconnect["Clica<br/>'Desconectar'"]
    Disconnect --> ConfirmDisconnect["Confirmar desconexão"]
    ConfirmDisconnect --> Disconnected["❌ WhatsApp desconectado"]
    Disconnected --> IntegrationPage
    
    ActionChoice -->|Ver Status| ShowStatus["Mostrar:<br/>- Número conectado<br/>- Sessão ativa?<br/>- Data conexão<br/>- Mensagens recebidas"]
    ShowStatus --> IntegrationPage
    
    ActionChoice -->|Gerenciar Resposta| ManageReply["📧 Configurar<br/>resposta automática"]
    ManageReply --> ReplyForm["Editar:<br/>- Mensagem de boas-vindas<br/>- Resposta fora do horário<br/>- FAQs (ligado a 08)"]
    ReplyForm --> SaveReply["Salvar"]
    SaveReply --> IntegrationPage
    
    ActionChoice -->|Ir para Setup IA| GoToIA["Ir para 07-IA-Credits"]
    
    ActionChoice -->|Voltar| Back["Voltar ao Dashboard"]
    Back --> End([Continuar])
    
    style Connected fill:#c8e6c9
    style Disconnected fill:#ffcccc
```

**Decisões Principais:**
- Agenda XPTO API (Evolution API) = padrão (sem conta Meta)
- API Oficial Meta = para empresas com negócios verificados
- QR Code renova a cada 15 segundos
- Session monitoring contínuo
- Desconexão é reversível

**Fluxo de Mensagens:**
- WhatsApp → Evolution API → Webhook do Backend
- Backend processa com IA
- IA gera resposta
- Backend → Evolution API → WhatsApp
