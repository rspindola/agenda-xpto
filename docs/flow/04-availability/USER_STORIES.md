# User Stories — Disponibilidade (Módulo 04)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

Este módulo documenta **exclusivamente** o que o dono configura no painel para definir **quando** os profissionais estão disponíveis e as regras usadas pelo sistema ao **consultar slots** na página pública ([módulo 06](../06-public-booking-page/USER_STORIES.md)). O cadastro de profissionais e serviços permanece documentado no [módulo 03](../03-establishment-setup/USER_STORIES.md).

As user stories **US-410 a US-418** substituem, no âmbito da documentação actual, as histórias **US-202, US-203 e US-304** que constavam no histórico do módulo 03 (conteúdo de disponibilidade deslocado para aqui).

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Dono / Admin** | Configura expediente, disponibilidade por profissional, feriados, bloqueios e antecedência mínima no painel web. |
| `P2` | **Cliente** | Consumidor da página pública; o detalhe da jornada de agendamento está no módulo 06 — aqui referenciado apenas onde impacta regras de disponibilidade. |

---

## Módulo 04 — Configuração e regras

### US-410 — Configurar horário de funcionamento do estabelecimento

**Como** Dono (`P1`),  
**quero** definir dias da semana com abertura, fechamento e intervalo de almoço opcional,  
**para que** o sistema limite o agendamento ao período em que o negócio está aberto.

**Critérios de aceite:**

- ✓ Interface permite configurar os 7 dias (seg–dom); dia desativado = fechado
- ✓ Horários validados (abertura antes do fechamento)
- ✓ Intervalo de almoço opcional e obrigatoriamente contido no expediente do dia
- ✓ Dados persistidos geram blocos base de disponibilidade do **estabelecimento**
- ✓ Cada dia pode ter configuração distinta
- ✗ Não deve aceitar horário invertido (ex.: 18:00–09:00)
- ✗ Não deve permitir intervalo de almoço fora do expediente

---

### US-411 — Configurar disponibilidade semanal por profissional

**Como** Dono (`P1`),  
**quero** definir, para cada profissional já cadastrado, os blocos em que pode atender (por dia da semana),  
**para que** a agenda reflita a carga real de cada pessoa e possa diferir do expediente geral.

**Critérios de aceite:**

- ✓ Seleção de profissional; para cada dia da semana, um ou mais blocos início–fim ou dia marcado como folga
- ✓ Blocos do profissional são validados contra si mesmos (sem sobreposição inválida) e **contidos na união do expediente do estabelecimento** nos dias em que o estabelecimento está aberto (fora disso, o dia aparece indisponível para aquele profissional)
- ✓ Profissional sem nenhum bloco num dia em que o estabelecimento abre não oferece slots nesse dia
- ✓ Alterações refletem-se na próxima consulta de slots (ex.: invalidação de cache se existir)
- ✗ Não deve permitir guardar bloco que extrapole o expediente do estabelecimento naquele dia
- ✗ Não deve apagar profissional com agendamentos futuros **confirmados** sem fluxo definido no módulo de pessoal (fora do 04)

---

### US-412 — Gerenciar feriados e suspensões do estabelecimento

**Como** Dono (`P1`),  
**quero** cadastrar, editar e remover datas em que o estabelecimento não recebe agendamentos,  
**para que** nenhum slot seja oferecido nesses dias a nenhum profissional.

**Critérios de aceite:**

- ✓ Lista com data e motivo; criar, editar e eliminar com confirmação na exclusão
- ✓ Data duplicada para o mesmo tipo de registo é rejeitada
- ✓ Em dias cobertos por feriado/suspensão global do estabelecimento, **nenhum** slot é retornado para a página pública
- ✗ Não deve permitir data inválida ou regras inconsistentes (ex.: fim antes do início em intervalos multi-dia, se aplicável ao modelo)
- ✗ Não deve eliminar silenciosamente registos que estejam referenciados por auditoria sem registo de quem removeu (se política de auditoria existir)

---

### US-413 — Criar e gerir bloqueios pontuais (folga, férias, fecho, intervalo reservado)

**Como** Dono (`P1`),  
**quero** registar períodos bloqueados por profissional ou para todo o estabelecimento, com motivo,  
**para que** folgas, férias ou fechos extraordinários não gerem slots disponíveis.

**Critérios de aceite:**

- ✓ Tipos de âmbito: **profissional específico** ou **todo o estabelecimento**
- ✓ Intervalo com data/hora início e fim (ou modelo dia inteiro conforme UX)
- ✓ Motivo obrigatório ou fortemente recomendado para auditoria operacional
- ✓ Bloqueio ativo remove ou mascara slots sobrepostos na consulta pública e no painel
- ✓ Listagem, edição e revogação/remoção de bloqueios futuros ou em curso conforme política de negócio
- ✗ Não deve criar bloqueio com intervalo invertido (fim antes do início)
- ✗ Não deve ignorar bloqueio de estabelecimento ao calcular disponibilidade de um profissional

---

### US-414 — Configurar antecedência mínima para novos agendamentos

**Como** Dono (`P1`),  
**quero** definir um tempo mínimo entre “agora” e o início do primeiro slot oferecido,  
**para que** a equipa tenha tempo de preparação (coerente com [US-606](../06-public-booking-page/USER_STORIES.md)).

**Critérios de aceite:**

- ✓ Parâmetro numérico por estabelecimento (ex.: minutos ou horas), com valor mínimo e máximo razoáveis definidos pelo produto
- ✓ Consulta de slots e criação de agendamento no servidor aplicam a mesma regra (`início_slot ≥ agora + antecedência`)
- ✓ Valor exibido ou explicado na área de configurações para o dono
- ✗ Não deve aplicar o valor de outro estabelecimento na mesma conta multi-unidade
- ✗ Não deve permitir apenas validação no cliente sem validação no servidor

---

### US-415 — Visualizar matriz ou vista consolidada de disponibilidade

**Como** Dono (`P1`),  
**quero** ver numa vista única profissionais × dias (e eventualmente serviços),  
**para que** eu detete rapidamente buracos ou sobrecarga.

**Critérios de aceite:**

- ✓ Grelha ou equivalente: linhas = profissionais, colunas = dias (ou vista semanal compacta)
- ✓ Indicação de blocos de trabalho e, se aplicável, serviços associados (leitura a partir do cadastro no 03)
- ✓ Filtro por serviço ou por profissional quando útil
- ✓ Vista é principalmente **leitura**; edição profunda remete aos ecrãs de US-410/US-411/US-413
- ✗ Não deve degradar UX com dezenas de profissionais sem paginação ou limite documentado (ex.: alerta acima de N profissionais)

---

### US-416 — Motor de slots: interseção de regras na consulta pública

**Como** sistema (em benefício do `P2` via módulo 06),  
**quero** calcular slots disponíveis como interseção de expediente, disponibilidade do profissional, feriados, bloqueios, antecedência mínima e ocupação por agendamentos **confirmados**,  
**para que** apenas intervalos realmente livres sejam oferecidos.

**Critérios de aceite:**

- ✓ Entrada: estabelecimento, profissional (ou conjunto), duração total do pedido, janela de datas
- ✓ Saída: lista de instantes de início válidos para bloco contínuo de `duração_total`
- ✓ Regra: slot só é válido se estiver dentro do expediente do estabelecimento **e** dos blocos do profissional **e** fora de feriados globais **e** fora de bloqueios aplicáveis **e** respeitar antecedência mínima **e** não colidir com outro agendamento **confirmado**
- ✓ Mesma lógica executada na API de criação de agendamento (anti-concorrência)
- ✗ Não deve expor ao cliente estados internos de agendamento ([módulo 05](../05-appointments/USER_STORIES.md))
- ✗ Não deve devolver slot que viole qualquer uma das camadas acima

---

### US-417 — Resolver conflito entre novo bloqueio e agendamentos confirmados (opção B)

**Como** Dono (`P1`),  
**quero** poder guardar um bloqueio mesmo quando existam agendamentos **confirmados** que intersectam o período,  
**para que** eu veja a lista de conflitos e possa cancelar em massa com notificação aos clientes.

**Critérios de aceite:**

- ✓ Ao gravar (ou ao pré-visualizar antes de gravar, conforme UX) bloqueio que intersecta intervalos com agendamentos **confirmados**, o sistema **lista todos os conflitos** (data/hora, profissional, cliente, serviços)
- ✓ O dono pode **confirmar o bloqueio** sem cancelar (bloqueio fica guardado) e tratar conflitos depois, **ou** optar por **ação em massa: cancelar** os agendamentos em conflito
- ✓ Cancelamento em massa atualiza cada agendamento para **cancelado**, liberta slots e dispara **notificações ao cliente** conforme [módulo 07](../07-notifications/USER_STORIES.md) (confirmação de cancelamento e, se aplicável, notificação ao dono)
- ✓ Operação registada para auditoria (quem, quando, quais IDs cancelados)
- ✗ Não deve cancelar agendamentos sem confirmação explícita do dono na UI de ação em massa
- ✗ Não deve omitir da lista algum agendamento **confirmado** que intersecte o período do bloqueio

**Nota:** feriados ou alterações de expediente que gerem o mesmo tipo de conflito podem seguir o mesmo padrão de deteção e resolução (reutilização do fluxo de “conflitos com confirmados”).

---

### US-418 — Propagar alterações de disponibilidade à consulta de agendamento

**Como** Dono (`P1`),  
**quero** que alterações em horários, bloqueios ou antecedência se reflitam de imediato nas próximas consultas de slots,  
**para que** os clientes não vejam horários obsoletos.

**Critérios de aceite:**

- ✓ Após gravação bem-sucedida, a próxima consulta pública ou do painel usa os dados novos (invalidação de cache ou semântica equivalente)
- ✗ Não deve devolver slots baseados apenas em cache sem TTL ou invalidação após escrita crítica

---

## Referências cruzadas

- Consumo na página pública: [docs/flow/06-public-booking-page/USER_STORIES.md](../06-public-booking-page/USER_STORIES.md)  
- Estados de agendamento: [docs/flow/05-appointments/diagrams/state-diagram/states.md](../05-appointments/diagrams/state-diagram/states.md)  
- E-mails pós-cancelamento em massa: [docs/flow/07-notifications/USER_STORIES.md](../07-notifications/USER_STORIES.md)
