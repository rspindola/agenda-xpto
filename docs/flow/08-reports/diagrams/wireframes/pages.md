# Módulo 08 — Wireframe ASCII: página de relatórios

Referência de layout. Fluxo: [../user-flow/flow.md](../user-flow/flow.md). Histórias: [USER_STORIES.md](../../USER_STORIES.md).

---

## Página: Relatórios

```
+-------------------------------------------------------------------------+
|  AgendaIA   [Dashboard] [Agenda] ... [Relatorios]          [Usuario v]|
+-------------------------------------------------------------------------+
|                                                                         |
|  RELATORIOS                                                             |
|                                                                         |
|  +---------------------------+  +-----------------------------------+ |
|  | Lista de relatorios       |  | FILTROS                           | |
|  |                           |  | Data inicio [____/__/__]          | |
|  |  Realizados no periodo    |  | Data fim    [____/__/__]  max 366d| |
|  |  Cancelamentos            |  | Estabelec.  [ v todos      ]      | |
|  |  Taxa de no-show          |  | Profissional[ v todos      ]      | |
|  |  Por profissional         |  | [ Aplicar filtros ]               | |
|  |  Por servico              |  +-----------------------------------+ |
|  |                           |                                        |
|  |  [Pro] Horarios de pico   |  +-----------------------------------+ |
|  |      (cadeado se Starter) |  | VISUALIZACAO                      | |
|  |  [Pro] Servicos rentaveis |  |                                   | |
|  |      (cadeado se Starter) |  |  Tabela / resumo numerico       | |
|  |  [Pro] Retorno anteced.   |  |  (conteudo conforme relatorio   | |
|  |      motivo cancel.       |  |   seleccionado)                  | |
|  |      (cadeado se Starter) |  |                                   | |
|  |                           |  +-----------------------------------+ |
|  |  Starter + Pro clicado:   |                                        |
|  |  +---------------------+  |  [ Exportar CSV ]  [ Exportar PDF ]   | |
|  |  | Upgrade para ver    |  |                                        | |
|  |  | metricas Pro       |  |                                        | |
|  |  +---------------------+  |                                        |
|  +---------------------------+                                        |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Legendas:**

- **`[Pro]`** — relatório disponível em **Pro** e **Business**; no **Starter**, mostrar **cadeado** e painel lateral ou overlay com **CTA upgrade** ([US-120](../../USER_STORIES.md)).
- **Filtros** — aplicam-se a todos os relatórios ([US-121](../../USER_STORIES.md)).
- **Exportação** — CSV e PDF para relatório desbloqueado ([US-127](../../USER_STORIES.md)); indisponível quando o conteúdo Pro está bloqueado no Starter.

---

## Referências

- [USER_STORIES.md](../../USER_STORIES.md)  
- [flow.md](../user-flow/flow.md)
