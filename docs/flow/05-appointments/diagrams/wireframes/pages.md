# 05-Appointments — Wireframes

## Página: Listar Agendamentos

```
┌─────────────────────────────────────────────────────────┐
│  Agendamentos                              [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Filtros:  [Status ▼] [Data ▼] [Profissional ▼]        │
│           [🔄 Limpar]                                   │
│                                                         │
│ Totais: 🟢 23 Confirmados | ❌ 5 Cancelados             │
│         🔵 2 Concluídos | ⚪ 1 No-show                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🟢 18/05/2026 09:00 — João Silva                        │
│    ✂️ Corte Masculino (30 min) | R$ 35,00               │
│    Cliente: Maria (11) 98765-4321                       │
│    [Ver] [Editar] [✓ Confirmar] [❌ Cancelar]           │
│                                                         │
│ 🟢 18/05/2026 10:00 — Pedro Costa                       │
│    🧔 Barba (20 min) | R$ 25,00                         │
│    Cliente: Ana (11) 98765-4322                         │
│    [Ver] [Editar] [✓ Confirmar] [❌ Cancelar]           │
│                                                         │
│ 🟢 18/05/2026 11:00 — João Silva                        │
│    ✂️+🧔 Combo (50 min) | R$ 55,00                      │
│    Cliente: Carlos (11) 98765-4323                      │
│    [Ver] [Editar] [✓ Confirmar] [❌ Cancelar]           │
│                                                         │
│ ❌ 17/05/2026 14:00 — João Silva                        │
│    ✂️ Corte Masculino (30 min) | R$ 35,00               │
│    Cliente: Lucas (11) 98765-4324 — CANCELADO           │
│    [Ver]                                                │
│                                                         │
│ [ Próxima ]  1-10 de 31  [ Próxima ]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Página: Detalhe do Agendamento

```
┌─────────────────────────────────────────────────────────┐
│  Detalhe do Agendamento                    [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Status: 🟢 CONFIRMADO                                   │
│                                                         │
│ Data e Hora                                             │
│ 📅 Sexta, 18 de Maio de 2026                            │
│ 🕐 09:00 - 09:30                                        │
│                                                         │
│ Serviço                                                 │
│ ✂️ Corte Masculino (30 minutos)                         │
│ R$ 35,00                                                │
│                                                         │
│ Profissional                                            │
│ 👨 João Silva (joao@barbearia.com)                      │
│                                                         │
│ Cliente                                                 │
│ 👤 Maria Silva                                          │
│ 📱 (11) 98765-4321                                      │
│ 📧 maria@email.com                                      │
│                                                         │
│ Notas                                                   │
│ Agendamento via WhatsApp. Cliente prefere máquina.      │
│                                                         │
│ Link de Cancelamento (para cliente)                     │
│ 🔗 agendaxpto.app/cancel/abc-def-123-456                  │
│ (Expire em: 18/05/2026 09:00)                           │
│                                                         │
│ Ações:                                                  │
│ [Editar] [Reenviar Lembrete] [Marcar Concluído]        │
│ [Marcar No-show] [Cancelar]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Página: Editar Agendamento

```
┌─────────────────────────────────────────────────────────┐
│  Editar Agendamento                        [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Serviço *                                               │
│ ┌───────────────────────────────────────────────────┐  │
│ │ ✂️ Corte Masculino              ▼                 │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Profissional *                                          │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 👨 João Silva                   ▼                 │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Data *                                                  │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 18/05/2026                  [📅 Calendário]       │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Horário *                                               │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 09:00                       [🕐 Picker]           │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ⚠️ Horários disponíveis:                                │
│ [ 08:00 ] [ 08:30 ] [ 09:00 ] [ 09:30 ] ...            │
│                                                         │
│         [ Salvar ]  [ Cancelar ]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Página: Vista de Calendário

```
┌─────────────────────────────────────────────────────────┐
│  Agenda — Maio 2026                        [← Voltar]   │
├─────────────────────────────────────────────────────────┤
│ [◀ Anterior]  Maio 2026  [Próximo ▶]                   │
│ [Dia] [Semana] [Mês]                                    │
├─────────────────────────────────────────────────────────┤
│ Seg    Ter    Qua    Qui    Sex    Sab    Dom           │
├─────────────────────────────────────────────────────────┤
│  1      2      3      4      5      6      7            │
│                                                         │
│  8      9     10     11     12     13     14            │
│                                                         │
│ 15     16     17    🟢18🟢   🟢19    20     21            │
│         [3]         [5]      [2]                        │
│                                                         │
│ 22     23     24     25    ❌26    27     28            │
│                                   [1]                   │
│                                                         │
│ 29     30     31                                        │
│                                                         │
│ Legenda:                                                │
│ 🟢 Confirmado  ❌ Cancelado  🔵 Concluído  ⚪ No-show  │
│ [N] = número de agendamentos naquele dia              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
