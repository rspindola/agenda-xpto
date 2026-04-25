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

## Módulo 01 — Autenticação

### US-001 — Criar conta
**Como** Admin (`P1`),  
**quero** criar uma conta com email e senha,  
**para que** eu possa aceder ao painel administrativo.

**Critérios de aceite:**
- ✓ Email deve ser único (case-insensitive)
- ✓ Senha deve ter mínimo 8 caracteres
- ✓ Após criação, redireciona automaticamente para `/dashboard`
- ✓ Tokens JWT gerados (access 15min + refresh 7d)
- ✓ Email de boas-vindas enviado
- ✗ Não deve permitir cadastro com email já existente (retorna 409)
- ✗ Não deve armazenar senha em texto plano (bcrypt 12 rounds)

---

### US-002 — Fazer login
**Como** Admin (`P1`),  
**quero** entrar com email e senha,  
**para que** eu aceda ao meu painel.

**Critérios de aceite:**
- ✓ Login bem-sucedido redireciona para `/dashboard`
- ✓ Tokens armazenados no `localStorage`
- ✓ Rate limit por IP em tentativas falhas
- ✓ Erro explícito se email não encontrado ou senha incorreta
- ✗ Não deve revelar se o email existe ou não (mensagem genérica)
- ✗ Não deve permitir login se conta estiver `suspended` ou `inactive`

---

### US-003 — Recuperar senha
**Como** Admin (`P1`),  
**quero** redefinir minha senha via email,  
**para que** eu possa recuperar o acesso caso esqueça.

**Critérios de aceite:**
- ✓ Link de reset enviado para email cadastrado
- ✓ Token de reset expira em 1 hora
- ✓ Token é invalidado após uso (`is_used = true`)
- ✓ Após reset bem-sucedido, redireciona para `/login`
- ✗ Não deve permitir reuso do mesmo link de reset
- ✗ Não deve confirmar se email existe (evitar enumeração)

---

### US-004 — Manter sessão ativa
**Como** Admin (`P1`),  
**quero** que minha sessão seja renovada automaticamente,  
**para que** eu não precise fazer login repetidamente.

**Critérios de aceite:**
- ✓ Quando access token expira, sistema usa refresh token silenciosamente
- ✓ Novo access token gerado sem interrupção da UX
- ✓ Se refresh token expirado, redireciona para `/login`
- ✗ Não deve expor o refresh token em logs ou respostas desnecessárias

---

### US-005 — Primeiro acesso com assistente de configuração
**Como** Admin (`P1`) novo,  
**quero** ser guiado por um assistente interativo após confirmar meu email,  
**para que** configure rapidamente meu negócio, profissionais, serviços e horários.

**Critérios de aceite:**
- ✓ Email de confirmação enviado após signup
- ✓ Assistente iniciado após clique no link de confirmação
- ✓ 5 passos obrigatórios: negócio, profissional, serviço, horários, confirmação
- ✓ Todos os passos são opcionais (pode pular)
- ✓ Dados salvos após cada passo (não precisa completar tudo)
- ✓ Após conclusão, redireciona para `/dashboard`
- ✓ Email de resumo enviado ao completar
- ✓ Assistente acessível novamente em Configurações
- ✗ Não deve permitir usuário continuar sem confirmar email

---

## Módulo 05 — Worker Panel (Professional Access)

> **Personas adicionadas:**
> - `P4` - **Professional/Worker** — Profissional que pode acessar painel com permissões limitadas

### US-006 — Professional fazer login no painel

**Como** Professional (`P4`),  
**quero** fazer login com email e senha no painel,  
**para que** eu possa gerenciar meus agendamentos e disponibilidade.

**Critérios de aceite:**
- ✓ Login com email único do profissional
- ✓ Senha armazenada com bcrypt 12 rounds
- ✓ Após login sucesso, redireciona para `/dashboard` (modo worker)
- ✓ Dashboard exibe apenas dados permitidos para sua role
- ✓ Rate limit por IP em tentativas falhas
- ✗ Não deve permitir login se account estiver `suspended` ou `inactive`
- ✗ Não deve revelar se email existe (mensagem genérica)

**Nota técnica:**  
Professional precisa ser ativado pelo tenant primeiro (status='inactive' → 'active')

---

### US-007 — Professional resetar sua senha

**Como** Professional (`P4`),  
**quero** redefinir minha senha via email,  
**para que** eu possa recuperar acesso caso esqueça.

**Critérios de aceite:**
- ✓ Link de reset enviado para email do professional
- ✓ Token de reset expira em 1 hora
- ✓ Token invalidado após uso
- ✓ Após reset bem-sucedido, redireciona para `/login`
- ✗ Não deve permitir reuso do mesmo link
- ✗ Não deve confirmar se email existe (evitar enumeração)

---

### US-008 — Tenant convidar professional ao painel

**Como** Admin/Tenant (`P1`),  
**quero** convidar um professional existente para acessar o painel,  
**para que** ele possa gerenciar seus próprios dados.

**Critérios de aceite:**
- ✓ Clico em "Adicionar worker" no painel admin
- ✓ Seleciono um professional existente
- ✓ Escolho uma role: `view_only`, `editor`, ou `admin_worker`
- ✓ Sistema verifica limite de workers (baseado em plano)
- ✓ Professional recebe email com link de ativação
- ✓ Professional clica link, define senha, ativa sua conta
- ✓ Após ativação, status muda para `active` e pode fazer login
- ✗ Não deve permitir adicionar worker se limite atingido
- ✗ Não deve permitir duplicar mesmo professional (1 account por tenant)

**Limite por Plano:**
- Basic: 1 worker
- Pro: 5 workers
- Enterprise: unlimited

---

### US-009 — Professional (view_only role) consultar agendamentos

**Como** Professional com role `view_only` (`P4`),  
**quero** consultar agendamentos para responder dúvidas de clientes,  
**para que** eu possa atender melhor.

**Critérios de aceite:**
- ✓ Acesso a visualização de todos os agendamentos (read-only)
- ✓ Pode ver detalhes de cliente associado
- ✓ Pode ver horários disponíveis
- ✓ Dashboard mostra resumo (agendamentos hoje, próximos)
- ✗ Não pode criar, editar ou deletar agendamentos
- ✗ Não pode acessar relatórios ou configurações

**Dashboard view_only:**
- Card: "Agendamentos hoje" (num + lista)
- Card: "Próximos agendamentos" (próximas 7 dias)
- Seção: "Clientes" (read-only)
- Seção: "Serviços" (read-only)

---

### US-010 — Professional (editor role) gerenciar seus agendamentos

**Como** Professional com role `editor` (`P4`),  
**quero** criar, editar e confirmar meus próprios agendamentos,  
**para que** eu possa gerenciar minha agenda.

**Critérios de aceite:**
- ✓ Pode listar seus próprios agendamentos
- ✓ Pode criar novo agendamento para si
- ✓ Pode editar apenas seus agendamentos
- ✓ Pode confirmar/cancelar seus agendamentos
- ✓ Pode editar seus horários de trabalho
- ✓ Pode marcar folgas pessoais
- ✓ Dashboard mostra apenas seus dados (agendamentos, estatísticas pessoais)
- ✗ Não pode ver agendamentos de outros professionals
- ✗ Não pode editar agendamentos de outros
- ✗ Não pode acessar gerenciamento de workers ou relatórios de tenant

**Ações permitidas:**
- Criar agendamento
- Editar agendamento próprio
- Deletar agendamento próprio
- Confirmar agendamento próprio
- Cancelar agendamento próprio
- Editar horários pessoais
- Registrar folga pessoal
- Editar perfil pessoal (nome, foto, phone)

---

### US-011 — Professional (admin_worker role) gerenciar workers

**Como** Professional com role `admin_worker` (`P4`),  
**quero** gerenciar outros workers (convidar, alterar role, reset de senha),  
**para que** eu possa coordenar a equipe.

**Critérios de aceite:**
- ✓ Pode listar todos os workers do tenant
- ✓ Pode convidar novo worker (se houver quota)
- ✓ Pode visualizar todos os agendamentos de qualquer worker
- ✓ Pode alterar role de outro worker
- ✓ Pode resetar senha de outro worker (envia email)
- ✓ Pode suspender/ativar worker
- ✓ Pode criar, editar, deletar serviços
- ✓ Pode gerar relatórios básicos
- ✗ Não pode editar configurações de tenant (nome, categoria, etc)
- ✗ Não pode acessar billing ou plano
- ✗ Não pode criar/deletar tenant

**Ações permitidas:**
- Tudo que `editor` pode fazer
- + Gerenciar workers (convidar, role, status, reset password)
- + Acessar relatórios
- + Criar/editar/deletar serviços
- + Editar horários de qualquer profissional
- + Exportar dados

---

### US-012 — Tenant resetar senha de worker

**Como** Admin/Tenant (`P1`),  
**quero** resetar a senha de um worker sem ele precisar pedir,  
**para que** eu possa ajudá-lo rapidamente.

**Critérios de aceite:**
- ✓ Acesso ao worker no painel admin
- ✓ Botão "Reset password" envia email ao worker
- ✓ Worker recebe email com link único (expira em 1 hora)
- ✓ Worker clica link, define nova senha
- ✓ Próximo login usa nova senha
- ✓ Log de who/when reseta password (auditoria)
- ✗ Não deve revelar senha anterior
- ✗ Não deve permitir reset múltiplas vezes sem intervalo

---

### US-013 — Tenant suspender/deletar worker

**Como** Admin/Tenant (`P1`),  
**quero** suspender ou remover um worker do painel,  
**para que** eu possa gerenciar acessos.

**Critérios de aceite:**
- ✓ Pode alterar status para `suspended` (perde acesso, conta preservada)
- ✓ Pode alterar status para `inactive` (desativa sem deletar)
- ✓ Worker suspenso não consegue fazer login
- ✓ Reativação é possível (status → `active`)
- ✓ Todas as ações são auditadas (quem, quando, por quê)
- ✗ Não deve deletar dados de agendamentos do worker

**Workflow:**
- Suspended: Worker não consegue login, mas conta existe
- Inactive: Mesmo que suspended (não pode login)
- Active: Pode fazer login

---

### US-014 — Professional (multi-tenant) logar em múltiplos tenants

**Como** Professional que trabalha em múltiplas localizações (`P4`),  
**quero** fazer login uma única vez e alternar entre tenants,  
**para que** eu acesse dados de cada negócio rapidamente.

**Critérios de aceite:**
- ✓ Usa mesmo email para login em qualquer tenant
- ✓ Após login, pode ver dropdown "Trocar local"
- ✓ Clicando em "Trocar local", lista tenants onde tem acesso
- ✓ Ao trocar, nova sessão gerada para esse tenant
- ✓ Dados do painel mudam conforme tenant selecionado
- ✓ Pode ter roles diferentes em cada tenant (ex: editor em um, view_only em outro)
- ✗ Não deve misturar dados de tenants diferentes
- ✗ Não deve permitir acesso a tenant onde não foi convidado

**Exemplo de fluxo:**
1. Login com joao@email.com
2. Clica dropdown → "Você tem acesso a 2 locais"
3. Opção A: "Barbearia Central (editor)"
4. Opção B: "Salão Beleza (view_only)"
5. Seleciona Barbearia, vê dados dela
6. Pode trocar a qualquer momento

---

### US-015 — Auditoria: Rastrear login e ações de worker

**Como** Admin/Tenant (`P1`),  
**quero** ver logs de quem fez login e quais ações cada worker realizou,  
**para que** eu mantenha segurança e conformidade.

**Critérios de aceite:**
- ✓ Logs de login: professional_id, timestamp, IP, User-Agent
- ✓ Logs de ações: criar/editar/deletar agendamentos, alterar serviços
- ✓ Dashboard de auditoria com filtros (worker, data, ação)
- ✓ Exportar relatório de auditoria
- ✓ Retenção de logs por 90 dias (mínimo)
- ✗ Não deve logar senhas ou dados sensíveis
- ✗ Não deve perder logs por upgrade ou crash

**Eventos auditados:**
- professional_login
- professional_login_failed
- professional_account_created
- professional_role_changed
- professional_password_reset
- professional_account_suspended
- appointment_created_by_professional
- appointment_edited_by_professional
- appointment_deleted_by_professional