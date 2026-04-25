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

## Módulo 08 — Créditos IA

### US-701 — Visualizar saldo de créditos e histórico de consumo
**Como** Admin (`P1`),  
**quero** ver saldo atual, uso diário/mensal e breakdown por ação (WhatsApp, web booking),  
**para que** eu controle o consumo de IA.

**Critérios de aceite:**
- ✓ Página exibe: saldo total, créditos restantes, % consumido
- ✓ Gráfico de pizza mostra consumo por tipo (WhatsApp 85%, web 15%)
- ✓ Histórico em tabela com: data, ação, créditos gastos, usuário
- ✓ Permite filtrar histórico por período
- ✗ Não deve revelar histórico de outros tenants
- ✗ Não deve permitir exportar dados sensíveis sem permission

---

### US-702 — Comprar pacotes de créditos adicionais
**Como** Admin (`P1`),  
**quero** comprar créditos extras (100=R$10, 500=R$40, 1000=R$70) via Stripe,  
**para que** eu não interrompa o atendimento ao cliente.

**Critérios de aceite:**
- ✓ Interface exibe pacotes com preço claro
- ✓ Seleção de pacote leva a checkout Stripe
- ✓ Após pagamento confirmado, créditos são adicionados imediatamente
- ✓ Recibo é enviado por email
- ✓ Histórico de compras está acessível
- ✗ Não deve adicionar créditos se pagamento for recusado
- ✗ Não deve permitir compra duplicada na mesma transação

---

### US-703 — Receber alerta quando créditos estão acabando
**Como** Admin (`P1`),  
**quero** receber email/notificação quando saldo cair abaixo de 10% de meu plano,  
**para que** eu tenha tempo de recarregar antes de ficar sem créditos.

**Critérios de aceite:**
- ✓ Alerta é enviado quando saldo < 10% da quota mensal
- ✓ Email contém link direto para comprar créditos
- ✓ Alerta não é reenviado até créditos aumentarem
- ✓ Admin pode desabilitar alertas nas configurações
- ✗ Não deve enviar multiple alertas para mesma situação
- ✗ Não deve enviar se tenant está suspenso

---

### US-704 — Limites mensais de créditos por plano
**Como** Admin (`P1`),  
**quero** saber qual é meu limite mensal de créditos conforme meu plano,  
**para que** eu planeje o crescimento.

**Critérios de aceite:**
- ✓ Dashboard exibe: créditos restantes, limite mensal, % consumido
- ✓ Plano Trial: 500 créditos/mês
- ✓ Plano Starter: 1500 créditos/mês
- ✓ Plano Pro: 8000 créditos/mês
- ✓ Plano Business: 30000 créditos/mês
- ✓ Rollover parcial até 10% (créditos não usados)
- ✗ Não deve permitir usar créditos além do limite
- ✗ Não deve resetar manualmente (apenas no billing date)

---
