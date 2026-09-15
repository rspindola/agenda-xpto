# Establishment Setup Context

**Gathered:** 2026-09-15
**Spec:** `.specs/features/establishment-setup/spec.md`
**Status:** Ready for spec

---

## Feature Boundary

CRUD completo de estabelecimentos (criar, editar, excluir via soft delete) + multi-establishment switcher para planos Pro/Business + página de configurações (/settings) com sidebar secundário estilo GitHub. **NÃO inclui** CRUD de profissionais nem serviços — são features separadas.

---

## Implementation Decisions

### Escopo do módulo

- CRUD completo: listar, editar, excluir (soft delete) estabelecimentos + criar novos (pós-onboarding)
- Profissionais e serviços são features independentes — não entram neste spec
- Aba "Profissionais" em /settings mostra lista read-only com link para a futura feature de profissionais
- Aba "Serviços" em /settings mostra lista read-only com link para a futura feature de serviços

### Multi-establishment switcher

- Dropdown no header (topbar) — mostra nome do estabelecimento ativo + lista os demais
- **Starter:** ocultar dropdown completamente — mostrar apenas o nome do estabelecimento (sem seta, sem interação de troca)
- **Pro/Business:** dropdown ativo com lista de estabelecimentos + botão "+ Novo Estabelecimento"
- Sem página de listagem separada — o switcher (dropdown) funciona como lista
- Botão "+ Novo" fica dentro do dropdown

### Limites do plano

- Mostrar alert/badge quando o owner está no limite ou próximo do limite de estabelecimentos do plano
- Copy exemplo: "Seu plano permite até 3 estabelecimentos. Faça upgrade para adicionar mais."
- Botão "+ Novo" desabilitado quando no limite
- Sem botão de upgrade inline nesta feature (pode ser adicionado na feature de plans)

### Criação de novo estabelecimento (pós-onboarding)

- Mesmo formulário do onboarding step 1 (nome + timezone), mas com campos opcionais habilitados:
  - phone, address, slug, operationalEmail
- Abre como dialog/modal (não como página separada) — mantém o contexto do dashboard
- Após criação: o novo estabelecimento aparece no switcher e fica ativo

### Tela de configurações (/settings)

- Navegação lateral (sidebar secundário) estilo GitHub Settings
- Seções: Geral | Horários | Profissionais | Serviços | Zona de Perigo
- URL pattern: `/settings` com sub-rotas (`/settings/general`, `/settings/hours`, etc.)

### Aba "Geral" (Informações do estabelecimento)

- Campos editáveis: nome, email, telefone, endereço, timezone, slug, minAdvanceMinutes, operationalEmail
- Campo `isActive` (toggle ativar/desativar)
- Layout de formulário com save individual por seção ou save global

### Exclusão / Soft Delete

- Botão "Excluir Estabelecimento" na zona de perigo das configurações
- Confirmação dupla: digitar nome do estabelecimento para confirmar
- Soft delete no backend (`deleted_at`)
- Após exclusão: se tinha mais de um, redireciona para o próximo; se era o último, redireciona para onboarding

### Troca de contexto (Agent's Discretion)

- Ao selecionar outro estabelecimento no dropdown: store global atualiza o `activeEstablishmentId`
- Queries que dependem de `establishmentId` são invalidadas automaticamente
- Se o owner estava em uma página contextual (ex: /settings, /agenda), a página recarrega no contexto do novo estabelecimento
- Implementação via TanStack Store (alinhado com decisão em STATE.md de usar TanStack Store como único state manager)

### Aba "Geral" — campos (Agent's Discretion)

- Incluir todos os campos do `EstablishmentPublic` que são editáveis via API:
  - `name`, `email`, `phone`, `address`, `timezone`, `slug`, `minAdvanceMinutes`, `operationalEmail`, `isActive`
- Zona de perigo (excluir) fica na última seção da sidebar, separada visualmente
- Campos avançados (slug, minAdvanceMinutes) podem ter tooltip explicativo

---

## Specific References

- **Switcher estilo Stripe:** dropdown discreto no header com logo/ícone + nome, lista dos outros ao clicar
- **Settings estilo GitHub:** sidebar lateral com itens de navegação, conteúdo à direita
- **Confirmação dupla de exclusão estilo GitHub/Vercel:** digitar o nome do recurso para confirmar
- **Onboarding step 1 como base:** reutilizar o formulário `BusinessStepForm` (ou variante) para criação de novos estabelecimentos

---

## Deferred Ideas

- CRUD completo de profissionais (feature separada)
- CRUD completo de serviços (feature separada)
- Botão de upgrade inline no limite de plano (feature de plans)
- Re-open onboarding wizard from settings (AUTH-19, pendente)
- Upload de logo/imagem do estabelecimento (sem API de upload no backend)
