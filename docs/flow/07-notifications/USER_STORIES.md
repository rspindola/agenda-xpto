# User Stories — Notificações (Módulo 07)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Dono / Admin** | Recebe alertas operacionais quando definido (ex.: falha definitiva no lembrete de 2h; cancelamento pelo cliente). |
| `P2` | **Cliente** | Recebe e-mails transacionais e lembretes relacionados ao agendamento. |

**Canais:** MVP **somente e-mail**. Pós-MVP: WhatsApp e SMS (avaliação de provedor gratuito para SMS fica fora do escopo deste documento).

---

## Política de retry e criticidade (decisões de produto)

| Tipo de notificação | Retry em falha | Após esgotar tentativas |
|---------------------|----------------|-------------------------|
| Confirmação de agendamento (imediato) | Sim, **silencioso** (sem e-mail ao dono) | Registrar **falha definitiva** em log; eventual reconciliação operacional |
| Lembrete 24h antes | Sim | Apenas **log** |
| Lembrete 2h antes | Sim | **Log** + **e-mail ao dono** (alerta de falha definitiva) |
| Confirmação de cancelamento (cliente) | Sim, silencioso quanto a alerta ao dono neste tipo | Log em falha definitiva |
| Notificação ao dono — cliente cancelou | Sim, silencioso (sem cascata de “falha ao avisar falha”) | Log em falha definitiva |

**Parâmetros sugeridos de retry:** até **3 tentativas** de envio por notificação, com intervalo **exponencial** entre tentativas (ex.: 1 min, 5 min, 15 min — valores configuráveis por ambiente).

---

## Módulo 07 — E-mail transacional e lembretes

### US-701 — Enviar confirmação de agendamento ao cliente (imediato)

**Como** Cliente (`P2`),  
**quero** receber um e-mail de confirmação logo após concluir o agendamento,  
**para que** eu tenha registro e tranquilidade de que a reserva foi feita.

**Critérios de aceite:**

- ✓ Após o agendamento ser persistido com sucesso (estado **confirmado** visível), o sistema enfileira o envio do e-mail de confirmação
- ✓ O e-mail usa **template fixo** do sistema (MVP: dono **não** edita template)
- ✓ Template inclui: estabelecimento, data/hora, profissional, serviços/combos, dados de contato úteis e **link seguro de cancelamento**
- ✓ Em caso de falha do provedor de e-mail, o sistema reaplica **retry silencioso** (até N tentativas com backoff exponencial)
- ✓ **Não** envia alerta ao dono (`P1`) quando todas as tentativas de confirmação inicial falharem; apenas **registro em log** com severidade adequada
- ✗ Não deve bloquear a resposta HTTP de sucesso do agendamento por esperar o envio síncrono do e-mail
- ✗ Não deve incluir dados de outros clientes no e-mail

---

### US-702 — Enviar lembrete 24 horas antes do agendamento

**Como** Cliente (`P2`),  
**quero** receber um lembrete por e-mail cerca de 24 horas antes do horário,  
**para que** eu não esqueça o compromisso.

**Critérios de aceite:**

- ✓ Notificação é disparada apenas para agendamentos em estado **confirmado**
- ✓ Se o agendamento for **cancelado** antes do horário programado do lembrete, o envio **não** ocorre
- ✓ Janela de agendamento do job evita duplicidade (ex.: tolerância de minutos configurável) e não envia para horários no passado
- ✓ Template fixo do sistema; inclui link de cancelamento quando aplicável
- ✓ Retry em falha transitória conforme política global
- ✓ Se todas as tentativas falharem: **registro em log** apenas; **não** notifica o dono por este tipo
- ✗ Não deve enviar lembrete para agendamento já **concluído** ou **cancelado**
- ✗ Não deve expor token de cancelamento em logs

---

### US-703 — Enviar lembrete 2 horas antes do agendamento

**Como** Cliente (`P2`),  
**quero** receber um segundo lembrete por e-mail cerca de 2 horas antes,  
**para que** eu tenha última chance de reorganizar ou cancelar com antecedência.

**Critérios de aceite:**

- ✓ Mesmas regras de elegibilidade que o lembrete de 24h (estado **confirmado**, não cancelado/concluído antes do disparo)
- ✓ Template fixo; inclui link de cancelamento
- ✓ Retry em falha transitória
- ✓ Se todas as tentativas falharem: registro em **log** **e** envio de **e-mail ao dono** alertando da **falha definitiva** no lembrete crítico de 2h (identificação do agendamento e cliente sem dados sensíveis excessivos)
- ✗ Não deve alertar o dono em falhas do lembrete de 24h (somente este tipo aciona dono)
- ✗ Não deve duplicar o alerta ao dono para o mesmo evento de falha (idempotência do alerta)

---

### US-704 — Enviar confirmação de cancelamento ao cliente

**Como** Cliente (`P2`),  
**quero** receber um e-mail confirmando que meu cancelamento foi registrado,  
**para que** eu tenha comprovação.

**Critérios de aceite:**

- ✓ Disparado imediatamente após cancelamento válido via link (ou fluxo equivalente)
- ✓ Template fixo com resumo do agendamento cancelado
- ✓ Retry silencioso; falha definitiva apenas em **log** (sem e-mail ao dono específico para “falha ao avisar cancelamento”, para evitar cascata)
- ✗ Não deve enviar se o cancelamento não foi concluído com sucesso
- ✗ Não deve reenviar confirmação duplicada em requisições idempotentes repetidas

---

### US-705 — Notificar o dono quando o cliente cancela

**Como** Dono (`P1`),  
**quero** receber um e-mail quando um cliente cancelar pelo link,  
**para que** eu ajuste a operação sem depender de consulta manual à agenda.

**Critérios de aceite:**

- ✓ Enfileirado logo após o cancelamento ser persistido com sucesso
- ✓ Destinatário é o e-mail operacional do estabelecimento ou conta configurada para alertas (definição única no produto)
- ✓ Conteúdo inclui identificação do agendamento, horário liberado e dados mínimos do cliente conforme LGPD/política interna
- ✓ Retry silencioso; falha definitiva registrada em log
- ✗ Não deve falhar o cancelamento por falha temporária no envio ao dono
- ✗ Não deve enviar notificação ao dono se o cancelamento foi feito **pelo próprio dono** no painel (outro fluxo; sem duplicar com US-704 além do necessário)

---

### US-706 — Aplicar retry com backoff exponencial

**Como** sistema,  
**quero** reexecutar envios de e-mail que falharem por erros recuperáveis,  
**para que** a maior parte das notificações chegue sem intervenção humana.

**Critérios de aceite:**

- ✓ Até **3 tentativas** por notificação (configurável)
- ✓ Intervalos crescentes entre tentativas (ex.: 1 min, 5 min, 15 min) — **backoff exponencial**
- ✓ Erros não recuperáveis (ex.: endereço inválido permanente) não devem consumir todas as tentativas sem critério; classificação documentada na implementação
- ✓ Cada tentativa e resultado são **auditáveis** em log estruturado
- ✗ Não deve criar tempestade de requisições ao provedor (rate limit respeitado)
- ✗ Não deve duplicar envio bem-sucedido por reprocessamento indevido

---

### US-707 — Registrar falha definitiva e política de alerta ao dono

**Como** Dono (`P1`),  
**quero** ser alertado apenas quando a falha for crítica para a operação de curto prazo,  
**para que** eu possa contatar o cliente manualmente se necessário.

**Critérios de aceite:**

- ✓ Após esgotar retries, estado da notificação evolui para **falha definitiva** (ver diagrama de estados)
- ✓ **Lembrete 2h:** falha definitiva gera **e-mail ao dono** com contexto mínimo
- ✓ **Lembrete 24h:** falha definitiva gera **apenas log**
- ✓ **Confirmação inicial de agendamento:** falha definitiva gera **apenas log** (retry silencioso do ponto de vista do dono)
- ✗ Não deve enviar alerta ao dono fora das regras acima
- ✗ Não deve incluir segredos ou tokens completos nos logs

---

### US-708 — Templates fixos por tipo (MVP)

**Como** produto,  
**quero** um conjunto de templates de e-mail distintos por tipo de notificação,  
**para que** a comunicação seja clara e consistente.

**Critérios de aceite:**

- ✓ Cada tipo (confirmação, 24h, 2h, cancelamento cliente, cancelamento dono) possui **template próprio** versionado pelo sistema
- ✓ Dono **não** personaliza texto/HTML no MVP
- ✓ Templates suportam variáveis dinâmicas seguras (nome do cliente, horário, nome do estabelecimento, link com token)
- ✗ Não deve permitir injeção de HTML arbitrário vindo de cadastro do dono no MVP

---

## Referência cruzada

- Fluxo web e estados do agendamento: [docs/flow/06-public-booking-page/USER_STORIES.md](../06-public-booking-page/USER_STORIES.md)
