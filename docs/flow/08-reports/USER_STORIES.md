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

## Módulo 10 — Relatórios e Análise

### US-901 — Gerar relatório de agendamentos
**Como** Admin (`P1`),  
**quero** filtrar agendamentos por período e visualizar: total, confirmados, cancelados, no-show, duração média,  
**para que** eu analise performance operacional.

**Critérios de aceite:**
- ✓ Filtros: período (dia/semana/mês/ano), profissional, serviço
- ✓ Exibe: total confirmados, cancelados, completados, no-show
- ✓ Calcula: duração média, horário de pico
- ✓ Gráfico de linha com agendamentos por dia
- ✓ Exportar em PDF e CSV
- ✗ Não deve incluir agendamentos de período futuro
- ✗ Não deve permitir filtro com período muito grande (>1 ano)

---

### US-902 — Gerar relatório de receita
**Como** Admin (`P1`),  
**quero** ver receita total, por serviço e por profissional, com tickets médios,  
**para que** eu identifique quais ofertam mais valor.

**Critérios de aceite:**
- ✓ Exibe: receita total, receita por serviço, receita por profissional
- ✓ Calcula: ticket médio, ticket médio por profissional
- ✓ Gráfico de barras comparando profissionais
- ✓ Inclui apenas agendamentos "completed"
- ✓ Exportar em PDF e CSV
- ✗ Não deve contar agendamentos cancelados ou no-show
- ✗ Não deve permitir exportação se período > 1 ano

---

### US-903 — Gerar relatório de clientes
**Como** Admin (`P1`),  
**quero** ver: novos clientes, clientes recorrentes, taxa de retenção, clientes inativos,  
**para que** eu entenda saúde da base de clientes.

**Critérios de aceite:**
- ✓ Exibe: total novos, recorrentes, inativos (>30d sem agendamento)
- ✓ Taxa de retenção = (clientes prev month com agto this month) / (clientes prev month)
- ✓ Gráfico pizza de distribuição
- ✓ Tabela de top clientes (mais agendamentos)
- ✓ Exportar em PDF e CSV
- ✗ Não deve contar clientes suspensos/bloqueados

---

### US-904 — Gerar relatório de IA usage
**Como** Admin (`P1`),  
**quero** ver: mensagens processadas, taxa de conversão (booking/mensagens), créditos gastos, ROI IA,  
**para que** eu justifique investimento em IA.

**Critérios de aceite:**
- ✓ Exibe: total mensagens, bookings via IA, % conversão
- ✓ Calcula: créditos gastos, custo por conversão, ROI (receita - créditos)
- ✓ Gráfico temporal de crescimento de conversões
- ✓ Permite comparar períodos (semana passada vs semana atual)
- ✓ Exportar em PDF e CSV
- ✗ Não deve contar mensagens de spam ou não processadas

---
