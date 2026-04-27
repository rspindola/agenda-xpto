# User Stories - Establishment Setup

> Formato: `Como [persona], quero [acao], para que [beneficio]`
> Criterios de aceite usam ✓ (deve funcionar) e ✗ (nao deve acontecer)

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |
| `P2` | **Cliente** | Cliente final. Interage via WhatsApp ou web. |
| `P3` | **IA** | Assistente virtual que atende o cliente. |

---

## Bloco A - Configuracoes gerais do estabelecimento

### US-201 — Configurar dados básicos
**Como** Admin (`P1`),  
**quero** preenchero nome do estabelecimento, slug único, telefone e endereço,  
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

### US-202 — Definir horário de funcionamento
**Como** Admin (`P1`),  
**quero** configurar horário de abertura, fechamento e intervalo de almoço para cada dia da semana,  
**para que** o sistema saiba quando posso receber agendamentos.

**Critérios de aceite:**
- ✓ Interface permite selecionar 7 dias (seg-dom)
- ✓ Horários são validados (abertura < fechamento)
- ✓ Intervalo de almoço é opcional
- ✓ Dados salvos geram lista de "blocos de disponibilidade"
- ✓ Cada dia pode ter horário diferente
- ✗ Não deve aceitar horário invertido (18:00 - 09:00)
- ✗ Não deve permitir intervalo de almoço fora do expediente

---

### US-203 — Gerenciar feriados e suspensões
**Como** Admin (`P1`),  
**quero** adicionar, editar e remover datas de feriado/suspensão,  
**para que** o sistema não permita agendamentos nessas datas.

**Critérios de aceite:**
- ✓ Interface exibe lista de feriados com data e motivo
- ✓ Botão "Adicionar" abre form com data + descrição
- ✓ Editar permite modificar data/motivo existente
- ✓ Deletar pede confirmação antes de remover
- ✓ Feriado adicionado aparece imediatamente na lista
- ✗ Não deve permitir feriado no passado (exceto hoje)
- ✗ Não deve permitir data duplicada para mesmo feriado

---

### US-204 — Conectar WhatsApp (integração)
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

## Bloco B - Servicos e profissionais

### US-301 — Criar novo serviço
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

### US-302 — Gerenciar profissionais
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

---

### US-303 — Definir preços diferenciados por profissional
**Como** Admin (`P1`),  
**quero** definir preços diferentes para o mesmo serviço conforme o profissional (ex: Junior vs Senior),  
**para que** eu tenha flexibilidade de pricing.

**Critérios de aceite:**
- ✓ Na atribuição de serviço a profissional, permite override de preço
- ✓ Se preço não for definido, usa o padrão do serviço
- ✓ Preço específico do profissional aparece em agendamentos
- ✓ Mudança de preço não afeta agendamentos passados
- ✗ Não deve permitir preço negativo
- ✗ Não deve modificar histórico de preços

---

### US-304 — Visualizar matriz de disponibilidade
**Como** Admin (`P1`),  
**quero** ver em uma matriz qual profissional trabalha em qual dia/hora e qual serviço oferece,  
**para que** eu tenha visão rápida da capacidade operacional.

**Critérios de aceite:**
- ✓ Exibe grid com profissionais (linhas) x dias (colunas)
- ✓ Células exibem horário de trabalho e serviços oferecidos
- ✓ Pode filtrar por serviço
- ✓ Visão é read-only (configuração feita em outro lugar)
- ✗ Não deve carregar se houver muitos profissionais (max 50 visualmente)

---

## Bloco C - Operacao assincrona e automacoes

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
