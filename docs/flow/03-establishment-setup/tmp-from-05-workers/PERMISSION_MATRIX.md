# Worker Panel v2 — Matriz de Permissões

## Visão Geral

Três roles estão definidas para workers com acesso ao painel administrativo:

| Role | Descrição | Casos de Uso | Restrições |
|------|-----------|--------------|-----------|
| **view_only** | Consulta de dados, sem alterações | Receptionist, novo profissional | Apenas leitura |
| **editor** | Gerencia seus próprios dados | Profissional experiente | Não pode criar/deletar, apenas editar seus dados |
| **admin_worker** | Acesso quase completo | Gerente/coordenador | Sem acesso a billing, configurações de tenant |

---

## Matriz de Permissões por Módulo

### 📅 Módulo: Agendamentos

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Listar agendamentos (todos) | ❌ | ⚠️ Seus | ✅ |
| Listar agendamentos (outros workers) | ❌ | ❌ | ✅ |
| Visualizar detalhes | ⚠️ Seus | ⚠️ Seus | ✅ |
| Criar agendamento | ❌ | ✅ (para si) | ✅ |
| Editar agendamento | ❌ | ⚠️ Apenas seus | ✅ |
| Deletar agendamento | ❌ | ❌ | ✅ |
| Confirmar agendamento | ⚠️ Seus | ⚠️ Seus | ✅ |
| Cancelar agendamento | ⚠️ Seus | ⚠️ Seus | ✅ |
| Enviar lembrete manual | ❌ | ❌ | ✅ |
| Gerar relatório de agendamentos | ❌ | ❌ | ✅ |

### 👥 Módulo: Clientes

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Listar clientes | ✅ | ✅ | ✅ |
| Visualizar detalhes de cliente | ✅ | ✅ | ✅ |
| Editar informações de cliente | ❌ | ⚠️ Seus clientes | ✅ |
| Adicionar novo cliente | ❌ | ⚠️ Seus | ✅ |
| Deletar cliente | ❌ | ❌ | ✅ |
| Ver histórico de agendamentos | ✅ | ✅ | ✅ |
| Exportar lista de clientes | ❌ | ❌ | ✅ |

### 💼 Módulo: Serviços

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Listar serviços | ✅ | ✅ | ✅ |
| Visualizar detalhes | ✅ | ✅ | ✅ |
| Criar novo serviço | ❌ | ❌ | ✅ |
| Editar serviço | ❌ | ❌ | ✅ |
| Deletar serviço | ❌ | ❌ | ✅ |
| Gerenciar profissionais por serviço | ❌ | ❌ | ✅ |
| Definir preço | ❌ | ❌ | ✅ |

### ⏰ Módulo: Horários & Disponibilidade

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Visualizar horários | ✅ | ✅ | ✅ |
| Editar seus horários | ❌ | ✅ | ✅ |
| Editar horários de outros workers | ❌ | ❌ | ✅ |
| Definir horários especiais/feriados | ❌ | ❌ | ✅ |
| Visualizar folgas | ✅ | ✅ | ✅ |
| Registrar folga | ⚠️ Suas | ⚠️ Suas | ✅ |

### 👨‍💼 Módulo: Gerenciamento de Workers (Profissionais)

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Listar workers | ✅ | ✅ | ✅ |
| Visualizar perfil de worker | ✅ | ✅ | ✅ |
| Convidar novo worker | ❌ | ❌ | ✅ |
| Ativar/Desativar worker | ❌ | ❌ | ✅ |
| Editar perfil de worker | ❌ | ⚠️ Próprio | ✅ |
| Deletar worker | ❌ | ❌ | ✅ |
| Mudar role do worker | ❌ | ❌ | ✅ |
| Reset de senha (outro worker) | ❌ | ❌ | ✅ |
| Ver auditoria de worker | ❌ | ❌ | ✅ |

### 📊 Módulo: Relatórios & Analytics

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Dashboard resumido | ✅ (seus dados) | ✅ (seus dados) | ✅ (todos) |
| Relatório de agendamentos | ❌ | ⚠️ Seus | ✅ |
| Relatório de receita | ❌ | ❌ | ✅ |
| Relatório de clientes | ❌ | ❌ | ✅ |
| Exportar dados | ❌ | ❌ | ✅ |

### ⚙️ Módulo: Configurações (BLOQUEADO para todos)

| Ação | view_only | editor | admin_worker |
|------|-----------|--------|--------------|
| Editar nome do negócio | ❌ | ❌ | ❌ |
| Editar categorias | ❌ | ❌ | ❌ |
| Gerenciar billing | ❌ | ❌ | ❌ |
| Gerenciar integrações | ❌ | ❌ | ❌ |
| Gerenciar roles/permissões | ❌ | ❌ | ❌ |
| Deletar negócio | ❌ | ❌ | ❌ |

---

## Legenda de Símbolos

| Símbolo | Significado |
|---------|------------|
| ✅ | Permissão total |
| ⚠️ | Permissão condicional (ver descrição) |
| ❌ | Sem permissão |

---

## Regras de Contexto

### "Seus dados" (⚠️)
- **editor**: Pode ver e editar apenas seus próprios agendamentos, horários, clientes associados
- Exemplo: Worker A não pode alterar agendamento do Worker B

### "Seus clientes" (⚠️)
- **editor**: Pode ver clientes que já atendeu
- Pode adicionar/editar informações de clientes que marcaram serviços com ele

### "Seu perfil" (⚠️)
- **editor**: Pode editar nome, telefone, foto (informações pessoais)
- Não pode alterar email de login ou role

### "Suas folgas" (⚠️)
- **editor**: Pode marcar folgas pessoais
- Quando marca folga, horários ficam indisponíveis para agendamento
- admin_worker vê todas as folgas

---

## Casos de Uso Comuns

### 1. Receptionist (view_only)
- Consulta agendamentos para responder clientes
- Visualiza dados de clientes (telefone, email)
- Vê horários disponíveis
- **Não pode**: Criar, editar ou deletar nada

### 2. Profissional (editor)
- Visualiza seus agendamentos
- Confirma/cancela seus agendamentos
- Edita seus horários
- Adiciona clientes novos
- Edita seu perfil
- **Não pode**: Ver agendamentos de outros, alterar serviços, gerenciar outros workers

### 3. Gerente/Coordenador (admin_worker)
- Acesso completo a agendamentos, clientes, workers
- Cria novos serviços
- Gerencia horários de todos
- Convidada e ativa novos workers
- Gera relatórios
- **Não pode**: Alterar configurações do tenant (billing, nome, etc)

---

## Validações de Segurança

Toda ação deve verificar:

```typescript
// Pseudo-code para middleware de autorização

async function authorizeAction(worker, action, resource) {
  // 1. Verificar se worker tem a permissão
  const hasPermission = checkPermission(worker.role, action);
  
  // 2. Se condicional (⚠️), verificar contexto
  if (isConditional(action)) {
    if (action === 'edit_appointment') {
      // Verificar se é seu agendamento
      return resource.professional_id === worker.professional_id;
    }
  }
  
  // 3. Sempre auditar
  auditLog({
    worker_id: worker.id,
    action,
    resource_id: resource.id,
    timestamp: now(),
    allowed: hasPermission
  });
  
  return hasPermission;
}
```

---

## Evolução Futura (v2.1+)

- **Roles customizados**: Tenant define seus próprios roles + permissions
- **Granular permissions**: Permissões por departamento ou serviço
- **Temporal permissions**: Acesso temporário (ex: guest worker por um dia)
- **Delegação**: admin_worker pode delegar certos poderes
