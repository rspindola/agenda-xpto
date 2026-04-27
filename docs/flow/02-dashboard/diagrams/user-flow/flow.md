# 02 — Dashboard: fluxo do utilizador (painel)

Fluxo do **donno (Admin)** após autenticação. Detalhe de user stories: [USER_STORIES.md](../../USER_STORIES.md).

```mermaid
flowchart TD
  start([Login_bem_sucedido])
  dash[Dashboard_estabelecimento_activo]
  start --> dash

  subgraph quick [Accoes_rapidas_desde_o_dashboard]
    q1[Alternar_estabelecimento]
    q2[Clicar_proximo_agendamento]
    q3[Abrir_atalhos_de_alertas]
    q4[Abrir_disponibilidade_sem_slots]
  end

  subgraph modules [Navegacao_para_modulos]
    m05[Modulo_05_Agenda_calendario]
    m04[Modulo_04_Disponibilidade]
    m07[Modulo_07_Notificacoes]
    m03[Modulo_03_Setup_estabelecimento]
    m06[Modulo_06_Pagina_publica_teste]
    m08[Modulo_08_Relatorios_fora_MVP_resumo]
  end

  dash --> q1
  dash --> q2
  dash --> q3
  dash --> q4

  q1 --> dash
  q2 --> m05
  q3 --> m04
  q3 --> m07
  q3 --> m05
  q4 --> m04

  dash --> m05
  dash --> m04
  dash --> m07
  dash --> m03
  dash --> m06

  dash -.->|"tendencias_receita_comparativos_fora_MVP"| m08[Modulo_08_Relatorios]
```

**Legenda**

- **Acções rápidas:** interacções que actualizam ou navegam com um clique a partir do próprio dashboard ([US-109](../../USER_STORIES.md)).
- **Navegação:** entradas de menu ou links equivalentes para trabalho prolongado (lista completa, configuração, relatórios).
- **Módulo 08:** não faz parte do MVP do dashboard; linha tracejada indica pedido explícito fora do escopo do ecrã inicial.
