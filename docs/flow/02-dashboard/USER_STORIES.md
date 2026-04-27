# User Stories — Dashboard (Módulo 02)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

**Contexto:** página inicial do painel administrativo após login ([PRD §4.4 e §4.5](../../PRD.md)). Estados de agendamento e calendário: [módulo 05 — Agendamentos](../05-appointments/USER_STORIES.md). Disponibilidade e conflitos pós-bloqueio: [US-417](../04-availability/USER_STORIES.md). Falhas de notificação: [módulo 07](../07-notifications/USER_STORIES.md).

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |

---

## Módulo 02 — Dashboard

### US-101 — Ver resumo operacional do dia e da semana

**Como** Admin (`P1`),  
**quero** ver de imediato quantos agendamentos há hoje, quantos na semana corrente e quantos cancelamentos na semana corrente,  
**para que** eu avalie a carga e perturbações recentes sem abrir outros ecrãs.

**Critérios de aceite:**

- ✓ Exibe contagem de agendamentos com início no **dia civil corrente** (timezone do estabelecimento), estados incluídos conforme definição única de produto (ex.: confirmados + concluídos pendentes de fecho, excluindo cancelados)
- ✓ Exibe contagem de agendamentos na **semana corrente** (segunda a domingo da semana que contém “hoje”, ou equivalente documentado na implementação)
- ✓ Exibe contagem de **cancelamentos na semana corrente** (cancelamentos cujo registo ocorreu dentro dessa janela semanal, no timezone do estabelecimento)
- ✓ Os três números referem-se sempre ao **estabelecimento activo** ([US-102](USER_STORIES.md))
- ✗ Não deve misturar contagens de dois estabelecimentos
- ✗ Não deve inclir gráficos de tendência nem comparativos com períodos anteriores (fora do MVP; ver [módulo 08](../08-reports/USER_STORIES.md))

---

### US-102 — Alternar o estabelecimento activo

**Como** Admin (`P1`),  
**quero** seleccionar qual dos meus estabelecimentos está activo no painel,  
**para que** o dashboard e o resto da navegação mostrem dados do negócio correcto ([PRD §4.5](../../PRD.md)).

**Critérios de aceite:**

- ✓ Selector visível no dashboard (e coerente com o resto do shell do painel) lista apenas estabelecimentos a que o utilizador tem acesso e dentro dos limites do plano ([PRD §10](../../PRD.md))
- ✓ Ao mudar a selecção, o dashboard recarrega métricas, listas e alertas para o novo estabelecimento
- ✓ A escolha persiste na sessão (ou mecanismo equivalente) até o utilizador mudar de novo
- ✓ Link ou atalho para criar/configurar estabelecimento remete ao [módulo 03](../03-establishment-setup/USER_STORIES.md) quando aplicável
- ✗ Não deve expor dados de estabelecimento para o qual o utilizador não tem permissão
- ✗ Não deve permitir “nenhum estabelecimento seleccionado” se existir pelo menos um válido

---

### US-103 — Ver lista de próximos agendamentos com detalhe

**Como** Admin (`P1`),  
**quero** ver os próximos agendamentos com serviço, profissional, horário de início e cliente,  
**para que** eu saiba quem vem a seguir sem abrir o calendário completo.

**Critérios de aceite:**

- ✓ Lista ordenada por data/hora de início ascendente; apenas agendamentos **futuros** ou do **dia corrente** ainda por decorrer (definição única de “próximos”)
- ✓ Cada linha mostra: **serviço** (ou resumo), **profissional** (ou indicação explícita quando vazio — alinhar com [US-106](USER_STORIES.md)), **horário**, **identificação do cliente** (nome e/ou contacto conforme política LGPD)
- ✓ Clicar numa linha navega para o detalhe/edição no módulo de agenda ([US-503](../05-appointments/USER_STORIES.md), [US-504](../05-appointments/USER_STORIES.md))
- ✓ Respeita o estabelecimento activo ([US-102](USER_STORIES.md))
- ✗ Não deve listar agendamentos cancelados como próximos atendimentos
- ✗ Não deve omitir colunas acordadas quando os dados existem na base

---

### US-104 — Ver taxa de no-show dos últimos 30 dias

**Como** Admin (`P1`),  
**quero** ver a taxa de não comparecimento calculada sobre os últimos 30 dias corridos,  
**para que** eu acompanhe disciplina de presenças sem depender de relatórios avançados.

**Critérios de aceite:**

- ✓ Janela: **últimos 30 dias corridos** até “hoje” (timezone do estabelecimento), inclusive
- ✓ **Numerador:** contagem de agendamentos em estado **no_show** com data de início nessa janela
- ✓ **Denominador:** contagem de agendamentos com data de início nessa janela que contam como **compromisso confirmado** no período: estados **confirmed**, **completed** ou **no_show** (exclui **cancelled**), de modo que o rácio seja **no_show ÷ total desses compromissos**, alinhado à intenção *não compareceu / total confirmados no período*
- ✓ Apresentação: percentagem clara (ex.: `no_show / total` + %) e tratamento de **total zero** (ex.: “—” ou “Sem dados” sem erro)
- ✓ Mudanças de estado manuais ou automáticas alinham com [US-505](../05-appointments/USER_STORIES.md) e regra automática referenciada em [US-207](../03-establishment-setup/USER_STORIES.md) sem duplicar implementação aqui
- ✗ Não deve incluir receita nem gráficos de tendência
- ✗ Não deve incluir **cancelled** no denominador

---

### US-105 — Ver próximo horário disponível por profissional

**Como** Admin (`P1`),  
**quero** ver, por cada profissional do estabelecimento activo, o próximo slot livre nos próximos sete dias,  
**para que** eu saiba onde ainda há capacidade para encaixar clientes.

**Critérios de aceite:**

- ✓ Para cada profissional activo no estabelecimento, calcula o **primeiro início de slot válido** nos **próximos 7 dias** a partir de “agora”, segundo as mesmas regras de slot que o motor de disponibilidade ([US-416](../04-availability/USER_STORIES.md))
- ✓ Se não houver slot nesse horizonte para um profissional, exibe **mensagem explícita** (ex.: “Sem horários livres nos próximos 7 dias”) e **atalho** para o módulo [04 — Disponibilidade](../04-availability/USER_STORIES.md)
- ✓ Se **nenhum** profissional tiver slot, o bloco pode mostrar uma única mensagem + o mesmo atalho
- ✓ Respeita estabelecimento activo ([US-102](USER_STORIES.md))
- ✗ Não deve mostrar slots no passado
- ✗ Não deve contradizer a agenda nem os bloqueios já gravados

---

### US-106 — Ser alertado sobre agendamentos confirmados sem profissional

**Como** Admin (`P1`),  
**quero** ver no dashboard um alerta quando existirem agendamentos **confirmados** sem profissional atribuído,  
**para que** eu corrija antes do atendimento.

**Critérios de aceite:**

- ✓ Considera apenas agendamentos em estado **confirmed** sem profissional associado (regra de negócio única para “sem profissional”)
- ✓ Mostra contagem e/ou lista resumida com atalho para resolver no módulo de agenda ([US-503](../05-appointments/USER_STORIES.md))
- ✓ Não dispara ruído para estados cancelados, concluídos ou no_show
- ✗ Não deve listar agendamentos pendentes ou rascunho se esses estados existirem apenas como internos
- ✗ Não deve omitir conflitos por limite de lista sem indicação de “ver mais” ou navegação equivalente

---

### US-107 — Ser alertado sobre conflitos de disponibilidade pós-US-417

**Como** Admin (`P1`),  
**quero** ver no dashboard quando existirem **conflitos pendentes** resultantes de um bloqueio gravado segundo a opção B de [US-417](../04-availability/USER_STORIES.md),  
**para que** eu trate cancelamentos em massa ou ajustes sem esquecer a operação.

**Critérios de aceite:**

- ✓ O alerta cobre **apenas** o cenário **após** gravação de bloqueio (ou equivalente) em que o sistema manteve o bloqueio e listou agendamentos **confirmados** intersectores, **ainda não resolvidos** por cancelamento em massa ou alteração (definição de “pendente” alinhada ao produto)
- ✓ Cada item referencia data/hora, profissional e cliente em resumo, com atalho para o ecrã de resolução no módulo 04
- ✓ Não mistura com outros tipos de “inconsistência” leve (ex.: serviço sem profissional no cadastro) — esses ficam fora desta US
- ✗ Não deve marcar como conflito US-417 situações não cobertas por essa história
- ✗ Não deve desaparecer silenciosamente sem actualização quando o dono resolve na UI de destino

---

### US-108 — Ser alertado sobre falha definitiva no lembrete de 2 horas

**Como** Admin (`P1`),  
**quero** ver no dashboard quando o sistema registar **falha definitiva** no envio do **lembrete de 2 horas** antes do agendamento,  
**para que** eu possa contactar o cliente manualmente se necessário ([US-703](../07-notifications/USER_STORIES.md), [US-707](../07-notifications/USER_STORIES.md)).

**Critérios de aceite:**

- ✓ Lista ou contador de ocorrências em que, após retries, o lembrete **2h** ficou em **falha definitiva**; inclui identificação mínima do agendamento (sem expor segredos nem tokens)
- ✓ **Não** inclui neste alerta falhas definitivas só em confirmação inicial, lembrete 24h ou outros tipos ([política do 07](../07-notifications/USER_STORIES.md))
- ✓ Atalho para consultar detalhes ou fila de notificações no âmbito do produto (módulo 07 ou ecrã associado)
- ✗ Não deve duplicar o mesmo evento de falha (idempotência de apresentação, alinhada à [US-703](../07-notifications/USER_STORIES.md))
- ✗ Não deve tratar falha transitória ainda em retry como alerta definitivo

---

### US-109 — Usar atalhos e acções rápidas a partir do dashboard

**Como** Admin (`P1`),  
**quero** abrir a partir do dashboard os ecrãs certos (agenda, disponibilidade, notificações, configuração do estabelecimento) com contexto mínimo,  
**para que** eu actue sem navegar por vários menus.

**Critérios de aceite:**

- ✓ Os widgets de [US-101](USER_STORIES.md) a [US-108](USER_STORIES.md) expõem **links ou botões** com destino documentado (agenda, 04, 07, 03 conforme o caso)
- ✓ “Ver agenda completa” ou equivalente leva à vista calendário ([US-504](../05-appointments/USER_STORIES.md))
- ✓ Navegação mantém o estabelecimento activo ([US-102](USER_STORIES.md)) onde aplicável
- ✗ Não deve prometer acções fora do MVP (ex.: relatórios comparativos, receita)
- ✗ Não deve abrir módulos sem permissão se no futuro existirem roles restringidas no mesmo shell

---

## Referências cruzadas

- Autenticação e redireccionamento pós-login: [módulo 01](../01-auth/USER_STORIES.md)  
- Setup e limite de estabelecimentos: [módulo 03](../03-establishment-setup/USER_STORIES.md)  
- Página pública (cliente): [módulo 06](../06-public-booking-page/USER_STORIES.md)  
- Relatórios e tendências: [módulo 08](../08-reports/USER_STORIES.md)
