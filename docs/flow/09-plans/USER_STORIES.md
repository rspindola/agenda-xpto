# User Stories — Planos e limites (Módulo 09)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

**Contexto:** planos, trial, limites mensais do Starter, upgrade/downgrade e funcionalidades por plano ([PRD §10](../../PRD.md)). Multi-estabelecimentos: [módulo 03](../03-establishment-setup/USER_STORIES.md). Alertas ao dono no painel: padrão alinhado ao [módulo 02 — Dashboard](../02-dashboard/USER_STORIES.md). Página pública de agendamento: [módulo 06](../06-public-booking-page/USER_STORIES.md). Notificações por e-mail: [módulo 07](../07-notifications/USER_STORIES.md).

**Planos (referência de produto):**

| Plano | Estabelecimentos | Profissionais | Agendamentos/mês | Preço estimado |
|-------|------------------|---------------|------------------|----------------|
| Starter | 1 | até 2 | até 100 | R$ 59/mês |
| Pro | até 3 | até 10 por estabelecimento | ilimitado | R$ 129/mês |
| Business | até 10 | ilimitado | ilimitado | R$ 249/mês |

> Preços são referência — não definitivos.

**Trial:** 15 dias gratuitos no plano **Pro** para novos cadastros; sem cartão até a conversão para plano pago.

**Contagem Starter (limite mensal):** agendamentos **criados** no mês civil, no **timezone do estabelecimento**; o contador **reinicia no dia 1** desse timezone.

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor. Acede ao painel web. |
| `P2` | **Cliente** | Cliente final. Agenda pela página pública. |

---

## Módulo 09 — Planos, trial e limites

### US-110 — Ver plano actual e limites

**Como** Admin (`P1`),  
**quero** ver o meu plano actual, limites (estabelecimentos, profissionais, agendamentos por mês quando aplicável), estado do trial ou datas de ciclo de facturação,  
**para que** eu saiba o que posso usar e quando preciso de upgrade.

**Critérios de aceite:**

- ✓ Exibe plano actual: Starter, Pro ou Business (ou estado **trial Pro** com dias restantes)
- ✓ Mostra limites do plano: máximo de estabelecimentos, profissionais (por estabelecimento quando aplicável), e para Starter o tecto de **100** agendamentos criados no mês civil
- ✓ Para Starter, mostra **uso actual no mês** (contagem de agendamentos criados no mês civil, timezone do estabelecimento activo) e data de **reinício no dia 1**
- ✓ Comparação resumida com outros planos (preços referência, limites) com atalho para conversão ou upgrade
- ✓ Respeita estabelecimento activo para métricas por estabelecimento quando o produto assim definir a UI ([US-102](../02-dashboard/USER_STORIES.md))
- ✗ Não deve omitir que o trial é **Pro** sem cartão até conversão
- ✗ Não deve mostrar preços como definitivos sem a nota de referência

---

### US-111 — Iniciar trial Pro (15 dias, sem cartão)

**Como** Admin (`P1`) novo,  
**quero** entrar automaticamente em trial do plano **Pro** por 15 dias **sem** fornecer cartão,  
**para que** eu experimente limites superiores antes de pagar.

**Critérios de aceite:**

- ✓ Após cadastro válido (e fluxo definido em [módulo 01](../01-auth/USER_STORIES.md)), a conta fica em **trial Pro** com duração de **15 dias** a partir da data de início do trial
- ✓ Não é exigido cartão para iniciar ou usar o trial
- ✓ Painel mostra badge ou secção clara: “Trial Pro — X dias restantes”
- ✓ E-mail de boas-vindas ou equivalente menciona trial, duração e que o cartão só será pedido na **conversão** ([US-113](USER_STORIES.md))
- ✗ Não deve cobrar durante o trial sem acção explícita do utilizador em conversão
- ✗ Não deve prometer funcionalidades fora do MVP como incluídas no trial, salvo roadmap documentado ([US-119](USER_STORIES.md))

---

### US-112 — Receber alertas de expiração do trial

**Como** Admin (`P1`) em trial Pro,  
**quero** ser alertado no painel (e por e-mail quando aplicável) à medida que o trial se aproxima do fim,  
**para que** eu converta a tempo ou saiba que passarei a Starter.

**Critérios de aceite:**

- ✓ Alertas no painel em marcos acordados (ex.: faltam 7 dias, 3 dias, 1 dia e último dia), visíveis de forma consistente com alertas do dashboard ([módulo 02](../02-dashboard/USER_STORIES.md))
- ✓ E-mail (ou canal canónico) alinhado a [módulo 07](../07-notifications/USER_STORIES.md) para os mesmos marcos, sem duplicar spam (idempotência por marco/dia)
- ✓ Mensagem indica que, **sem conversão**, ocorrerá **downgrade automático para Starter** ao fim do trial
- ✓ CTA para conversão ([US-113](USER_STORIES.md)) presente nos alertas
- ✗ Não deve afirmar bloqueio total da conta após o trial (política: Starter automático)
- ✗ Não deve omitir a data/hora de fim do trial no timezone relevante da conta

---

### US-113 — Converter trial para plano pago

**Como** Admin (`P1`) em trial Pro,  
**quero** escolher Starter, Pro ou Business e concluir o pagamento com cartão (ou método definido),  
**para que** o meu plano pago fique activo sem interrupção injusta de limites úteis.

**Critérios de aceite:**

- ✓ Fluxo permite escolher **Starter**, **Pro** ou **Business**
- ✓ **Cartão (ou método de pagamento)** só é exigido neste fluxo de conversão, não no início do trial ([US-111](USER_STORIES.md))
- ✓ Após pagamento confirmado, estado deixa de ser trial e passa a **plano pago** seleccionado; quotas do plano escolhido aplicam-se conforme [US-117](USER_STORIES.md)
- ✓ E-mail de confirmação da subscrição
- ✗ Não deve manter “trial Pro” após conversão bem-sucedida
- ✗ Não deve permitir concluir conversão sem método de pagamento válido quando o plano escolhido é pago

---

### US-114 — Alerta Starter aos 80 agendamentos no mês

**Como** Admin (`P1`) no plano Starter,  
**quero** ver no painel um alerta quando o número de agendamentos **criados** no mês civil atingir **80** (faltam 20 para o limite),  
**para que** eu antecipe upgrade ou gestão de volume.

**Critérios de aceite:**

- ✓ Contagem: agendamentos **criados** no **mês civil** no **timezone do estabelecimento**; reinício no **dia 1** ([US-110](USER_STORIES.md))
- ✓ Ao atingir 80 no mês, exibe alerta no painel ao dono (estabelecimento activo ou agregação conforme definição única de produto; documentar se for por estabelecimento)
- ✓ Mensagem indica explicitamente “faltam 20” para 100 e CTA de upgrade
- ✗ Não deve disparar antes de 80 nem repetir ruído sem necessidade (ex.: uma vez por marco até novo mês, salvo regra de “snooze” explícita)
- ✗ Não deve usar outra base temporal que não seja mês civil no timezone do estabelecimento ([US-110](USER_STORIES.md))

---

### US-115 — Segundo alerta Starter aos 90 agendamentos no mês

**Como** Admin (`P1`) no plano Starter,  
**quero** um segundo alerta no painel ao atingir **90** agendamentos criados no mês (**faltam 10**),  
**para que** o risco de bloqueio na página pública não me surpreenda.

**Critérios de aceite:**

- ✓ Mesma base de contagem que [US-114](USER_STORIES.md)
- ✓ Ao atingir 90, segundo alerta distinto do de 80 (copy e prioridade visual)
- ✓ Indica “faltam 10” e CTA de upgrade
- ✗ Não deve substituir silenciosamente o alerta de 80 sem registo de que ambos os marcos foram atingidos
- ✗ Não deve confundir com alertas de trial ([US-112](USER_STORIES.md))

---

### US-116 — Bloquear novos agendamentos na página pública aos 100 (Starter)

**Como** Admin (`P1`) no Starter,  
**quero** que ao atingir **100** agendamentos criados no mês a **página pública** deixe de aceitar **novos** agendamentos, e que no painel veja aviso claro com CTA de upgrade,  
**para que** clientes não criem compromissos além do plano e eu saiba como desbloquear.

**Critérios de aceite:**

- ✓ À contagem **100** no mês civil (timezone do estabelecimento), a **página pública** bloqueia **apenas a criação de novos** agendamentos ([módulo 06](../06-public-booking-page/USER_STORIES.md))
- ✓ Os agendamentos já existentes no mês (até 100 e anteriores) **mantêm-se** operacionais (lembretes, cancelamento, etc., conforme outros módulos)
- ✓ No painel, aviso claro de “limite mensal atingido” com CTA de **upgrade**
- ✓ Agendamentos criados **manualmente pelo dono** no painel: definir política — recomendação no MVP: **mesmo tecto** aplica-se a criações via painel para consistência do “criados no mês”; documentar se divergir
- ✗ Não deve apagar ou cancelar automaticamente agendamentos existentes ao atingir 100
- ✗ Não deve permitir que **Cliente** (`P2`) finalize novo agendamento público acima do limite

---

### US-117 — Upgrade com efeito imediato em limites

**Como** Admin (`P1`),  
**quero** que ao fazer **upgrade** de plano os **limites** (estabelecimentos, profissionais, agendamentos mensais) passem a refletir o novo plano **de imediato** após confirmação de pagamento,  
**para que** eu desbloqueie operação sem esperar o próximo ciclo.

**Critérios de aceite:**

- ✓ Após confirmação de pagamento do upgrade, UI e validações (novos estabelecimentos, profissionais, agendamentos públicos) usam os limites do **novo** plano imediatamente
- ✓ Se o Starter estava em cap público ([US-116](USER_STORIES.md)), upgrade para plano com agendamentos ilimitados **remove** o bloqueio de novos na página pública assim que o estado de subscrição actualizar
- ✓ E-mail de confirmação da mudança de plano
- ✗ Não deve atrasar desbloqueio de limite por “apenas próximo ciclo” no caso de **upgrade**
- ✗ Não deve permitir upgrade sem sucesso de pagamento quando o produto exige pagamento antecipado

---

### US-118 — Downgrade com conflito (hard gate, assistente, facturação no próximo ciclo)

**Como** Admin (`P1`),  
**quero** ser impedido de concluir **downgrade** enquanto tiver mais estabelecimentos ou profissionais do que o plano de destino permite, e ser guiado por um **assistente** para resolver (sem perder dados),  
**para que** o sistema nunca fique num estado incoherente.

**Critérios de aceite:**

- ✓ **Hard gate:** não é possível confirmar downgrade enquanto existirem violações aos limites do plano de **destino** (ex.: Pro → Starter com mais de 1 estabelecimento ou mais de 2 profissionais no estabelecimento que permanece activo)
- ✓ **Assistente** lista conflitos e acções necessárias: arquivar/desactivar estabelecimentos excedentes e/ou remover ou desactivar profissionais até cumprir tetos; **dados preservados** (histórico, arquivos conforme modelo de dados)
- ✓ **Facturação / preço** do novo plano: **próximo ciclo** após confirmação (downgrade não antecipa cobrança ao novo preço no meio do ciclo, salvo regra legal/comercial explícita noutro doc)
- ✓ **Limites** (quotas de uso e regras de UI): **imediato após confirmação** do downgrade — a partir daí aplicam-se validações do plano mais baixo
- ✓ Selector de estabelecimento activo só mostra estabelecimentos **dentro** do limite ([US-102](../02-dashboard/USER_STORIES.md)); arquivados fora do limite não seleccionáveis até novo upgrade ou reactivação conforme política
- ✓ E-mail de confirmação da alteração de plano e data efectiva de facturação
- ✗ Não deve apagar dados do dono para forçar downgrade
- ✗ Não deve permitir estado “Starter com 3 estabelecimentos activos”

---

### US-119 — Funcionalidades restritas por plano (roadmap)

**Como** Admin (`P1`),  
**quero** saber que certas funcionalidades só existem em planos superiores ou estão no roadmap,  
**para que** eu alinhe expectativas com o meu negócio.

**Critérios de aceite:**

- ✓ **WhatsApp IA** (e créditos associados, se aplicável): apenas **Pro** e **Business** — versão estimada **v1.2** ([PRD §5](../../PRD.md))
- ✓ **Relatórios analíticos Pro** (detalhe no [módulo 08](../08-reports/USER_STORIES.md)): apenas **Pro** e **Business**; no **Starter** aparecem com **cadeado** e CTA de upgrade. Incluem, entre outros definidos em produto: **horários de pico**, **serviços mais rentáveis** (preço ÷ duração), **taxa de retorno de clientes**, **antecedência média** e **cancelamentos por motivo** quando o motivo existir no produto.
- ✓ **Relatórios financeiros avançados** (ex.: **receita realizada e projetada**, **ticket médio por cliente**, métricas dependentes de **pagamento online**): apenas **Business** — versão estimada **v2.0** ([PRD §5](../../PRD.md)); documentação canónica futura no módulo 08 quando existir escopo.
- ✓ Quando a funcionalidade existir na UI, utilizadores fora do plano veem indicação “indisponível no seu plano” e CTA de upgrade onde fizer sentido
- ✗ Não deve prometer datas como compromisso legal; manter “estimado”
- ✗ Não deve listar funcionalidades de roadmap como inclusas no MVP sem flag clara de futuro

---

## Fim do trial sem conversão

- ✓ Ao terminar o trial **sem** [US-113](USER_STORIES.md), a conta transita **automaticamente** para **Starter** (com limites Starter, incluindo contagem mensal de agendamentos)
- ✗ Não aplicar bloqueio total de login ou apagamento de dados por mero fim de trial

---

## Referências cruzadas

- Autenticação e cadastro: [módulo 01](../01-auth/USER_STORIES.md)  
- Dashboard e alertas: [módulo 02](../02-dashboard/USER_STORIES.md)  
- Estabelecimentos e profissionais: [módulo 03](../03-establishment-setup/USER_STORIES.md)  
- Página pública: [módulo 06](../06-public-booking-page/USER_STORIES.md)  
- Notificações: [módulo 07](../07-notifications/USER_STORIES.md)  
- Relatórios e análises: [módulo 08](../08-reports/USER_STORIES.md)
