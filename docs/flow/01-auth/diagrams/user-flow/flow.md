# 01-Auth — Fluxo de Usuário

```mermaid
flowchart TD
    start([Visitante])

    start -->|Criar conta| signupForm["Formulario signup (email + senha)"]
    signupForm --> signupValid{Dados validos?}
    signupValid -->|Nao| signupError["Erro de validacao"]
    signupError --> signupForm
    signupValid -->|Sim| signupApi["Criar conta + gerar tokens"]
    signupApi --> signupConflict{Email unico?}
    signupConflict -->|Nao| signupConflictError["Email ja cadastrado (409)"]
    signupConflictError --> signupForm
    signupConflict -->|Sim| postSignup["Redireciona dashboard + envia email confirmacao"]

    postSignup --> verifyGate{Email confirmado?}
    verifyGate -->|Nao| verifyPending["Aguardar clique no link de confirmacao"]
    verifyPending --> verifyToken{Token valido?}
    verifyToken -->|Nao| verifyRetry["Link invalido/expirado + reenviar"]
    verifyRetry --> verifyPending
    verifyToken -->|Sim| onboardingEntry["Iniciar assistente de configuracao"]

    onboardingEntry --> step1["Passo 1: Negocio (salvar ou pular)"]
    step1 --> step2["Passo 2: Profissional (salvar ou pular)"]
    step2 --> step3["Passo 3: Servico (salvar ou pular)"]
    step3 --> step4["Passo 4: Horarios (salvar ou pular)"]
    step4 --> step5["Passo 5: Confirmacao final"]
    step5 --> onboardingDone["Concluir assistente + email resumo"]
    onboardingDone --> dashboard["Dashboard"]

    start -->|Fazer login| loginForm["Formulario login (email + senha)"]
    loginForm --> loginApi["POST /auth/login com rate limit"]
    loginApi --> loginResult{Autenticacao valida?}
    loginResult -->|Nao| loginGeneric["Mensagem generica de erro"]
    loginGeneric --> loginForm
    loginResult -->|Sim| loginState{Conta ativa?}
    loginState -->|Nao| loginBlocked["Conta suspended/inactive"]
    loginBlocked --> loginForm
    loginState -->|Sim| dashboard

    dashboard --> sessionCheck{Access token expirou?}
    sessionCheck -->|Nao| dashboard
    sessionCheck -->|Sim| refreshCall["Tentar refresh silencioso"]
    refreshCall --> refreshResult{Refresh valido?}
    refreshResult -->|Sim| dashboard
    refreshResult -->|Nao| logoutToLogin["Limpar sessao e ir para login"]
    logoutToLogin --> loginForm

    start -->|Esqueceu senha| forgotForm["Formulario de recuperacao"]
    forgotForm --> forgotSubmit["Enviar email"]
    forgotSubmit --> forgotNeutral["Resposta neutra: se existir email, enviaremos link"]
    forgotNeutral --> resetLink["Usuario abre link recebido"]
    resetLink --> resetToken{Token valido, nao expirado e nao usado?}
    resetToken -->|Nao| resetInvalid["Solicitar novo link"]
    resetInvalid --> forgotForm
    resetToken -->|Sim| newPassword["Definir nova senha"]
    newPassword --> resetSaved["Senha atualizada + token marcado como usado"]
    resetSaved --> loginForm
```

**Principais Decisões:**
- Validação de email e senha forte no cadastro
- Mensagens genéricas para evitar enumeração de conta
- Confirmação de email antes do fluxo completo de primeiro acesso
- Token de reset com expiração e uso único (`is_used`)

**Pontos Críticos:**
- ✅ bcrypt com 12 rounds para hashing de senhas
- ✅ JWT tokens com expiração curta (15min access)
- ✅ Refresh token com expiração longa (7 dias)
- ✅ Rate limiting por IP para prevenir brute force
