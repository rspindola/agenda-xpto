# User Stories — Página pública de agendamento (Módulo 06)

> Formato: `Como [persona], quero [ação], para que [benefício]`  
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Dono / Admin** | Dono ou gestor do estabelecimento. Configura serviços, combos, profissionais e regras no painel; recebe notificações operacionais (fora do escopo detalhado deste módulo). |
| `P2` | **Cliente** | Cliente final. Acessa a página pública pelo link do estabelecimento, **sem login**. |

**Nota:** combos e serviços são cadastrados no painel (ver [docs/flow/03-establishment-setup/USER_STORIES.md](../03-establishment-setup/USER_STORIES.md) para serviços e profissionais). Neste módulo, combos tratam-se como **pacotes pré-definidos** já existentes no estabelecimento, exibidos e selecionáveis como um item de catálogo.

---

## Módulo 06 — Página pública

### US-601 — Acessar a página pública do estabelecimento

**Como** Cliente (`P2`),  
**quero** abrir o link público do estabelecimento (ex.: slug único na URL),  
**para que** eu possa iniciar um agendamento sem criar conta.

**Critérios de aceite:**

- ✓ A página carrega com identificação clara do estabelecimento (nome e dados públicos configurados)
- ✓ Layout responsivo (uso confortável em celular)
- ✓ Não exige login nem cadastro para navegar e agendar
- ✓ URL inválida ou estabelecimento inativo exibe mensagem amigável (sem vazar dados internos)
- ✗ Não deve exibir estados internos do sistema (ex.: `pendente` transitório) ao cliente
- ✗ Não deve permitir agendamento em estabelecimento desativado ou slug inexistente

---

### US-602 — Selecionar serviços, combos e múltiplos serviços avulsos

**Como** Cliente (`P2`),  
**quero** escolher um combo pré-definido e/ou vários serviços avulsos,  
**para que** o agendamento reflita exatamente o que desejo realizar.

**Critérios de aceite:**

- ✓ Catálogo exibe serviços individuais (nome, duração, preço) cadastrados pelo estabelecimento
- ✓ Catálogo exibe combos pré-definidos (nome, duração total, preço) quando existirem no estabelecimento
- ✓ É possível selecionar múltiplos serviços avulsos (ex.: Corte + Pintura)
- ✓ A **duração total** do agendamento é a soma das durações de todos os itens selecionados (serviços e/ou combos)
- ✓ O cliente pode alterar a seleção antes de confirmar o horário (com recálculo da duração total)
- ✓ Exibição de resumo da seleção (itens + duração total + preço total, quando aplicável)
- ✗ Não deve permitir seleção vazia avançar para escolha de profissional/horário
- ✗ Não deve duplicar o mesmo serviço na seleção sem ação explícita do cliente (evitar contagem duplicada acidental)

**Regra de negócio:** os slots de disponibilidade considerados nas US seguintes usam **sempre** a duração total calculada.

---

### US-603 — Alternar entre Caminho A (profissional primeiro) e Caminho B (data/horário primeiro)

**Como** Cliente (`P2`),  
**quero** que o fluxo padrão seja escolher o profissional primeiro, com opção de alternar para escolher data/horário primeiro,  
**para que** eu possa agendar do jeito que for mais conveniente.

**Critérios de aceite:**

- ✓ Ao entrar no fluxo de agendamento, o **Caminho A** é apresentado por padrão (profissional → horários)
- ✓ Controle explícito na UI para alternar para o **Caminho B** (data/horário → profissionais disponíveis)
- ✓ Ao alternar o modo, a seleção de serviços/combos já feita é preservada
- ✓ Ao alternar, seleções incompatíveis com o novo modo (ex.: profissional escolhido que não atende todos os serviços) são tratadas com mensagem clara e pedido de reescolha
- ✗ Não deve reiniciar todo o fluxo sem aviso quando o cliente apenas alterna o modo
- ✗ Não deve permitir concluir agendamento sem completar os passos obrigatórios do modo ativo

---

### US-604 — Caminho A: escolher profissional e ver horários disponíveis

**Como** Cliente (`P2`),  
**quero** escolher o profissional e em seguida ver apenas os horários em que ele está disponível para a minha duração total,  
**para que** eu reserve um intervalo contínuo válido.

**Critérios de aceite:**

- ✓ Lista apenas profissionais que podem realizar **todos** os itens selecionados (conforme vínculo serviço–profissional no cadastro)
- ✓ Se houver um único profissional elegível, a UX pode encurtar o passo (com critério explícito na implementação)
- ✓ Horários exibidos respeitam: disponibilidade do profissional, feriados/suspensões, bloqueios e **antecedência mínima** do estabelecimento
- ✓ Slots são calculados para um bloco **contínuo** de duração igual à duração total do agendamento
- ✓ Indisponibilidade por conflito com outro agendamento é refletida (slot não aparece ou aparece indisponível)
- ✗ Não deve mostrar horário que não caiba a duração total até o fechamento ou próximo bloqueio
- ✗ Não deve permitir selecionar profissional que não ofereça algum dos serviços escolhidos

---

### US-605 — Caminho B: escolher data/horário e ver profissionais disponíveis

**Como** Cliente (`P2`),  
**quero** escolher primeiro a data e o horário e depois ver quais profissionais estão disponíveis naquele intervalo,  
**para que** eu possa encaixar o agendamento na minha agenda pessoal.

**Critérios de aceite:**

- ✓ Após definir data e horário desejados, o sistema lista profissionais que atendem **todos** os serviços/combos selecionados e estão livres no intervalo `[horário, horário + duração total)`
- ✓ Mesmas regras de feriado, bloqueio e antecedência mínima que no Caminho A
- ✓ Se nenhum profissional estiver disponível, mensagem clara e sugestão de outro horário ou retorno ao Caminho A
- ✗ Não deve listar profissional ocupado parcialmente pelo intervalo necessário
- ✗ Não deve permitir confirmar sem escolher um profissional da lista filtrada

---

### US-606 — Respeitar antecedência mínima para agendamento

**Como** Cliente (`P2`),  
**quero** que o sistema não ofereça horários dentro da antecedência mínima configurada pelo estabelecimento,  
**para que** a política do negócio seja respeitada.

**Critérios de aceite:**

- ✓ Parâmetro de antecedência mínima é **por estabelecimento** (definido no painel; valor em minutos ou horas conforme produto)
- ✓ Nenhum slot com início antes de `agora + antecedência mínima` é selecionável
- ✓ Validação repetida no servidor ao criar o agendamento (não apenas na UI)
- ✗ Não deve ser possível burlar antecedência via manipulação de URL ou requisição direta
- ✗ Não deve aplicar antecedência de outro estabelecimento (isolamento multi-estabelecimento)

---

### US-607 — Informar dados pessoais e concluir o agendamento

**Como** Cliente (`P2`),  
**quero** informar nome, telefone e e-mail e confirmar o agendamento,  
**para que** eu receba a confirmação sem precisar criar conta.

**Critérios de aceite:**

- ✓ Formulário solicita: nome, telefone, e-mail (validação de formato)
- ✓ Após envio válido, o agendamento é persistido com sucesso e o estado **visível ao cliente e ao dono** é **confirmado** (fluxo bem-sucedido)
- ✓ Estado `pendente` pode existir apenas **transitório e interno** durante processamento atômico; **nunca** é rotulado como tal na UI do cliente
- ✓ Disparo de e-mail de confirmação imediato ao cliente (detalhes de envio e retry no [módulo 07](../07-notifications/USER_STORIES.md))
- ✓ Mensagem de sucesso na UI com resumo (data, horário, profissional, serviços)
- ✗ Não deve criar usuário/login para o cliente
- ✗ Não deve confirmar agendamento se o slot deixou de estar disponível (concorrência); exibir erro e pedir nova escolha

**Regra de negócio:** cancelamentos e conclusões seguem o diagrama de estados do agendamento neste módulo.

---

### US-608 — Cancelar agendamento via link

**Como** Cliente (`P2`),  
**quero** cancelar meu agendamento através de um link recebido por e-mail,  
**para que** eu libere o horário sem precisar contactar o estabelecimento.

**Critérios de aceite:**

- ✓ Link contém token opaco e não adivinhável, associado a um único agendamento
- ✓ Cancelamento só é permitido para agendamentos em estado **confirmado** (e política de “até quando” pode ser a mesma janela dos lembretes; documentar no produto se há prazo mínimo antes do horário)
- ✓ Após cancelamento válido, estado do agendamento passa a **cancelado** e o intervalo fica disponível para novos agendamentos
- ✓ Cliente recebe e-mail de confirmação de cancelamento; dono recebe notificação (módulo 07)
- ✓ Token inválido ou agendamento já cancelado/concluído exibe mensagem adequada sem expor dados de terceiros
- ✗ Não deve cancelar sem confirmação explícita na página (evitar cancelamento acidental por pré-visualização)
- ✗ Não deve permitir reutilizar o mesmo token após cancelamento bem-sucedido (invalidar ou idempotência clara)

---

### US-609 — Concluir atendimento (visão cliente / consistência com painel)

**Como** Dono (`P1`) ou operação do estabelecimento,  
**quero** que agendamentos confirmados possam ser marcados como concluídos no painel,  
**para que** o histórico reflita o comparecimento.

**Critérios de aceite:**

- ✓ Agendamento **confirmado** pode transitar para **concluído** a partir do painel (fora do escopo de UI deste documento, mas estado deve existir no modelo)
- ✓ Cliente na página pública não precisa de fluxo dedicado para “concluído”; pode ver status apenas se houver tela de consulta futura
- ✗ Cliente não deve ver estado interno transitório
- ✗ Não deve ser possível “concluir” agendamento cancelado sem trilha de auditoria/correção administrativa

---

## Referência cruzada

- Notificações por e-mail, retry e lembretes: [docs/flow/07-notifications/USER_STORIES.md](../07-notifications/USER_STORIES.md)
- Cadastro de serviços e profissionais: [docs/flow/03-establishment-setup/USER_STORIES.md](../03-establishment-setup/USER_STORIES.md)
