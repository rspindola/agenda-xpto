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

## Módulo 09 — FAQ / Knowledge Base

### US-801 — Criar e gerenciar FAQs com embeddings
**Como** Admin (`P1`),  
**quero** criar perguntas e respostas que IA usa para contexto,  
**para que** respostas sejam mais precisas e alinhadas com meu negócio.

**Critérios de aceite:**
- ✓ Form para adicionar FAQ com pergunta + resposta + categoria
- ✓ Sistema gera embedding automático (text-embedding-3-small)
- ✓ Embedding é armazenado em pgvector
- ✓ Interface permite editar e deletar FAQs
- ✓ Lista exibe: pergunta, categoria, vezes usado, relevância
- ✗ Não deve permitir FAQ duplicada (mesmo conteúdo)
- ✗ Não deve falhar se LLM não responder na geração de embedding

---

### US-802 — FAQs são usados em RAG
**Como** IA (`P3`),  
**quero** ao processar mensagem de cliente, buscar top-3 FAQs mais relevantes via vector search,  
**para que** resposta considere políticas do negócio.

**Critérios de aceite:**
- ✓ Embedding da mensagem cliente é gerado
- ✓ Busca cosine similarity contra pgvector
- ✓ Top-3 FAQs com score > 0.6 são injetados no prompt
- ✓ Resposta IA cita FAQ se usado (ex: "Como mencionado em nossa FAQ...")
- ✗ Não deve injetar FAQ se score < 0.6 (relevância baixa)
- ✗ Não deve injetar mais de 3 FAQs (context window)

---

### US-803 — Análise de uso de FAQs
**Como** Admin (`P1`),  
**quero** ver quais FAQs são mais usadas pelo IA e qual sua relevância,  
**para que** eu melhore continuamente.

**Critérios de aceite:**
- ✓ Dashboard exibe: FAQ, vezes retornada, score médio, data criação
- ✓ Ordenação por: mais usado, mais relevante, mais recente
- ✓ Permite filtrar por categoria
- ✓ Feedback: possibilidade de marcar FAQ como "útil" ou "melhorar"
- ✗ Não deve contar FAQ que foi injetado mas não usado (score too low)

---
