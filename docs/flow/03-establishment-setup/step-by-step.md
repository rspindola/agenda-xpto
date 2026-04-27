# Step-by-step - Establishment Setup

## Etapa 1 - Configurar estabelecimento

##  Configurar o Estabelecimento

  

**Menu:** Painel Admin → **Configurações**

  

Esta é a primeira etapa obrigatória após criar a conta. As informações aqui definidas serão usadas pelo assistente IA nas conversas com os seus clientes.
| Campo                   | Descrição                                   | Exemplo                          |
|------------------------|---------------------------------------------|----------------------------------|
| Nome                   | Nome do estabelecimento                     | Barbearia do João               |
| E-mail                 | E-mail de contacto                          | contato@barbeariaj.com          |
| Telefone               | Número de contacto                          | +55 11 99999-0000               |
| Endereço               | Morada completa                             | Rua das Flores, 123             |
| Fuso Horário           | Fuso da sua localização                     | America/Sao_Paulo               |
| Moeda                  | Moeda para exibir preços                    | BRL, MZN, EUR, USD              |
| Limite de Cancelamento | Tempo mínimo antes da marcação para cancelar| Sem limite, 2h, 4h, 6h, 12h, 24h|

###  Horário de Funcionamento

  

Configure os dias e horários em que o estabelecimento está aberto:

  

-  Ative ou desative cada dia da semana.

-  Defina o horário de abertura e encerramento.

  

**Exemplo:** Seg-Sex: 09:00–19:00 | Sáb: 08:00–16:00 | Dom: Fechado

  

###  Logotipo

  

Carregue o logotipo do seu estabelecimento. Formatos aceites: JPG, PNG. Tamanho recomendado: 200x200 pixels.

  

**Dica:** Preencha todas as informações com atenção. O assistente IA utiliza estes dados para informar os clientes sobre horário, endereço e contacto.

![Tela de Configurações](image.png)

---

## Etapa 2 - Cadastrar servicos e profissionais

## Cadastrar Serviços

**Menu:** Painel Admin → **Serviços**

![Tela de Serviços](image.png)

### Como adicionar um serviço:

1. Clique em **"Novo Serviço"**.
2. Preencha: **Nome, Descrição, Duração (minutos)** e **Preço**.
3. Clique em **"Salvar"**.

![Adicionar Serviço](image-1.png)

### Gerenciar serviços:

- **Editar** — Clique no ícone de edição para alterar qualquer informação.  
- **Ativar/Desativar** — Um serviço desativado não será oferecido pelo assistente IA.  
- **Filtrar** — Use os filtros para ver apenas serviços ativos ou inativos.  
- **Excluir** — Clique no ícone de exclusão para excluir qualquer serviço. 
 
![Editar Serviço](image-2.png)
![Excluir Serviço](image-3.png)

### Exemplos por tipo de estabelecimento:

#### Barbearia
- Corte Masculino — 30 min — R$ 35  
- Barba — 20 min — R$ 25  
- Corte + Barba — 50 min — R$ 55  
- Pigmentação — 45 min — R$ 80  

#### Salão de Beleza
- Corte Feminino — 60 min — R$ 80  
- Escova — 40 min — R$ 50  
- Coloração — 120 min — R$ 150  
- Manicure — 45 min — R$ 40  

#### Spa
- Massagem Relaxante — 60 min — R$ 120  
- Limpeza de Pele — 90 min — R$ 100  
- Day Spa Completo — 240 min — R$ 350

---

## Etapa 3 - Operacao de workers e monitoramento

A operacao assincrona (lembretes, no-show, debitagem de creditos, filas e retry) fica documentada nos diagramas de `diagrams/sequence/setup-flow.md`, `diagrams/state-diagram/states.md`, `diagrams/user-flow/flow.md` e `diagrams/wireframes/pages.md` deste modulo.
