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

## Módulo 04 — Serviços e Profissionais

### US-301 — Criar novo serviço
**Como** Admin (`P1`),  
**quero** cadastrar um serviço com nome, duração e preço,  
**para que** eu possa oferecer esse serviço nos agendamentos.

**Critérios de aceite:**
- ✓ Form solicita: nome, duração (minutos), preço (R$), descrição opcional
- ✓ Duração deve ser > 0 minutos
- ✓ Preço deve ser ≥ 0
- ✓ Serviço criado aparece na lista
- ✓ É possível editar e deletar serviços
- ✗ Não deve permitir duração negativa ou zero
- ✗ Não deve permitir deletar se há agendamentos (soft delete)

---

### US-302 — Gerenciar profissionais
**Como** Admin (`P1`),  
**quero** adicionar profissionais, definir quais serviços cada um oferece e editar dados,  
**para que** eu controle quem trabalha e o que faz.

**Critérios de aceite:**
- ✓ Form solicita: nome, email (opcional), telefone
- ✓ Após criar, interface permite atribuir serviços (N:N)
- ✓ Profissional pode ofertar múltiplos serviços
- ✓ Um serviço pode ser oferecido por múltiplos profissionais
- ✓ É possível editar dados e serviços do profissional
- ✗ Não deve permitir deletar profissional com agendamentos ativos
- ✗ Não deve aceitar email duplicado (se preenchido)

---

### US-303 — Definir preços diferenciados por profissional
**Como** Admin (`P1`),  
**quero** definir preços diferentes para o mesmo serviço conforme o profissional (ex: Junior vs Senior),  
**para que** eu tenha flexibilidade de pricing.

**Critérios de aceite:**
- ✓ Na atribuição de serviço a profissional, permite override de preço
- ✓ Se preço não for definido, usa o padrão do serviço
- ✓ Preço específico do profissional aparece em agendamentos
- ✓ Mudança de preço não afeta agendamentos passados
- ✗ Não deve permitir preço negativo
- ✗ Não deve modificar histórico de preços

---

### US-304 — Visualizar matriz de disponibilidade
**Como** Admin (`P1`),  
**quero** ver em uma matriz qual profissional trabalha em qual dia/hora e qual serviço oferece,  
**para que** eu tenha visão rápida da capacidade operacional.

**Critérios de aceite:**
- ✓ Exibe grid com profissionais (linhas) x dias (colunas)
- ✓ Células exibem horário de trabalho e serviços oferecidos
- ✓ Pode filtrar por serviço
- ✓ Visão é read-only (configuração feita em outro lugar)
- ✗ Não deve carregar se houver muitos profissionais (max 50 visualmente)

---
