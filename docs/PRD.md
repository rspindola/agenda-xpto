# PRD — AgendaIA
**Product Requirements Document**
**Versão:** 1.1
**Data:** Abril 2026
**Status:** Rascunho

---

## 1. Visão Geral

### Problema
Pequenos estabelecimentos de beleza e estética (salões, barbearias, manicures, estúdios de tatuagem) não têm ferramentas acessíveis para gerenciar agendamentos de forma profissional. O processo ainda é feito por WhatsApp manual, cadernos físicos ou memória — gerando faltas, esquecimentos, conflitos de horário e perda de clientes.

Do lado do cliente, agendar um serviço exige ligar, mandar mensagem e esperar resposta — o que é lento e frustrante, especialmente fora do horário comercial.

### Solução
Um SaaS que oferece ao estabelecimento uma **página pública de agendamento web** e um **painel administrativo** para gerenciar tudo. O cliente agenda online, recebe confirmações e lembretes automáticos. O dono não precisa parar o que está fazendo para responder mensagens.

> **Escopo do MVP:** agendamento via página web. Integração com WhatsApp e assistente IA são funcionalidades de versões futuras.

### Proposta de Valor
- **Para o dono:** menos faltas, zero trabalho manual de agendamento, atendimento profissional sem contratar recepcionista.
- **Para o cliente:** agendar em segundos, a qualquer hora, sem precisar esperar resposta.

---

## 2. Público-Alvo

### Segmento Principal
Donos de micro e pequenos estabelecimentos de beleza e estética:
- Salões de cabelo
- Barbearias
- Estúdios de manicure / pedicure
- Estúdios de tatuagem e piercing
- Clínicas de estética

### Perfil do Usuário (Dono)
- Geralmente trabalha sozinho ou com 1–3 funcionários
- Pode ter **um ou mais estabelecimentos**, dependendo do plano contratado
- Não tem equipe de TI, precisa de algo simples de configurar
- Sente dor com faltas, esquecimentos e tempo perdido respondendo mensagens

### Perfil do Usuário (Cliente Final)
- Qualquer pessoa que utiliza serviços de beleza
- Espera agilidade, confirmação imediata e facilidade no cancelamento
- Não precisa criar conta — agenda pelo link do estabelecimento

---

## 3. Objetivos do Produto

| Objetivo | Métrica de Sucesso |
|---|---|
| Reduzir faltas nos agendamentos | Redução de ≥ 30% em no-shows após uso dos lembretes |
| Eliminar agendamento manual | 80%+ dos agendamentos feitos de forma autônoma pelo cliente |
| Atendimento fora do horário comercial | ≥ 40% dos agendamentos realizados fora do horário de expediente |
| Ativação rápida | Dono consegue configurar e ativar em menos de 30 minutos |

---

## 4. Funcionalidades — MVP

### 4.1 Página Pública de Agendamento (Cliente)
- Link personalizado por estabelecimento (ex: `agendaia.com/nome-do-salao`)
- Cliente escolhe serviço → profissional (opcional) → data e horário disponível → confirma
- Informa nome, telefone e e-mail
- Confirmação imediata por e-mail
- Design responsivo (funciona bem no celular)
- Não exige cadastro ou login do cliente

### 4.2 Lembretes Automáticos
- Lembrete enviado **24 horas antes** do agendamento (e-mail)
- Lembrete enviado **2 horas antes** do agendamento (e-mail)
- Mensagem inclui link para cancelamento fácil

### 4.3 Cancelamento pelo Cliente
- Link de cancelamento enviado nos lembretes
- Cancela sem precisar falar com ninguém
- Horário é liberado automaticamente na agenda
- Dono recebe notificação do cancelamento

### 4.4 Painel Administrativo (Dono)
- Visualização da agenda por dia, semana e mês
- Gerenciamento de agendamentos (criar, editar, cancelar manualmente)
- Cadastro de serviços com nome, duração e preço
- Cadastro de profissionais e suas especialidades
- Definição de disponibilidade por profissional (dias e horários)
- Bloqueio de horários (folgas, feriados)
- Histórico de clientes
- Relatórios básicos: agendamentos realizados, faltas, cancelamentos

### 4.5 Multi-Estabelecimentos
- Um único login gerencia múltiplos estabelecimentos
- Cada estabelecimento tem sua própria página pública, profissionais e agenda independentes
- O número de estabelecimentos disponíveis depende do plano contratado
- Dashboard inicial permite alternar entre os estabelecimentos cadastrados

---

## 5. Funcionalidades — Pós-MVP (Roadmap)

| Funcionalidade | Versão Estimada |
|---|---|
| Lembretes via WhatsApp | v1.1 |
| Assistente IA no WhatsApp (agendamento conversacional) | v1.2 |
| Base de conhecimento (FAQ respondido pela IA) | v1.2 |
| Créditos de IA por plano | v1.2 |
| Pagamento online integrado ao agendamento | v2.0 |
| App mobile para o dono | v2.0 |
| Programa de afiliados | v2.0 |
| Avaliações e reviews de clientes | v2.0 |
| Integração com Instagram / Google Agenda | v2.1 |

---

## 6. Diferenciais Competitivos

Os concorrentes atuais (Booksy, Trinks, iSalon) oferecem agendamento, mas têm gaps que o produto pode explorar:

| Diferencial | Como se destacar |
|---|---|
| **Setup ultra-simples** | Ativação em menos de 30 minutos, sem suporte técnico |
| **Multi-estabelecimentos nativo** | Gerenciar múltiplos negócios com um único login |
| **Roadmap de IA** | WhatsApp com IA como diferencial claro na evolução do produto |
| **Sem app para o cliente** | O cliente agenda pelo link — sem precisar baixar nada |
| **Preço acessível** | Ticket voltado para autônomos e micro-estabelecimentos |

---

## 7. Fora do Escopo — MVP

- Integração com WhatsApp (qualquer forma)
- Assistente IA
- Pagamento online
- App mobile para o dono
- Programa de afiliados
- Avaliações e reviews
- Integração com redes sociais

---

## 8. Jornadas Principais

### Jornada do Dono — Setup Inicial
1. Cria conta com e-mail e senha
2. Cria o primeiro estabelecimento (nome, endereço, tipo)
3. Cadastra serviços (nome, duração, preço)
4. Cadastra profissionais e define disponibilidade
5. Compartilha o link da página pública com clientes

### Jornada do Dono — Multi-Estabelecimentos
1. Acessa o dashboard e seleciona ou cria um novo estabelecimento
2. Configura o novo estabelecimento de forma independente
3. Alterna entre os estabelecimentos pela interface

### Jornada do Cliente — Agendamento via Página Web
1. Acessa o link do estabelecimento
2. Escolhe o serviço desejado
3. Escolhe o profissional (se houver mais de um)
4. Seleciona data e horário disponível
5. Informa nome, telefone e e-mail
6. Recebe confirmação por e-mail
7. Recebe lembretes 24h e 2h antes
8. Comparece — ou cancela pelo link se precisar

---

## 9. Requisitos Não-Funcionais

- **Disponibilidade:** uptime de 99,5%+
- **Tempo de resposta:** páginas carregam em menos de 2 segundos
- **Segurança:** dados dos clientes tratados conforme LGPD
- **Escalabilidade:** arquitetura suporta crescimento sem reescritas
- **Usabilidade:** dono sem conhecimento técnico configura tudo sem suporte

---

## 10. Modelo de Negócio

| Plano | Estabelecimentos | Profissionais | Preço estimado |
|---|---|---|---|
| Starter | 1 | até 2 | R$ 59/mês |
| Pro | até 3 | até 10 por estabelecimento | R$ 129/mês |
| Business | até 10 | ilimitado | R$ 249/mês |

> ⚠️ Preços a validar com pesquisa de mercado e entrevistas com potenciais clientes.

---

## 11. Próximos Passos

- [ ] Entrevistas com 10–15 donos de estabelecimentos para validar dores e disposição de pagar
- [ ] Validar limites de planos com base em pesquisa de mercado
- [ ] Definir stack tecnológica
- [ ] Protótipo navegável da página pública e painel administrativo
- [ ] Definir nome e identidade visual do produto
- [ ] Desenvolvimento do MVP
- [ ] Teste beta com 3–5 estabelecimentos parceiros

---

*Documento vivo — atualizar conforme validações com usuários.*