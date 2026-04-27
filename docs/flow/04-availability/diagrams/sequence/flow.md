# 04 — Diagramas de sequência: disponibilidade

## 1. Consulta de slots na página pública (integração com módulo 06)

Fluxo em que o **cliente** (módulo 06) obtém horários válidos; o servidor aplica todas as camadas do módulo 04 + ocupação por agendamentos **confirmados**.

```mermaid
sequenceDiagram
    participant Cliente as Cliente pagina publica
    participant Web as Front publico
    participant API as API slots agendamento
    participant Reg as Servico regras disponibilidade
    participant DB as Base de dados

    Cliente->>Web: Escolhe servicos e duracao total
    Cliente->>Web: Escolhe profissional ou data
    Web->>API: GET slots estabelecimento profissional periodo duracao

    API->>Reg: Calcular candidatos
    Reg->>DB: Expediente estabelecimento
    DB-->>Reg: Blocos semanais tenant

    Reg->>DB: Disponibilidade profissional
    DB-->>Reg: Blocos por dia

    Reg->>DB: Feriados e bloqueios ativos
    DB-->>Reg: Intervalos excluidos

    Reg->>DB: Antecedencia minima tenant
    DB-->>Reg: Minutos

    Reg->>DB: Agendamentos confirmados sobrepostos
    DB-->>Reg: Ocupacao

    Reg-->>API: Lista inicios validos
    API-->>Web: JSON slots
    Web-->>Cliente: Mostra horarios disponiveis
```

**Notas:**

- A mesma função de cálculo (ou equivalente) deve ser invocada na **criação** do agendamento com validação final e bloqueio transacional do intervalo.
- Lembretes e e-mails transacionais após reserva/cancelamento: [módulo 07](../../07-notifications/USER_STORIES.md).

---

## 2. Dono grava bloqueio com conflitos e cancelamento em massa (US-417 opção B)

```mermaid
sequenceDiagram
    participant Dono as Dono painel
    participant Web as Front admin
    participant API as API disponibilidade
    participant DB as Base de dados
    participant Notif as Fila notificacoes modulo 07

    Dono->>Web: Cria bloqueio intervalo e ambito
    Web->>API: POST bloqueios
    API->>DB: INSERT bloqueio estado ativo
    API->>DB: SELECT agendamentos confirmados intersectam
    DB-->>API: Lista conflitos ou vazio

    alt Sem conflitos
        API-->>Web: 201 bloqueio e conflitos vazios
    else Com conflitos
        API-->>Web: 201 bloqueio mais lista conflitos
        Web-->>Dono: Mostra lista e opcoes

        Dono->>Web: Confirma cancelamento em massa
        Web->>API: POST bloqueios id cancelar afetados
        API->>DB: UPDATE agendamentos para cancelado
        API->>Notif: Enfileirar e-mails por agendamento
        API-->>Web: 200 resultado
        Web-->>Dono: Resumo e confirmacao
    end
```

*(Os códigos HTTP são exemplificativos; o essencial é: bloqueio persistido, deteção de conflitos, cancelamento explícito em massa e disparo de notificações.)*
