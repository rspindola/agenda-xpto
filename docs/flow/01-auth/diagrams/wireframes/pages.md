# 01-Auth — Wireframes

## Página de Signup (Criar Conta)

```
┌─────────────────────────────────────────────┐
│          🔒 Criar Conta - ZeroFila          │
├─────────────────────────────────────────────┤
│                                             │
│  Email                                      │
│  ┌───────────────────────────────────────┐  │
│  │ usuario@example.com                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Senha                                      │
│  ┌───────────────────────────────────────┐  │
│  │ ••••••••••••••                        │  │
│  └───────────────────────────────────────┘  │
│  ⓘ Mínimo 8 caracteres, maiúscula,         │
│    minúscula, número                        │
│                                             │
│  Repetir Senha                              │
│  ┌───────────────────────────────────────┐  │
│  │ ••••••••••••••                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│         [ Criar Conta ]                     │
│                                             │
│  Já tem conta? [ Entrar ]                   │
│                                             │
│  📧 Após criar conta, confirme seu email    │
│  para liberar acesso completo ao sistema.   │
│                                             │
└─────────────────────────────────────────────┘
```

## Página de Login

```
┌─────────────────────────────────────────────┐
│          🔒 Entrar - ZeroFila               │
├─────────────────────────────────────────────┤
│                                             │
│  Email                                      │
│  ┌───────────────────────────────────────┐  │
│  │ usuario@example.com                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Senha                                      │
│  ┌───────────────────────────────────────┐  │
│  │ ••••••••••••••                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│         [ Entrar ]                          │
│                                             │
│  [ Esqueceu a senha? ]                      │
│                                             │
│  Não tem conta? [ Criar Conta ]             │
│                                             │
│  ⚠️ Em caso de erro, exibimos mensagem      │
│  genérica de credenciais inválidas.         │
│                                             │
└─────────────────────────────────────────────┘
```

## Página de Recuperação de Senha

```
┌─────────────────────────────────────────────┐
│    🔐 Recuperar Senha - ZeroFila            │
├─────────────────────────────────────────────┤
│                                             │
│  Insira o email da sua conta:               │
│                                             │
│  Email                                      │
│  ┌───────────────────────────────────────┐  │
│  │ usuario@example.com                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│     [ Enviar Link de Reset ]                │
│                                             │
│  [ Voltar ao Login ]                        │
│                                             │
│  ✅ Se o email existir, enviaremos um link. │
│                                             │
└─────────────────────────────────────────────┘
```

## Página de Reset de Senha

```
┌─────────────────────────────────────────────┐
│    🔑 Redefinir Senha - ZeroFila            │
├─────────────────────────────────────────────┤
│                                             │
│  Nova Senha                                 │
│  ┌───────────────────────────────────────┐  │
│  │ ••••••••••••••                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Confirmar Senha                            │
│  ┌───────────────────────────────────────┐  │
│  │ ••••••••••••••                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│     [ Atualizar Senha ]                     │
│                                             │
│  [ Voltar ao Login ]                        │
│                                             │
│  ✅ Senha redefinida com sucesso!           │
│     [ Fazer Login ]                         │
│                                             │
│  ℹ️ O link de reset expira em 1 hora e      │
│  não pode ser reutilizado.                  │
│                                             │
└─────────────────────────────────────────────┘
```

## Página de Verificação de Email (Gate)

```
┌─────────────────────────────────────────────┐
│      📬 Confirmar Email - ZeroFila          │
├─────────────────────────────────────────────┤
│                                             │
│  Enviamos um link para: admin@exemplo.com   │
│                                             │
│  [ Reenviar Email de Confirmação ]          │
│                                             │
│  [ Já confirmei, validar novamente ]        │
│                                             │
│  ⚠️ Até confirmar, ações protegidas          │
│  permanecem bloqueadas.                     │
│                                             │
└─────────────────────────────────────────────┘
```

## Componentes Reutilizáveis

- **TextField** — Input com validação em tempo real
- **PasswordField** — Input com toggle de visualização
- **Button** — Primário (CTA), Secundário (Link)
- **ErrorAlert** — Erro inline ou modal
- **SuccessAlert** — Confirmação
- **LoadingSpinner** — Durante requisição

---

## Páginas de Assistente de Boas-vindas (Onboarding)

### Página 1 — Configure seu Negócio

```
┌─────────────────────────────────────────────┐
│  🏢 Assistente de Configuração - Passo 1/5  │
├─────────────────────────────────────────────┤
│                                             │
│  Configure seu Negócio                      │
│                                             │
│  Nome do Estabelecimento *                  │
│  ┌───────────────────────────────────────┐  │
│  │ Barbearia Central                     │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Categoria de Serviço *                     │
│  ┌───────────────────────────────────────┐  │
│  │ ▼ Barbearia                           │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  País *                                     │
│  ┌───────────────────────────────────────┐  │
│  │ ▼ Portugal                            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Fuso Horário *                             │
│  ┌───────────────────────────────────────┐  │
│  │ ▼ UTC+0 (WET)                         │  │
│  └───────────────────────────────────────┘  │
│                                             │
│        [ Pular ]    [ Próximo → ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Página 2 — Adicione o Primeiro Profissional

```
┌─────────────────────────────────────────────┐
│  👤 Assistente de Configuração - Passo 2/5  │
├─────────────────────────────────────────────┤
│                                             │
│  Adicione o Primeiro Profissional           │
│                                             │
│  Nome Completo *                            │
│  ┌───────────────────────────────────────┐  │
│  │ João Silva                            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Email *                                    │
│  ┌───────────────────────────────────────┐  │
│  │ joao@example.com                      │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Telefone (opcional)                        │
│  ┌───────────────────────────────────────┐  │
│  │ +351 91 2345678                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Foto de Perfil (opcional)                  │
│  ┌───────────────────────────────────────┐  │
│  │        [ + Selecionar Imagem ]        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│        [ Pular ]    [ Próximo → ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Página 3 — Defina o Primeiro Serviço

```
┌─────────────────────────────────────────────┐
│  ✂️  Assistente de Configuração - Passo 3/5 │
├─────────────────────────────────────────────┤
│                                             │
│  Defina o Primeiro Serviço                  │
│                                             │
│  Nome do Serviço *                          │
│  ┌───────────────────────────────────────┐  │
│  │ Corte de Cabelo                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Profissional *                             │
│  ┌───────────────────────────────────────┐  │
│  │ ▼ João Silva                          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Duração (em minutos) *                     │
│  ┌───────────────────────────────────────┐  │
│  │ 30                                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Preço (opcional)                           │
│  ┌───────────────────────────────────────┐  │
│  │ 15.00 €                               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│        [ Pular ]    [ Próximo → ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Página 4 — Defina Horários de Trabalho

```
┌─────────────────────────────────────────────┐
│  ⏰ Assistente de Configuração - Passo 4/5  │
├─────────────────────────────────────────────┤
│                                             │
│  Defina seus Horários de Trabalho           │
│                                             │
│  Dias da Semana                             │
│  ☑ Segunda       ☑ Terça       ☑ Quarta    │
│  ☑ Quinta        ☑ Sexta       ☐ Sábado   │
│  ☐ Domingo                                 │
│                                             │
│  Horário de Abertura *                      │
│  ┌───────────────────────────────────────┐  │
│  │ 09:00                                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Horário de Fechamento *                    │
│  ┌───────────────────────────────────────┐  │
│  │ 18:00                                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Pausa para Almoço (opcional)               │
│  Início: [ 12:00 ]  Fim: [ 13:00 ]         │
│                                             │
│        [ Pular ]    [ Próximo → ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Página 5 — Confirmação Final

```
┌─────────────────────────────────────────────┐
│ ✅ Assistente de Configuração - Passo 5/5  │
├─────────────────────────────────────────────┤
│                                             │
│       🎉 Tudo Pronto!                       │
│                                             │
│  Seu negócio foi configurado com sucesso!   │
│                                             │
│  ✓ Barbearia Central                        │
│  ✓ Profissional: João Silva                 │
│  ✓ Serviço: Corte de Cabelo (30 min)       │
│  ✓ Horários: 09:00 - 18:00                  │
│                                             │
│  Um email com o resumo foi enviado para:    │
│  seu-email@example.com                      │
│                                             │
│  Agora você pode:                           │
│  • Visualizar agendamentos                  │
│  • Receber clientes via WhatsApp            │
│  • Gerenciar profissionais e serviços       │
│  • Consultar relatórios                     │
│                                             │
│        [ ← Editar ]    [ Iniciar →  ]       │
│                                             │
│  Acessar depois: Configurações >            │
│  Assistente de Boas-vindas                  │
│                                             │
└─────────────────────────────────────────────┘
```
