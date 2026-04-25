# User Stories — XP WhatsApp

> Formato: `Como [persona], quero [ação], para que [benefício]`
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |
| `P2` | **Cliente** | Cliente final. Interage via WhatsApp ou web. |
| `P3` | **IA** | Assistente virtual que atende o cliente. |

---

## Módulo 07 — Integração WhatsApp

### US-601 — Receber mensagens de clientes no WhatsApp
**Como** Cliente (`P2`),  
**quero** enviar mensagens para o número WhatsApp da barbearia,  
**para que** eu possa tirar dúvidas sem ligar.

**Critérios de aceite:**
- ✓ Mensagens chegam em tempo real (max 2 segundos)
- ✓ Webhook processa cada mensagem recebida
- ✓ Mensagem é armazenada com timestamp e identificação do cliente
- ✓ Admin vê histórico de conversas no dashboard
- ✗ Não deve perder mensagens se webhook falhar (retry 3x)
- ✗ Não deve processar mensagens duplicadas

---

### US-602 — IA responde automaticamente mensagens de clientes
**Como** IA (`P3`),  
**quero** processar mensagens recebidas usando RAG + LLM para dar respostas úteis,  
**para que** cliente tenha resposta 24/7 mesmo fora do horário.

**Critérios de aceite:**
- ✓ Mensagem é enviada para LLM (Groq/OpenAI) com contexto (FAQ, horário, serviços)
- ✓ RAG busca top-3 FAQs relevantes e injeta no prompt
- ✓ Resposta é gerada em menos de 10 segundos
- ✓ Créditos IA são debitados (tokens_used * cost_per_token)
- ✓ Resposta é enviada automaticamente para cliente
- ✗ Não deve processar se tenant não tem créditos suficientes
- ✗ Não deve expor dados de outros clientes na resposta

---

### US-603 — Cliente agenda via WhatsApp
**Como** Cliente (`P2`),  
**quero** escrever "quero marcar um corte amanhã" no WhatsApp,  
**para que** IA entenda minha intenção e me guie no agendamento.

**Critérios de aceite:**
- ✓ IA detecta intenção de booking (NER/intent classification)
- ✓ IA pergunta: qual serviço, qual profissional, qual horário
- ✓ Cliente responde em linguagem natural
- ✓ IA valida disponibilidade e cria agendamento
- ✓ Confirmação de agendamento é enviada para cliente
- ✓ Link cancelamento é incluído na mensagem
- ✗ Não deve agendar se slot não está disponível
- ✗ Não deve criar agendamento duplicado se cliente enviar 2x

---

### US-604 — Integração com callbacks e confirmação de agendamentos
**Como** Admin (`P1`),  
**quero** que cliente possa confirmar sua presença no agendamento via botão no WhatsApp,  
**para que** eu tenha confirmação sem dependência de resposta textual.

**Critérios de aceite:**
- ✓ Mensagem de lembrete contém botões "Confirmar" e "Cancelar"
- ✓ Clicando botão, agendamento muda status para "confirmed" ou "cancelled"
- ✓ Admin vê notificação de confirmação em tempo real
- ✓ Callbacks de botões são processados via webhook
- ✗ Não deve permitir múltiplos cliques (token único por botão)
- ✗ Não deve quebrar se token expirou

---
