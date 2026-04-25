# User Stories — XP WhatsApp

> Formato: `Como [persona], quero [ação], para que [benefício]`
> Critérios de aceite usam ✓ (deve funcionar) e ✗ (não deve acontecer)

---

## Personas

| ID | Persona | Descrição |
|----|---------|-----------|
| `P1` | **Admin** | Dono/gestor do estabelecimento. Acessa o painel web. |
| `P2` | **Cliente** | Cliente final. Interage via WhatsApp ou web. |
| `P3` | **IA** | Assistente virtual que atende o cliente. |

---

## Módulo 03 — Configurações

### US-201 — Configurar dados básicos
**Como** Admin (`P1`),  
**quero** preenchero nome do estabelecimento, slug único, telefone e endereço,  
**para que** meu negócio fique cadastrado corretamente no sistema.

**Critérios de aceite:**
- ✓ Formulário valida email único (case-insensitive)
- ✓ Slug aceita apenas letras, números e hífen
- ✓ Telefone é validado (formato E.164 ou nacional)
- ✓ Endereço permite até 500 caracteres
- ✓ Dados salvos com sucesso retornam mensagem de confirmação
- ✗ Não deve permitir slug duplicado (retorna 409)
- ✗ Não deve aceitar telefone inválido

---

### US-202 — Definir horário de funcionamento
**Como** Admin (`P1`),  
**quero** configurar horário de abertura, fechamento e intervalo de almoço para cada dia da semana,  
**para que** o sistema saiba quando posso receber agendamentos.

**Critérios de aceite:**
- ✓ Interface permite selecionar 7 dias (seg-dom)
- ✓ Horários são validados (abertura < fechamento)
- ✓ Intervalo de almoço é opcional
- ✓ Dados salvos geram lista de "blocos de disponibilidade"
- ✓ Cada dia pode ter horário diferente
- ✗ Não deve aceitar horário invertido (18:00 - 09:00)
- ✗ Não deve permitir intervalo de almoço fora do expediente

---

### US-203 — Gerenciar feriados e suspensões
**Como** Admin (`P1`),  
**quero** adicionar, editar e remover datas de feriado/suspensão,  
**para que** o sistema não permita agendamentos nessas datas.

**Critérios de aceite:**
- ✓ Interface exibe lista de feriados com data e motivo
- ✓ Botão "Adicionar" abre form com data + descrição
- ✓ Editar permite modificar data/motivo existente
- ✓ Deletar pede confirmação antes de remover
- ✓ Feriado adicionado aparece imediatamente na lista
- ✗ Não deve permitir feriado no passado (exceto hoje)
- ✗ Não deve permitir data duplicada para mesmo feriado

---

### US-204 — Conectar WhatsApp (integração)
**Como** Admin (`P1`),  
**quero** conectar meu WhatsApp via QR Code (ZeroFila API),  
**para que** eu possa receber e responder mensagens de clientes.

**Critérios de aceite:**
- ✓ Botão "Conectar WhatsApp" exibe QR Code em tempo real
- ✓ QR Code renova a cada 15 segundos
- ✓ Após scanear, status muda para "Conectado" com número exibido
- ✓ Desconectar remove a sessão (reversível)
- ✓ Status sempre atualizado (ativo/inativo)
- ✗ Não deve armazenar credenciais Meta localmente
- ✗ Não deve quebrar após logout da conta WhatsApp

---
