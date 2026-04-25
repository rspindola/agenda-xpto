# 06-WhatsApp Integration — Wireframes

## Página: Integração WhatsApp (Desconectado)

```
┌─────────────────────────────────────────────────────────┐
│  Integração WhatsApp                       [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Status: ❌ DESCONECTADO                                │
│                                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │  🟢 Opção A — ZeroFila API (QR Code)              │ │
│ │  (Recomendado)                                     │ │
│ │                                                    │ │
│ │  ✅ Rápido (< 2 minutos)                           │ │
│ │  ✅ Sem conta Meta Business necessária             │ │
│ │  ✅ Suporta qualquer número (pessoal ou Business)  │ │
│ │                                                    │ │
│ │         [ Configurar Agora ]                       │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ⚙️ Opção B — API Oficial Meta (Em breve)          │ │
│ │                                                    │ │
│ │  ✅ Oficial, com suporte Meta                      │ │
│ │  ⚠️ Requer conta Meta Business verificada          │ │
│ │  ⚠️ Mais configuração técnica                      │ │
│ │                                                    │ │
│ │         [ Ver instruções ]                         │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Página: QR Code Setup

```
┌─────────────────────────────────────────────────────────┐
│  Conectar WhatsApp — ZeroFila API              [← Voltar] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📱 Passe 1: Abra o WhatsApp no seu telefone           │
│                                                         │
│  Passe 2: Clique em:                                    │
│    ⋮ (menu) → Dispositivos vinculados → Vincular      │
│                                                         │
│  Passe 3: Aponte a câmera para o QR Code:              │
│                                                         │
│              ┌──────────────────────┐                   │
│              │  ██░░██░░██░░██░░  │                    │
│              │  ██░░██░░██░░██░░  │                    │
│              │  ██░░██░░██░░██░░  │                    │
│              │  ██░░██░░██░░██░░  │                    │
│              │                      │                   │
│              │  [Atualizando em...]  │                   │
│              │       8 segundos      │                   │
│              │                      │                    │
│              └──────────────────────┘                   │
│                                                         │
│  ⏳ Conectando... (não feche esta página)               │
│                                                         │
│  Vejo  uma tela "Você foi logado como..."              │
│  Deslize para a esquerda para voltar.                  │
│                                                         │
│  [ Voltar ]                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Integração WhatsApp                       [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Status: ✅ CONECTADO                                   │
│                                                         │
│  Número: +55 21 98765-4321                             │
│  Sessão ativa desde: 18/05/2026 14:32:15               │
│  Status: 🟢 Pronto para receber agendamentos            │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│                                                         │
│  Estatísticas:                                          │
│  📨 Mensagens recebidas: 234                            │
│  ✅ Agendamentos criados: 45                            │
│  ⚠️  Erros: 2                                           │
│                                                         │
│  [ Desconectar ] [ Ver Logs ]                          │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│                                                         │
│  ⚙️ Configurações Avançadas                             │
│                                                         │
│  [ Gerenciar Respostas Automáticas ]                   │
│  [ Ver Documentação ]                                   │
│  [ Suporte Técnico ]                                    │
│                                                         │
│  Próximo passo: Ir para 07-IA-Credits para ativar IA   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Página: Gerenciar Respostas Automáticas

```
┌─────────────────────────────────────────────────────────┐
│  Gerenciar Respostas                       [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✉️ Mensagem de Boas-vindas                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Olá! 👋 Bem-vindo à Barbearia do João!           │  │
│  │ Como posso ajudá-lo?                              │  │
│  │                                                   │  │
│  │ (300 caracteres máximo)                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  🌙 Resposta Fora do Horário                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Estou fechado no momento. Voltarei a responder   │  │
│  │ em breve. Deixe sua mensagem! 😊                  │  │
│  │                                                   │  │
│  │ (300 caracteres máximo)                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  📚 Ligar FAQs (Knowledge Base)                         │
│  ☑️ Usar FAQs na resposta do assistente                │
│     (Ativar em 08-FAQ)                                 │
│                                                         │
│  🔧 Assistente IA                                       │
│  ☑️ Assistente IA ativado                              │
│  [ Configurar Prompt Customizado ]                     │
│                                                         │
│                  [ Salvar ]  [ Cancelar ]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
