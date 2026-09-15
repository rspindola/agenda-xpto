# Professionals and Services Specification

## Problem Statement

O dono do estabelecimento precisa gerenciar sua equipe (profissionais) e seu catálogo (serviços) para que os clientes possam agendar horários. Sem esse cadastro, é impossível calcular disponibilidade, precificar agendamentos ou permitir que o cliente escolha com quem quer ser atendido na página pública.

## Goals

- [ ] Permitir o cadastro, edição e exclusão lógica de serviços prestados pelo estabelecimento.
- [ ] Permitir o cadastro, edição e exclusão lógica de profissionais da equipe.
- [ ] Permitir vincular quais profissionais realizam quais serviços.
- [ ] Permitir que um profissional tenha um preço diferente (override) para o mesmo serviço (ex: barbeiro júnior vs barbeiro sênior).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Horários de Trabalho (Disponibilidade) | Pertence à feature `availability`. Profissionais terão horários definidos lá. |
| Agendamento Online | Pertence à feature `public-booking-page`. Este spec cobre apenas o cadastro administrativo. |
| Férias e Folgas | Pertence à feature `availability` (Blocks/Holidays). |
| Comissão por Serviço | MVP não prevê split financeiro ou comissões. |

---

## User Stories

### P1: Gerenciamento de Serviços ⭐ MVP

**User Story**: Como dono do estabelecimento, quero cadastrar, listar, editar e remover os serviços oferecidos para que os clientes saibam o que podem agendar, quanto tempo demora e qual o valor.

**Why P1**: Sem serviços, a agenda não funciona (o slot de tempo depende da duração do serviço).

**Acceptance Criteria**:

1. WHEN clico em "Adicionar Serviço" THEN system SHALL abrir um formulário com Nome, Descrição, Duração (minutos), Preço e opção "Destacar como Combo".
2. WHEN salvo um serviço válido THEN system SHALL persisti-lo e exibi-lo na listagem.
3. WHEN edito um serviço THEN system SHALL atualizar seus dados (incluindo preço).
4. WHEN clico em excluir THEN system SHALL solicitar confirmação e, se confirmado, realizar soft-delete do serviço.

**Independent Test**: Posso criar um serviço "Corte de Cabelo" de 30 min por R$ 50, vê-lo na lista, editá-lo para R$ 60 e excluí-lo, sem nunca tocar em "Profissionais".

---

### P1: Gerenciamento de Profissionais ⭐ MVP

**User Story**: Como dono do estabelecimento, quero cadastrar, listar, editar e remover membros da equipe para atribuir agendamentos a eles.

**Why P1**: Mesmo trabalhando sozinho, o dono precisa estar cadastrado como profissional para ter uma agenda.

**Acceptance Criteria**:

1. WHEN clico em "Adicionar Profissional" THEN system SHALL abrir um formulário com Nome, Email e Telefone.
2. WHEN salvo um profissional válido THEN system SHALL persisti-lo e exibi-lo na listagem.
3. WHEN clico em excluir THEN system SHALL solicitar confirmação e realizar soft-delete (para não quebrar histórico de agendamentos).

**Independent Test**: Posso criar um profissional "João Silva", editá-lo e excluí-lo sem vincular nenhum serviço.

---

### P1: Vinculação Serviço ↔ Profissional e Preços Específicos ⭐ MVP

**User Story**: Como dono, quero definir quais serviços cada profissional faz e cobrar preços diferentes dependendo do nível do profissional.

**Why P1**: Nem todo funcionário faz todos os serviços, e seniores podem cobrar mais caro pelo mesmo corte.

**Acceptance Criteria**:

1. WHEN crio/edito um profissional THEN system SHALL permitir selecionar quais serviços ele realiza através de checkboxes (ou vice-versa na tela de serviços).
2. WHEN vinculo um serviço a um profissional THEN system SHALL exibir um toggle opcional "Preço Customizado".
3. WHEN ativo o "Preço Customizado" THEN system SHALL permitir inserir um valor em reais que substitui o valor padrão do serviço apenas para este profissional.
4. WHEN removo o vínculo THEN system SHALL remover o profissional da lista de aptos a realizar aquele serviço.

**Independent Test**: Posso dizer que "João" faz "Corte" por R$ 50 (padrão) e "Maria" faz o mesmo "Corte" por R$ 70 (override).

---

## Edge Cases

- WHEN o usuário tenta cadastrar um serviço com duração = 0 THEN system SHALL bloquear a submissão (duração deve ser > 0).
- WHEN o usuário tenta excluir o único profissional do estabelecimento THEN system SHALL exibir um alerta (mas permitir, pois a validação real será se a agenda estiver vazia, ou avisar que "A página pública ficará sem opções").
- WHEN um serviço sofre soft-delete THEN system SHALL remover/ocultar os vínculos (ProfessionalService) relacionados a ele na UI.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| `TEAM-01` | P1: Gerenciar Serviços (CRUD) | Specify | Pending |
| `TEAM-02` | P1: Gerenciar Profissionais (CRUD) | Specify | Pending |
| `TEAM-03` | P1: Vinculação (M:N) e Overrides | Specify | Pending |

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped ⚠️

---

## Success Criteria

- [ ] O dono consegue criar um catálogo de 10 serviços em menos de 5 minutos.
- [ ] O dono consegue cadastrar uma equipe de 3 pessoas e atribuir os serviços corretamente para cada um.
- [ ] O fluxo de vínculo M:N é intuitivo e não gera dúvidas de "onde clico para dizer que a Maria faz Manicure".
