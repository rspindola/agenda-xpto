# 04 — Disponibilidade: passo a passo (painel do dono)

Fluxo recomendado para configurar **quando** o estabelecimento e os profissionais aceitam agendamentos. O consumo dessas regras na **página pública** está descrito na secção «Integração com o agendamento (módulo 06)».

**Pré-requisito:** profissionais e serviços já existentes no painel ([módulo 03](../03-establishment-setup/USER_STORIES.md)).

---

## 1. Horário de funcionamento do estabelecimento

1. Dono acede a **Disponibilidade** (ou **Configurações → Horário do estabelecimento**, conforme IA da aplicação).
2. Para cada dia da semana: ativar ou desativar; se ativo, definir abertura, fechamento e opcionalmente intervalo de almoço.
3. Guardar. O sistema valida (abertura antes do fechamento; almoço dentro do período).
4. O resultado define o **teto** temporal em que qualquer profissional pode ter slots (interseção com a sua própria disponibilidade).

**Exemplo:** Seg–Sex 09:00–19:00 com almoço 12:00–13:00; Sáb 08:00–16:00; Dom fechado.

---

## 2. Disponibilidade semanal por profissional

1. Na mesma área, selecionar **profissional** na lista.
2. Por cada dia: definir um ou mais blocos (ex.: 09:00–12:00 e 14:00–19:00) ou marcar dia como folga.
3. Guardar. O sistema recusa blocos fora do expediente do estabelecimento nesse dia.
4. Repetir para cada profissional que atende ao público.

**Dica:** almoço do profissional pode ser modelado com dois blocos contíguos ao intervalo desejado.

---

## 3. Feriados e suspensões (nível estabelecimento)

1. Abrir **Feriados e suspensões** (calendário do estabelecimento).
2. Adicionar data (ou intervalo, se o modelo o suportar) e motivo; guardar.
3. Nesses dias, **nenhum** profissional apresenta slots na consulta pública.

---

## 4. Bloqueios pontuais (folgas, férias, fecho, intervalo reservado)

1. Abrir **Bloqueios**.
2. Escolher âmbito: **profissional** ou **todo o estabelecimento**.
3. Definir início, fim e motivo; guardar.
4. Se existirem **agendamentos confirmados** que intersectam o período (**US-417, opção B**):
   - O sistema **permite guardar** o bloqueio.
   - Apresenta **lista de conflitos** (agendamentos afetados).
   - O dono pode:
     - **Só confirmar o bloqueio** e tratar reagendamentos manualmente mais tarde, ou
     - Executar **cancelamento em massa** dos listados; para cada um: estado **cancelado**, slot libertado, e-mails disparados via [módulo 07](../07-notifications/USER_STORIES.md) (cliente e regras de notificação ao dono, conforme tipo de evento).

---

## 5. Antecedência mínima

1. Abrir **Regras de agendamento** (ou secção equivalente na área de disponibilidade).
2. Definir valor (ex.: 120 minutos). Guardar.
3. A partir daí, a API de slots e a criação de agendamentos rejeitam inícios antes de `agora + antecedência` ([US-606](../06-public-booking-page/USER_STORIES.md)).

---

## 6. Matriz / vista consolidada (opcional na jornada)

1. Abrir **Vista consolidada** / matriz.
2. Rever profissionais × dias; usar filtros se disponíveis.
3. Para corrigir detalhes, voltar aos passos 1–4.

---

## Integração com o agendamento (módulo 06)

Quando o **cliente** agenda na página pública:

1. O front-end pede slots (profissional, serviços/duração total, intervalo de datas).
2. O **servidor** calcula candidatos aplicando, por ordem lógica: expediente do estabelecimento ∩ disponibilidade do profissional − feriados globais − bloqueios aplicáveis − antecedência mínima − intervalos já ocupados por agendamentos **confirmados**.
3. Devolve apenas inícios válidos para um bloco contínuo de duração pedida.
4. No **submit**, a mesma regra é revalidada para evitar condição de corrida.

*(MVP do produto no [PRD](../../PRD.md) é página web; integrações conversacionais ficam fora deste documento.)*

---

## Resumo de erros comuns

| Problema | Verificar |
|----------|-----------|
| Nenhum slot num dia em que o salão abre | Disponibilidade do profissional nesse dia; feriado; bloqueio |
| Slot aparece e depois falha ao confirmar | Concorrência; revalidar no servidor |
| Bloqueio não bloqueia | Âmbito (profissional vs estabelecimento); datas UTC vs local |
