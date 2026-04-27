# Módulo 08 — Relatórios: fluxo do utilizador (AgendaIA)

Fluxo do dono no painel: catálogo → filtros → visualização → exportação; ramo Starter em relatório Pro.

Detalhe: [USER_STORIES.md](../../USER_STORIES.md), [step-by-step.md](../../step-by-step.md). Wireframe: [../wireframes/pages.md](../wireframes/pages.md).

---

## Flowchart

```mermaid
flowchart TD
  startNode([Admin no painel])
  startNode --> reportsMenu[Abrir Relatorios]
  reportsMenu --> catalog[Ver catalogo de relatorios]
  catalog --> pickReport{Qual relatorio}
  pickReport -->|basico Starter| filters[Aplicar filtros data estabelecimento profissional]
  pickReport -->|Pro em Starter| locked[Bloqueado cadeado e CTA upgrade]
  locked --> upgradeFlow[Fluxo planos modulo 09]
  upgradeFlow --> catalog
  pickReport -->|Pro em Pro ou Business| filters
  filters --> validate{Intervalo valido}
  validate -->|invalido| filters
  validate -->|ate 366 dias| view[Ver tabela ou metricas]
  view --> exportChoice{Exportar}
  exportChoice -->|CSV| csv[Gerar CSV]
  exportChoice -->|PDF| pdf[Gerar PDF]
  exportChoice -->|nao| catalog
  csv --> catalog
  pdf --> catalog
```

---

## Referências

- [USER_STORIES.md](../../USER_STORIES.md)  
- [step-by-step.md](../../step-by-step.md)
