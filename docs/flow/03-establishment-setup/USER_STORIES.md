# User Stories — Establishment Setup (Módulo 03)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

**Disponibilidade (expediente, feriados, disponibilidade semanal por profissional, bloqueios, antecedência mínima, motor de slots):** documentação canónica no [módulo 04 — Disponibilidade](../04-availability/USER_STORIES.md) (US-410 a US-418). As antigas US-202, US-203 e US-304 deste ficheiro foram descontinuadas em favor dessas histórias.

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |
| `P2` | **Cliente** | Cliente final. Interage via WhatsApp ou web. |
| `P3` | **IA** | Assistente virtual que atende o cliente. |

---

## Bloco A — Dados gerais e integrações

### US-201 — Configurar dados básicos

**Como** Admin (`P1`),  
**quero** preencher o nome do estabelecimento, slug único, telefone e endereço,  
**para que** meu negócio fique cadastrado corretamente no sistema.

**Critérios de aceite:**

- ✓ Formulário valida email único (case-insensitive)
- ✓ Slug aceita apenas letras, números e hífen
- ✓ Telefone é validado (formato E.164 ou nacional)
- ✓ Endereço permite até 500 caracteres
- ✓ Dados salvos com sucesso retornam mensagem de confirmação
- ✗ Não deve permitir slug duplicado (retorna 409)
- ✗ Não deve aceitar telefone inválido

---

### US-202 — Conectar WhatsApp (integração)

**Como** Admin (`P1`),  
**quero** conectar meu WhatsApp via QR Code (ZeroFila API),  
**para que** eu possa receber e responder mensagens de clientes.

**Critérios de aceite:**

- ✓ Botão "Conectar WhatsApp" exibe QR Code em tempo real
- ✓ QR Code renova a cada 15 segundos
- ✓ Após scanear, status muda para "Conectado" com número exibido
- ✓ Desconectar remove a sessão (reversível)
- ✓ Status sempre atualizado (ativo/inativo)
- ✗ Não deve armazenar credenciais Meta localmente
- ✗ Não deve quebrar após logout da conta WhatsApp

---

## Bloco B — Serviços e profissionais

### US-203 — Criar novo serviço

**Como** Admin (`P1`),  
**quero** cadastrar um serviço com nome, duração e preço,  
**para que** eu possa oferecer esse serviço nos agendamentos.

**Critérios de aceite:**

- ✓ Form solicita: nome, duração (minutos), preço (R$), descrição opcional
- ✓ Duração deve ser > 0 minutos
- ✓ Preço deve ser ≥ 0
- ✓ Serviço criado aparece na lista
- ✓ É possível editar e deletar serviços
- ✗ Não deve permitir duração negativa ou zero
- ✗ Não deve permitir deletar se há agendamentos (soft delete)

---

### US-204 — Gerenciar profissionais

**Como** Admin (`P1`),  
**quero** adicionar profissionais, definir quais serviços cada um oferece e editar dados,  
**para que** eu controle quem trabalha e o que faz.

**Critérios de aceite:**

- ✓ Form solicita: nome, email (opcional), telefone
- ✓ Após criar, interface permite atribuir serviços (N:N)
- ✓ Profissional pode ofertar múltiplos serviços
- ✓ Um serviço pode ser oferecido por múltiplos profissionais
- ✓ É possível editar dados e serviços do profissional
- ✗ Não deve permitir deletar profissional com agendamentos ativos
- ✗ Não deve aceitar email duplicado (se preenchido)

**Nota:** a **disponibilidade semanal** (quando cada profissional atende) está no [módulo 04 — US-411](../04-availability/USER_STORIES.md).

---

### US-205 — Definir preços diferenciados por profissional

**Como** Admin (`P1`),  
**quero** definir preços diferentes para o mesmo serviço conforme o profissional (ex.: Junior vs Senior),  
**para que** eu tenha flexibilidade de pricing.

**Critérios de aceite:**

- ✓ Na atribuição de serviço a profissional, permite override de preço
- ✓ Se preço não for definido, usa o padrão do serviço
- ✓ Preço específico do profissional aparece em agendamentos
- ✓ Mudança de preço não afeta agendamentos passados
- ✗ Não deve permitir preço negativo
- ✗ Não deve modificar histórico de preços

---

## Bloco C — Operação assíncrona e automações

> **Referência canónica de notificações por e-mail (MVP), retry e templates:** [módulo 07 — Notificações](../07-notifications/USER_STORIES.md) (**US-701 a US-708**). As histórias abaixo permanecem neste módulo por contexto de produto; o detalhe de canais, políticas de falha e tipos de mensagem deve alinhar-se ao 07.

### US-206 — Receber lembretes automáticos 24h antes

**Como** Cliente (`P2`),  
**quero** receber uma mensagem 24 horas antes do meu agendamento,  
**para que** eu não esqueça e não deixe o profissional esperando.

**Critérios de aceite:**

- ✓ Lembrete é enviado automaticamente (não requer ação admin)
- ✓ Mensagem é enviada na janela definida em produto (ex.: 24h antes do agendamento)
- ✓ Se falhar, é retentado conforme política (ver [US-706](../07-notifications/USER_STORIES.md))
- ✓ Log regista se foi enviado com sucesso
- ✗ Não deve enviar se cliente cancelou agendamento
- ✗ Não deve enviar para agendamentos no passado

**Referência cruzada:** lembrete 24h e 2h, confirmação e cancelamentos — [US-702](../07-notifications/USER_STORIES.md), [US-703](../07-notifications/USER_STORIES.md) e restantes **US-701+** no módulo 07.

---

### US-207 — Atualizar status para "no-show" automaticamente

**Como** Admin (`P1`),  
**quero** que o sistema marque um agendamento como "no-show" se não foi confirmado no horário,  
**para que** eu não precise fazer isso manualmente.

**Critérios de aceite:**

- ✓ Job BullMQ executa 15 minutos após horário do agendamento
- ✓ Se status ainda for "confirmed", muda para "no-show"
- ✓ Admin recebe notificação do no-show
- ✓ Cliente recebe notificação de que faltou (se desejar)
- ✗ Não deve alterar se status já foi para "completed" ou "cancelled"
- ✗ Não deve falhar se agendamento foi deletado

---

### US-208 — Debitar créditos de IA automaticamente

**Como** Admin (`P1`),  
**quero** que o sistema debite créditos IA conforme conversas ocorrem via WhatsApp,  
**para que** eu controle consumo sem intervenção manual.

**Critérios de aceite:**

- ✓ Job executa a cada hora, resumindo consumo do período
- ✓ Créditos são debitados da quota do tenant
- ✓ Logs registram cada debitagem (quando, quantos, por quê)
- ✓ Se quota atingir mínimo, admin recebe alerta
- ✗ Não deve debitar se tenant não tem créditos suficientes
- ✗ Não deve processar créditos de tenant suspenso
