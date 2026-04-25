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

## Módulo 05 — Background Workers

### US-401 — Receber lembretes automáticos 24h antes
**Como** Cliente (`P2`),  
**quero** receber uma mensagem (SMS/WhatsApp) 24 horas antes do meu agendamento,  
**para que** eu não esqueça e não deixe o profissional esperando.

**Critérios de aceite:**
- ✓ Lembrete é enviado automaticamente (não requer ação admin)
- ✓ Mensagem é enviada 24 horas exatas antes do agendamento
- ✓ Se falhar, é retentado 3 vezes com backoff exponencial
- ✓ Log registra se foi enviado com sucesso
- ✗ Não deve enviar se cliente cancelou agendamento
- ✗ Não deve enviar para agendamentos no passado

---

### US-402 — Atualizar status para "no-show" automaticamente
**Como** Admin (`P1`),  
**quero** que sistema marque um agendamento como "no-show" se não foi confirmado no horário,  
**para que** eu não precise fazer isso manualmente.

**Critérios de aceite:**
- ✓ Job BullMQ executa 15 minutos após horário do agendamento
- ✓ Se status ainda for "confirmed", muda para "no-show"
- ✓ Admin recebe notificação do no-show
- ✓ Cliente recebe notificação de que faltou (se desejar)
- ✗ Não deve alterar se status já foi para "completed" ou "cancelled"
- ✗ Não deve falhar se agendamento foi deletado

---

### US-403 — Debitar créditos de IA automaticamente
**Como** Admin (`P1`),  
**quero** que sistema debite créditos IA conforme conversas ocorrem via WhatsApp,  
**para que** eu controle consumo sem intervenção manual.

**Critérios de aceite:**
- ✓ Job executa a cada hora, resumindo consumo do período
- ✓ Créditos são debitados da quota do tenant
- ✓ Logs registram cada debitagem (quando, quantos, por quê)
- ✓ Se quota atingir mínimo, admin recebe alerta
- ✗ Não deve debitar se tenant não tem créditos suficientes
- ✗ Não deve processar créditos de tenant suspenso

---
