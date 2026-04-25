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

## Módulo 11 — Planos e Subscrições

### US-1001 — Visualizar planos disponíveis
**Como** Admin (`P1`),  
**quero** ver todos os planos (Trial, Starter, Pro, Business) com créditos, preços e features,  
**para que** eu escolha qual é melhor para meu negócio.

**Critérios de aceite:**
- ✓ Exibe 4 cards: Trial (grátis), Starter (R$49), Pro (R$99), Business (R$199)
- ✓ Cada card mostra: créditos/mês, features (profissionais, agendamentos, dashboard)
- ✓ Plano atual está destacado com badge "Ativo"
- ✓ Botões: "Fazer upgrade", "Manter", "Cancelar subscrição"
- ✗ Não deve permitir downgrade manual se há dependências (ex: 5 profissionais no Starter que permite 3)

---

### US-1002 — Fazer upgrade ou downgrade de plano
**Como** Admin (`P1`),  
**quero** mudar de plano (ex: Starter → Pro) ou descer (Pro → Starter),  
**para que** eu pague somente pelo que preciso.

**Critérios de aceite:**
- ✓ Upgrade redirecion para Stripe com novo valor (pro-rata se houver dias restantes)
- ✓ Downgrade pede confirmação sobre perda de créditos excedentes
- ✓ Após confirmação de pagamento, novo plano é ativado
- ✓ Créditos restantes são resetados para novo limite
- ✓ Email confirma mudança de plano
- ✗ Não deve permitir downgrade se há dependências não resolvidas
- ✗ Não deve perder histórico de billing

---

### US-1003 — Cancelar subscrição e voltar para Trial
**Como** Admin (`P1`),  
**quero** cancelar minha subscrição paga e voltar para Trial,  
**para que** eu possa pausar se necessário.

**Critérios de aceite:**
- ✓ Botão "Cancelar subscrição" pede confirmação
- ✓ Confirmação avisa: "Você voltará ao Trial com 500 créditos"
- ✓ Após cancelar, status muda para "cancelled"
- ✓ Tenant pode fazer re-upgrade a qualquer momento
- ✓ Email confirma cancelamento
- ✗ Não deve deletar dados ao cancelar
- ✗ Não deve forçar cancelamento imediato (permite até fim do ciclo)

---
