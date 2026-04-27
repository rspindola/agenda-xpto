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

## Módulo 06 — Agendamentos

### US-501 — Criar agendamento via web
**Como** Cliente (`P2`),  
**quero** agendar um serviço com profissional específico em data/hora disponível,  
**para que** eu reserve meu lugar sem esperar.

**Critérios de aceite:**
- ✓ Após criar o agendamento com sucesso, o estado apresentado ao cliente na experiência web é **confirmado**; `pendente` (se existir no modelo) é apenas **transitório e interno**, nunca exibido como rótulo na UI do cliente
- ✓ Link público permite visualizar serviços e profissionais
- ✓ Cliente seleciona serviço → profissional → data → hora
- ✓ Sistema mostra apenas slots disponíveis (respeita horário + feriado)
- ✓ Confirmação exibe dados do agendamento
- ✓ Link cancelamento é enviado para cliente
- ✗ Não deve permitir slot já ocupado
- ✗ Não deve permitir horário no passado ou durante fechamento

---

### US-502 — Cancelar agendamento com token único
**Como** Cliente (`P2`),  
**quero** cancelar meu agendamento clicando em link que recebi por email,  
**para que** eu não precise entrar no painel do admin.

**Critérios de aceite:**
- ✓ Link contém token UUID único, válido até 1 hora antes do agendamento
- ✓ Clicando no link, token é validado e agendamento é cancelado
- ✓ Confirmação de cancelamento é exibida
- ✓ Token é invalidado após uso (não reutilizável)
- ✓ Admin recebe notificação de cancelamento
- ✗ Não deve permitir cancelar agendamento <15min do horário
- ✗ Não deve permitir reuso do mesmo token

---

### US-503 — Editar agendamento existente
**Como** Admin (`P1`),  
**quero** mudar data, hora, profissional ou serviço de um agendamento confirmado,  
**para que** eu tenha flexibilidade para acomodar mudanças.

**Critérios de aceite:**
- ✓ Edição é permitida se agendamento está em status "confirmed"
- ✓ Sistema valida novo slot (disponibilidade, horário válido)
- ✓ Após edição, cliente recebe notificação
- ✓ Histórico de mudanças é registrado
- ✗ Não deve permitir editar se faltam <15 minutos
- ✗ Não deve permitir editar se status é "completed" ou "no_show"

---

### US-504 — Visualizar agenda em calendário
**Como** Admin (`P1`),  
**quero** ver todos os agendamentos em uma visualização de calendário (mês/semana/dia),  
**para que** eu tenha visão rápida da ocupação.

**Critérios de aceite:**
- ✓ Calendário exibe agendamentos com código de cor (confirmado, cancelado, no-show)
- ✓ Clicar em agendamento exibe detalhes
- ✓ Permite filtrar por profissional ou serviço
- ✓ Permite alternar entre visualização mês/semana/dia
- ✗ Não deve carregar se houver > 10000 agendamentos no período

---

### US-505 — Marcar agendamento como concluído ou no-show
**Como** Admin (`P1`),  
**quero** confirmar que cliente compareceu (concluído) ou faltou (no-show),  
**para que** eu tenha registro correto das presenças.

**Critérios de aceite:**
- ✓ Após horário do agendamento, ações "Marcar Concluído" e "Marcar No-show" aparecem
- ✓ Mudança de status registra timestamp e quem fez
- ✓ Status é imutável após 24 horas
- ✓ Estatísticas (taxa no-show) são atualizadas
- ✗ Não deve permitir marcar agendamento futuro como concluído
- ✗ Não deve permitir marcar como concluído se status é "cancelled"

---
