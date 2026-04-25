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

## Módulo 02 — Dashboard

### US-101 — Visualizar métricas em tempo real
**Como** Admin (`P1`),  
**quero** ver no dashboard os próximos agendamentos, estatísticas do mês e créditos restantes,  
**para que** eu tenha uma visão geral do negócio em um único lugar.

**Critérios de aceite:**
- ✓ Dashboard exibe 6 cards principais (agendamentos, mensagens, créditos, no-show, receita, clientes)
- ✓ Métricas são atualizadas em tempo real (max 5 segundos de delay)
- ✓ Próximos 3 agendamentos aparecem em lista abaixo dos cards
- ✓ Link de logout funciona e encerra sessão
- ✗ Não deve mostrar dados de outros tenants
- ✗ Não deve carregar métricas se usuário não estiver autenticado

---

### US-102 — Exportar relatório de atividades
**Como** Admin (`P1`),  
**quero** exportar em PDF ou CSV o relatório de atividades recentes,  
**para que** eu possa analisar dados fora do sistema e compartilhar com equipe.

**Critérios de aceite:**
- ✓ Botão "Exportar" disponível no dashboard
- ✓ Exportação em PDF inclui logo, data e período
- ✓ Exportação em CSV é compatível com Excel/Google Sheets
- ✓ Arquivo é baixado automaticamente no browser
- ✗ Não deve exportar dados de clientes sem consentimento
- ✗ Não deve falhar se período selecionado estiver vazio

---

### US-103 — Navegar para módulos principais
**Como** Admin (`P1`),  
**quero** acessar rapidamente Agendamentos, WhatsApp, Configurações, Créditos, Relatórios, FAQ e Afiliados,  
**para que** eu não precise procurar as funcionalidades no menu.

**Critérios de aceite:**
- ✓ Sidebar esquerdo exibe 7 ícones principais + Minha Conta + Sair
- ✓ Cada link navega corretamente para seu módulo
- ✓ Ícone destaca-se quando a página atual está selecionada
- ✓ Menu funciona em mobile (colapsível)
- ✗ Não deve permitir acesso a módulos se usuário não tem permissão
- ✗ Não deve quebrar navegação com URLs inválidas

---
