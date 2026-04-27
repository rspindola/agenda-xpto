# 06 — Wireframes ASCII: página pública de agendamento

Rascunhos de layout para as telas do fluxo público (`/b/:slug`). Complementa [USER_STORIES.md](../../USER_STORIES.md) e [step-by-step.md](../../step-by-step.md).

---

## 1. Tela inicial (header do estabelecimento)

```
+------------------------------------------------------------------+
|  [LOGO]   Salao Beleza Exemplo                                   |
|           Rua das Flores, 123 - Centro                           |
|           [foto capa / ambiente]                                 |
+------------------------------------------------------------------+
|                                                                  |
|   Bem-vindo! Agende seu horario sem criar conta.                 |
|                                                                  |
|                    [ Agendar agora ]                             |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 2. Seleção de serviços e combos

```
+------------------------------------------------------------------+
|  Escolha os servicos                                             |
+------------------------------------------------------------------+
|  [ ] Corte masculino        45 min          R$ 50               |
|  [x] Barba                  30 min          R$ 35               |
|  [ ] Combo Corte+Barba      60 min          R$ 75               |
+------------------------------------------------------------------+
|  Resumo: Barba | Duracao total: 30 min | Total: R$ 35           |
|                                                                  |
|  [ Voltar ]                         [ Continuar > ]              |
+------------------------------------------------------------------+
```

---

## 3a. Caminho A — escolher profissional primeiro

```
+------------------------------------------------------------------+
|  Quem vai atender voce?                                          |
|  Alternar: [ Escolher data primeiro (Caminho B) ]                |
+------------------------------------------------------------------+
|  ( ) Maria Silva    — atende todos os itens selecionados         |
|  ( ) Joao Souza     — atende todos os itens selecionados         |
+------------------------------------------------------------------+
|  [ Voltar ]                         [ Continuar > ]              |
+------------------------------------------------------------------+
```

---

## 3b. Caminho B — escolher data primeiro

```
+------------------------------------------------------------------+
|  Escolha a data                                                  |
|  Alternar: [ Escolher profissional primeiro (Caminho A) ]      |
+------------------------------------------------------------------+
|   < Abril 2026 >                                                 |
|   Dom Seg Ter Qua Qui Sex Sab                                  |
|              15  16  17  18                                     |
+------------------------------------------------------------------+
|  [ Voltar ]                         [ Continuar > ]              |
+------------------------------------------------------------------+
```

---

## 4. Calendário com slots disponíveis

```
+------------------------------------------------------------------+
|  Horarios para Maria Silva | Duracao do agendamento: 30 min      |
+------------------------------------------------------------------+
|  Manha                                                           |
|   [ 09:00 ]  [ 09:30 ]  [--10:00--]  (slot indisponivel)        |
|  Tarde                                                           |
|   [ 14:00 ]  [ 15:30 ]                                          |
+------------------------------------------------------------------+
|  Legenda: slots respeitam bloco continuo ate fechamento         |
+------------------------------------------------------------------+
|  [ Voltar ]                         [ Continuar > ]              |
+------------------------------------------------------------------+
```

*(Caminho B: após data/horário, lista equivalente de profissionais livres no intervalo `[inicio, inicio + duracao total)`.)*

---

## 5. Formulário de dados do cliente

```
+------------------------------------------------------------------+
|  Seus dados                                                      |
+------------------------------------------------------------------+
|  Nome completo     [________________________________]            |
|  Telefone          [ (__) _____-____ ]                          |
|  E-mail            [________________________________]            |
+------------------------------------------------------------------+
|  [ Voltar ]              [ Confirmar agendamento ]              |
+------------------------------------------------------------------+
```

---

## 6. Tela de confirmação com resumo (sucesso)

```
+------------------------------------------------------------------+
|  Agendamento confirmado!                                         |
+------------------------------------------------------------------+
|  Salao Beleza Exemplo                                            |
|  Data: 18/04/2026  as  15:30                                     |
|  Profissional: Maria Silva                                       |
|  Servicos: Barba (30 min)                                        |
+------------------------------------------------------------------+
|  Voce recebera um e-mail de confirmacao. Lembretes e link de     |
|  cancelamento seguem a politica do estabelecimento.              |
+------------------------------------------------------------------+
|                    [ OK ]                                        |
+------------------------------------------------------------------+
```

---

## 7. Cancelamento via link (token)

```
+------------------------------------------------------------------+
|  Cancelar agendamento                                            |
+------------------------------------------------------------------+
|  Salao Beleza Exemplo                                            |
|  18/04/2026 15:30 | Barba | Maria Silva                          |
+------------------------------------------------------------------+
|  Tem certeza? O horario sera liberado para outros clientes.      |
|                                                                  |
|  [ Voltar sem cancelar ]          [ Confirmar cancelamento ]     |
+------------------------------------------------------------------+
```

**Estados de erro (token inválido / já cancelado):** mensagem curta, sem dados de terceiros, sem expor estados internos (`pendente`).
