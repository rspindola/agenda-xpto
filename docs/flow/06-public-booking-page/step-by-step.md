# 06 — Página pública de agendamento: passo a passo

Documento operacional dos fluxos **Caminho A**, **Caminho B** e **cancelamento via link**. Complementa as [USER_STORIES](./USER_STORIES.md).

---

## Pré-condições

- Estabelecimento ativo com slug público válido.
- Serviços (e opcionalmente combos) cadastrados; profissionais com serviços associados e janelas de disponibilidade definidas.
- Antecedência mínima e feriados configurados conforme regras do estabelecimento.

---

## Caminho A — Profissional primeiro, depois horário

1. Cliente acessa a URL pública do estabelecimento.
2. Cliente seleciona um ou mais itens: serviços avulsos e/ou combos pré-definidos. O sistema calcula e exibe **duração total** e resumo de preço.
3. Por padrão, o fluxo segue o **Caminho A** (sem alternar para B).
4. Sistema lista **profissionais elegíveis** (que realizam todos os itens selecionados).
5. Cliente escolhe um profissional.
6. Sistema apresenta **calendário e slots** onde exista bloco contínuo de tamanho igual à duração total, respeitando:
   - horário de funcionamento e disponibilidade do profissional;
   - feriados e bloqueios;
   - antecedência mínima;
   - ausência de conflito com outros agendamentos.
7. Cliente escolhe data e horário de início.
8. Cliente preenche **nome**, **telefone** e **e-mail**.
9. Cliente confirma o agendamento na UI.
10. Backend valida disponibilidade novamente (concorrência), persiste o agendamento e expõe estado **confirmado** ao cliente. Estado interno transitório `pendente`, se usado, não aparece na interface.
11. Sistema enfileira envio de **e-mail de confirmação** ao cliente (ver módulo 07).
12. UI exibe página ou modal de sucesso com resumo e orientação sobre próximos e-mails (lembretes, cancelamento).

---

## Caminho B — Data/horário primeiro, depois profissional

1. Cliente acessa a URL pública do estabelecimento.
2. Cliente seleciona serviços/combos como no passo 2 do Caminho A (duração total calculada).
3. Cliente escolhe **alternar para Caminho B** na UI.
4. Cliente escolhe **data** desejada.
5. Cliente escolhe **horário de início** entre os slots que respeitam antecedência mínima e fechamentos (para **algum** profissional elegível ainda desconhecido).
6. Sistema lista **profissionais disponíveis** para o intervalo `[horário escolhido, horário + duração total)` e que atendem todos os itens.
7. Se a lista for vazia, exibir mensagem e sugerir outro horário ou voltar ao Caminho A.
8. Cliente escolhe um dos profissionais listados.
9. Cliente preenche nome, telefone e e-mail.
10. Cliente confirma na UI.
11. Mesmas validações de concorrência e persistência que no Caminho A; resultado **confirmado** para o cliente.
12. E-mail de confirmação enfileirado; UI de sucesso.

**Observação:** a ordem de implementação pode reutilizar o mesmo motor de “busca de intervalo válido”; apenas a ordem das decisões do usuário muda.

---

## Cancelamento via link

1. Cliente abre o link de cancelamento recebido por e-mail (token na URL ou página que consome token).
2. Sistema valida o token e carrega o agendamento (sem expor dados se token inválido).
3. Página exibe **resumo** (estabelecimento, data, horário, serviços) e botão de confirmação de cancelamento.
4. Cliente confirma o cancelamento explicitamente.
5. Backend verifica se o agendamento ainda está **confirmado** e dentro da política de prazo (se existir).
6. Estado atualizado para **cancelado**; slot liberado para novos agendamentos.
7. E-mails disparados: confirmação de cancelamento ao cliente; notificação ao dono (módulo 07).
8. Token invalidado ou operação idempotente: nova tentativa de cancelamento mostra estado já cancelado sem efeitos colaterais duplicados.

---

## Tratamento de erros comuns (resumo)

| Situação | Comportamento esperado |
|----------|-------------------------|
| Slot ocupado entre seleção e confirmação | Mensagem clara; manter dados do cliente opcionalmente; forçar nova escolha de horário/profissional |
| Alternância A/B deixa seleção inconsistente | Pedir reescolha do passo afetado com explicação curta |
| Estabelecimento inativo | Bloquear fluxo com mensagem amigável |
