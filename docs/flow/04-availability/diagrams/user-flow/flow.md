# 04 — Fluxo de utilizador: configuração (dono) e consumo (agendamento)

Dois eixos: **P1** no painel a definir regras; **cliente** na página pública a consumir slots calculados com essas regras ([módulo 06](../../06-public-booking-page/USER_STORIES.md)).

```mermaid
flowchart TB
    subgraph configDono [Configuracao pelo dono P1]
        StartDono([Dono autenticado]) --> MenuDisp[Abre Disponibilidade]
        MenuDisp --> Estab[US-410 Horario estabelecimento]
        Estab --> Prof[US-411 Disponibilidade por profissional]
        Prof --> Feriados[US-412 Feriados suspensões]
        Feriados --> Bloq[US-413 Bloqueios pontuais]
        Bloq --> Conflito{Tem confirmados<br/>em conflito?}
        Conflito -->|Sim| Lista[Mostrar lista conflitos US-417]
        Lista --> Escolha{Acao dono}
        Escolha -->|Massa cancelar| Massa[Cancelar e notificar modulo 07]
        Escolha -->|Apenas guardar| SoBloq[Bloqueio ativo sem massa]
        Conflito -->|Nao| Antec[US-414 Antecedencia minima]
        Massa --> Antec
        SoBloq --> Antec
        Antec --> Matriz[US-415 Vista consolidada opcional]
        Matriz --> FimDono([Regras atualizadas])
    end

    subgraph consultaCliente [Consulta no agendamento modulo 06]
        StartCli([Cliente abre slug]) --> Escolhas[Seleciona servicos duracao]
        Escolhas --> Pedido[Pede slots ao servidor]
        Pedido --> Motor[US-416 Intersecao regras 04]
        Motor --> Slots{Slots devolvidos}
        Slots -->|Lista| Confirma[Confirma agendamento]
        Confirma --> AgendConfirmado[Agendamento confirmado modulo 05 06]
    end

    FimDono -.->|Altera dados lidos| Motor
```

**Legenda:** a seta tracejada indica que alterações gravadas no painel passam a alimentar o motor na **próxima** consulta (ver [US-418](../../USER_STORIES.md)).
