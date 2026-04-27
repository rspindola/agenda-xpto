# 04 — Disponibilidade: wireframes ASCII (painel)

Escopo: **horário do estabelecimento**, **disponibilidade por profissional**, **bloqueios** (incl. fluxo de conflitos **US-417 B**), **antecedência mínima**.  
A **configuração básica** do negócio (nome, slug, contactos) permanece documentada no [módulo 03](../../../03-establishment-setup/diagrams/wireframes/pages.md); não duplicamos aqui.

---

## Página: Horário de funcionamento do estabelecimento

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Horário do estabelecimento          [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  Define em que dias o salão abre. Profissionais só podem ter    │
│  blocos dentro destes horários.                                  │
│                                                                  │
│  ☑ Segunda    Abre [09:00▼]  Fecha [19:00▼]  Almoço opcional     │
│               De [12:00▼] até [13:00▼]  [ ] Sem almoço           │
│  ☑ Terça      (igual / copiar segunda)          [Copiar p/…]     │
│  … (Qua Dom)                                                     │
│  ☐ Domingo   (fechado)                                           │
│                                                                  │
│                         [ Guardar ]   [ Cancelar ]               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Página: Disponibilidade por profissional

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Por profissional                   [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  Profissional: [ Ana Silva                           ▼ ]        │
│                                                                  │
│  Legenda: dentro do horário do estabelecimento em cada dia.    │
│                                                                  │
│  ☑ Segunda   Bloco 1  [09:00▼] — [12:00▼]   [+ Bloco]            │
│              Bloco 2  [14:00▼] — [19:00▼]                      │
│  ☑ Terça     …                                                 │
│  ☐ Domingo   Folga                                             │
│                                                                  │
│  [ Guardar disponibilidade ]                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Página: Feriados e suspensões (estabelecimento)

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Feriados                           [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  [ + Adicionar data ]                                            │
│                                                                  │
│  • 25/12/2026 — Natal                            [Editar] [Rem.] │
│  • 01/01/2027 — Ano novo                         [Editar] [Rem.] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Página: Bloqueios + conflitos com agendamentos confirmados (US-417 B)

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Bloqueios                          [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  Âmbito: ( ) Profissional [ João ▼ ]  (•) Todo o estabelecimento │
│  De:  [ 10/08/2026  08:00 ]   Até: [ 20/08/2026  18:00 ]         │
│  Motivo: [ Férias coletivas                              ]      │
│                                                                  │
│  [ Guardar bloqueio ]                                            │
├─────────────────────────────────────────────────────────────────┤
│  ⚠ Conflitos com agendamentos confirmados (3)                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ☐ 10/08 09:00  João  Maria — Corte                         │ │
│  │ ☐ 12/08 14:00  João  Pedro — Corte+Barba                   │ │
│  │ ☐ 15/08 11:00  Ana   Luís  — Manicure                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│  [ Selecionar todos ]                                           │
│                                                                  │
│  [ Cancelar agendamentos selecionados e notificar clientes ]    │
│  (dispara e-mails módulo 07; requer confirmação em modal)        │
│                                                                  │
│  [ Fechar sem cancelar ]  — bloqueio já está guardado            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Secção ou página: Antecedência mínima

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Regras de agendamento              [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  Antecedência mínima para novos agendamentos:                    │
│  [ 120 ] minutos   (ex.: não permitir slot nos próximos 2 h)    │
│  ⓘ Aplicado na página pública e na validação do servidor.       │
│                                                                  │
│  [ Guardar ]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vista consolidada (matriz — US-415)

```
┌─────────────────────────────────────────────────────────────────┐
│  Disponibilidade > Vista consolidada                  [← Voltar] │
├─────────────────────────────────────────────────────────────────┤
│  Filtro serviço: [ Todos ▼ ]     Profissional: [ Todos ▼ ]       │
│                                                                  │
│            │ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb │ Dom             │
│  ──────────┼─────┼─────┼─────┼─────┼─────┼─────┼────            │
│  Ana       │ 9-19│ 9-19│ —   │ 9-19│ 9-14│ —   │ —              │
│  João      │ 9-12│ …   │ …   │ …   │ …   │ …   │ …              │
│                                                                  │
│  (células: resumo de blocos; clique leva ao editor US-411)       │
└─────────────────────────────────────────────────────────────────┘
```
