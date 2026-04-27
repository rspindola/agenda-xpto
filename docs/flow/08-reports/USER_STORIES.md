# User Stories — Relatórios (Módulo 08)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

**Contexto:** relatórios e análises do painel administrativo ([PRD §4.4](../../PRD.md), multi-estabelecimentos [§4.5](../../PRD.md)). O [módulo 02 — Dashboard](../02-dashboard/USER_STORIES.md) mostra **resumo** operacional (ex.: dia, semana, no-show em 30 dias fixos); este módulo é o **detalhamento histórico** com filtros e exportação. Estados de agendamento: [módulo 05](../05-appointments/USER_STORIES.md) ([US-505](../05-appointments/USER_STORIES.md)). Restrições por plano: [US-119](../09-plans/USER_STORIES.md).

**Timezone:** métricas usam o **timezone do estabelecimento** seleccionado nos filtros (ou do estabelecimento activo quando a UI assim o definir).

**Limite de intervalo:** diferença entre data fim e data início **≤ 366 dias**.

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor. Acede ao painel web. |

---

## Módulo 08 — Relatórios

### US-120 — Aceder à área de relatórios e ver catálogo

**Como** Admin (`P1`),  
**quero** abrir a secção de relatórios e ver a lista de relatórios disponíveis, distinguindo os que exigem plano Pro ou superior,  
**para que** eu saiba o que posso consultar e como desbloquear o resto.

**Critérios de aceite:**

- ✓ Menu ou rota canónica (ex.: Painel → **Relatórios**) leva à página de relatórios
- ✓ Lista todos os relatórios definidos em produto: **básicos** (todos os planos) e **Pro/Business** (marcados com cadeado ou badge **Pro** no Starter)
- ✓ No plano **Starter**, relatórios Pro mostram **pré-visualização bloqueada** ou equivalente e **CTA de upgrade** alinhado a [US-119](../09-plans/USER_STORIES.md)
- ✓ Nos planos **Pro** e **Business**, todos os relatórios do catálogo estão acessíveis sem cadeado (sujeito a [US-119](../09-plans/USER_STORIES.md) para **financeiro avançado** futuro apenas Business)
- ✗ Não deve ocultar a existência de relatórios Pro ao Starter (transparência)
- ✗ Não deve prometer receita realizada / ticket médio no MVP como funcionalidade activa (roadmap neste ficheiro e [US-119](../09-plans/USER_STORIES.md))

---

### US-121 — Aplicar filtros globais aos relatórios

**Como** Admin (`P1`),  
**quero** definir período por **data início** e **data fim**, estabelecimento e profissional,  
**para que** os números correspondam ao contexto que quero analisar.

**Critérios de aceite:**

- ✓ Filtros disponíveis em todos os relatórios: **data início**, **data fim** (inclusivas no timezone do estabelecimento), **estabelecimento** (alinhado a [PRD §4.5](../../PRD.md)), **profissional** (opção “todos”)
- ✓ Validação: data fim ≥ data início; intervalo máximo **366 dias** entre início e fim
- ✓ Ao alterar filtros, o utilizador aplica explicitamente ou a UI define comportamento único (auto-refresh vs botão “Aplicar”) — documentar na implementação sem ambiguidade para o utilizador
- ✗ Não deve permitir intervalo superior a 366 dias
- ✗ Não deve misturar dados de dois estabelecimentos quando um único está seleccionado

---

### US-122 — Relatório: agendamentos realizados no período

**Como** Admin (`P1`),  
**quero** ver quantos agendamentos foram **realizados** no período filtrado,  
**para que** eu meça volume de conclusões.

**Critérios de aceite:**

- ✓ Conta agendamentos em estado **`completed`** cuja **`start_at`** cai no intervalo \[início, fim\] no timezone do estabelecimento ([US-505](../05-appointments/USER_STORIES.md))
- ✓ Respeita filtros de [US-121](USER_STORIES.md) (estabelecimento, profissional)
- ✓ Apresentação em tabela e/ou total agregado; exportação coberta por [US-127](USER_STORIES.md)
- ✗ Não deve incluir `confirmed` sem `completed` como “realizado”
- ✗ Não deve duplicar a definição do resumo diário do [US-101](../02-dashboard/USER_STORIES.md) — aqui o período é **o filtro**, não só “hoje”

---

### US-123 — Relatório: cancelamentos no período

**Como** Admin (`P1`),  
**quero** ver cancelamentos no período filtrado,  
**para que** eu acompanhe desistências.

**Critérios de aceite:**

- ✓ Inclui apenas agendamentos em estado **`cancelled`**
- ✓ **Primário:** filtro por **`cancelled_at`** dentro de \[início, fim\] no timezone do estabelecimento, quando o campo existir
- ✓ **Fallback MVP:** se `cancelled_at` não existir, usar agendamentos **`cancelled`** cuja **`start_at`** está no intervalo (documentar transição até o modelo ter `cancelled_at`)
- ✓ Respeita [US-121](USER_STORIES.md)
- ✗ Não deve contar cancelamentos fora do critério temporal acordado
- ✗ Não deve omitir qual regra está activa (primária vs fallback) na ajuda interna ou documentação de produto

---

### US-124 — Relatório: taxa de no-show no período

**Como** Admin (`P1`),  
**quero** ver a taxa de não comparecimento para o período filtrado,  
**para que** eu avalie faltas em paralelo ao resumo de 30 dias do dashboard.

**Critérios de aceite:**

- ✓ Janela temporal = intervalo de [US-121](USER_STORIES.md); **data de referência do slot:** `start_at` no intervalo (timezone estabelecimento)
- ✓ **Numerador:** contagem `no_show` com `start_at` no intervalo
- ✓ **Denominador:** agendamentos com `start_at` no intervalo em **`confirmed`**, **`completed`** ou **`no_show`** (exclui **`cancelled`**), alinhado à intenção e à fórmula de [US-104](../02-dashboard/USER_STORIES.md)
- ✓ Apresentação: percentagem e fracção (ex.: `no_show / total`); total zero → “Sem dados” ou equivalente sem erro
- ✗ Não deve incluir **`cancelled`** no denominador
- ✗ Não deve contradizer [US-505](../05-appointments/USER_STORIES.md) para estados

---

### US-125 — Relatório: agendamentos por profissional

**Como** Admin (`P1`),  
**quero** ver a distribuição de agendamentos por profissional no período,  
**para que** eu compare carga entre membros da equipa.

**Critérios de aceite:**

- ✓ Agrega contagens por profissional com `start_at` no intervalo e filtros de [US-121](USER_STORIES.md)
- ✓ Inclui apenas agendamentos em **`confirmed`**, **`completed`** ou **`no_show`**; **exclui `cancelled`** (coerente com [US-128](USER_STORIES.md))
- ✗ Não deve vazar dados de profissionais de outro estabelecimento quando o filtro restringe um estabelecimento
- ✗ Não deve ignorar o filtro “profissional” quando seleccionado (restringe às linhas desse profissional)

---

### US-126 — Relatório: agendamentos por serviço

**Como** Admin (`P1`),  
**quero** ver a distribuição de agendamentos por serviço no período,  
**para que** eu identifique serviços mais procurados.

**Critérios de aceite:**

- ✓ Agrega por serviço no intervalo e filtros de [US-121](USER_STORIES.md)
- ✓ Mesma política de estados que [US-125](USER_STORIES.md): `confirmed`, `completed`, `no_show`; **exclui `cancelled`**
- ✓ Apresentação tabular; exportação em [US-127](USER_STORIES.md)
- ✗ Não deve agregar serviços de outro estabelecimento quando o filtro fixa um estabelecimento
- ✗ Não deve contar serviço nulo sem linha explícita “Sem serviço” se isso for possível no modelo

---

### US-127 — Exportar relatório em CSV e PDF

**Como** Admin (`P1`),  
**quero** exportar o resultado do relatório visível em **CSV** e em **PDF**,  
**para que** eu partilhe ou arquive os números.

**Critérios de aceite:**

- ✓ Disponível em **Starter**, **Pro** e **Business** para relatórios **desbloqueados**; para relatório Pro visto em modo bloqueado no Starter, exportação permanece indisponível até upgrade ([US-120](USER_STORIES.md))
- ✓ **CSV:** inclui cabeçalhos, dados filtrados e metadados mínimos (período, estabelecimento, data/hora de geração)
- ✓ **PDF:** mesmo conteúdo essencial legível (tabela ou resumo); metadados de período e estabelecimento
- ✓ Export reflecte filtros de [US-121](USER_STORIES.md) e o relatório seleccionado
- ✗ Não deve exportar dados de estabelecimento não autorizado ao utilizador
- ✗ Não deve incluir tokens ou PII desnecessários além do necessário ao relatório

---

### US-128 — Relatório Pro: horários de pico

**Como** Admin (`P1`) em plano **Pro** ou **Business**,  
**quero** ver em que **dias da semana** e **horas** (arredondadas a **60 minutos**) há mais agendamentos,  
**para que** eu ajuste disponibilidade e marketing.

**Critérios de aceite:**

- ✓ Agregação: **dia da semana** + **hora de início** arredondada a **60 min** (ex.: slot 14:37 → 14:00) usando `start_at` no timezone do estabelecimento
- ✓ Inclui apenas agendamentos **`confirmed`**, **`completed`**, **`no_show`** com `start_at` no intervalo de [US-121](USER_STORIES.md); **exclui `cancelled`**
- ✓ Plano **Starter:** UI com cadeado e CTA upgrade ([US-120](USER_STORIES.md))
- ✗ Não deve tratar cancelado como pico de procura
- ✗ Não deve usar intervalo superior a 366 dias

---

### US-129 — Relatório Pro: serviços mais rentáveis (receita por hora teórica)

**Como** Admin (`P1`) em plano **Pro** ou **Business**,  
**quero** ordenar serviços por **preço ÷ duração** (receita por hora teórica),  
**para que** eu compare rentabilidade relativa sem depender de pagamento online.

**Critérios de aceite:**

- ✓ Métrica por serviço: **preço do serviço ÷ duração em horas** (ou equivalente R$/h) a partir do cadastro actual de serviços ([módulo 03](../03-establishment-setup/USER_STORIES.md)); não confundir com “receita realizada” (roadmap v2.0 / [US-119](../09-plans/USER_STORIES.md))
- ✓ Lista ordenável; pode combinar com volume no período (opcional) para contexto
- ✓ Starter: cadeado + CTA ([US-120](USER_STORIES.md))
- ✗ Não deve apresentar como “dinheiro recebido” no MVP
- ✗ Não deve usar duração zero (validação de serviço)

---

### US-130 — Relatórios Pro: retorno de clientes, antecedência média e cancelamentos por motivo

**Como** Admin (`P1`) em plano **Pro** ou **Business**,  
**quero** ver taxa de retorno de clientes, tempo médio de antecedência ao agendar e, quando existir, cancelamentos por motivo,  
**para que** eu aprofunde fidelização e fricção no cancelamento.

**Critérios de aceite:**

- ✓ **Taxa de retorno:** entre clientes distintos com **pelo menos um** agendamento com `start_at` no período filtrado em **`confirmed`**, **`completed`** ou **`no_show`** (exclui **`cancelled`**), percentagem com **≥ 2** agendamentos nesses estados com `start_at` no **mesmo** período filtrado
- ✓ **Tempo médio de antecedência:** média de **`start_at` − `created_at`** (ou timestamp canónico de criação) por agendamento com `start_at` no período e estados **`confirmed`**, **`completed`** ou **`no_show`** (exclui **`cancelled`**)
- ✓ **Cancelamentos por motivo:** quando o modelo suportar **motivo** no cancelamento (**dependência futura** [módulo 05](../05-appointments/USER_STORIES.md) / [módulo 06](../06-public-booking-page/USER_STORIES.md)), agrupar contagens por motivo; até lá, ocultar ou mostrar “Indisponível até captura de motivo” sem inventar dados
- ✓ Starter: cadeado + CTA ([US-120](USER_STORIES.md))
- ✗ Não deve inventar motivo de cancelamento
- ✗ Não deve contradizer o fallback de [US-123](USER_STORIES.md) para janela de cancelados

---

## Roadmap (fora do MVP)

- **Receita realizada / projetada**, **ticket médio por cliente**: dependem de **pagamento online** e relatórios financeiros avançados — **Business**, versão estimada **v2.0** ([PRD §5](../../PRD.md), [US-119](../09-plans/USER_STORIES.md)). Não documentar como funcionalidade MVP activa neste módulo.

---

## Referências cruzadas

- Dashboard: [módulo 02](../02-dashboard/USER_STORIES.md)  
- Agendamentos e estados: [módulo 05](../05-appointments/USER_STORIES.md)  
- Estabelecimentos e serviços: [módulo 03](../03-establishment-setup/USER_STORIES.md)  
- Planos e gating: [módulo 09](../09-plans/USER_STORIES.md)  
- Passo a passo: [step-by-step.md](step-by-step.md)
