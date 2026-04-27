# User Stories - Availability

> Historias consolidadas de disponibilidade, horarios e bloqueios.

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |
| `P2` | **Cliente** | Cliente final. Interage via WhatsApp ou web. |
| `P3` | **IA** | Assistente virtual que atende o cliente. |

---

## Disponibilidade operacional

### US-202 — Definir horário de funcionamento
**Como** Admin (`P1`),  
**quero** configurar horário de abertura, fechamento e intervalo de almoço para cada dia da semana,  
**para que** o sistema saiba quando posso receber agendamentos.

**Critérios de aceite:**
- ✓ Interface permite selecionar 7 dias (seg-dom)
- ✓ Horários são validados (abertura < fechamento)
- ✓ Intervalo de almoço é opcional
- ✓ Dados salvos geram lista de "blocos de disponibilidade"
- ✓ Cada dia pode ter horário diferente
- ✗ Não deve aceitar horário invertido (18:00 - 09:00)
- ✗ Não deve permitir intervalo de almoço fora do expediente

---

## Feriados e suspensoes

### US-203 — Gerenciar feriados e suspensões
**Como** Admin (`P1`),  
**quero** adicionar, editar e remover datas de feriado/suspensão,  
**para que** o sistema não permita agendamentos nessas datas.

**Critérios de aceite:**
- ✓ Interface exibe lista de feriados com data e motivo
- ✓ Botão "Adicionar" abre form com data + descrição
- ✓ Editar permite modificar data/motivo existente
- ✓ Deletar pede confirmação antes de remover
- ✓ Feriado adicionado aparece imediatamente na lista
- ✗ Não deve permitir feriado no passado (exceto hoje)
- ✗ Não deve permitir data duplicada para mesmo feriado

---

## Matriz de disponibilidade

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
