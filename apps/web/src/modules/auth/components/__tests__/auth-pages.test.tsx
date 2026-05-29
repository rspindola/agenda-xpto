import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '../login-form'
import { SignUpForm } from '../sign-up-form'
import { VerifyEmailPanel } from '../verify-email-panel'
import { ForgotPasswordForm } from '../forgot-password-form'
import { ResetPasswordForm } from '../reset-password-form'
import { server } from '#/test/setup'
import { http, HttpResponse } from 'msw'

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

vi.mock('@tanstack/react-router', () => {
  const navigateMock = vi.fn()
  return {
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    useNavigate: () => navigateMock,
  }
})

describe('Auth Form Pages (T11 - T14)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  describe('T11: LoginForm', () => {
    it('renders login fields', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <LoginForm />
        </QueryClientProvider>
      )
      expect(screen.getByPlaceholderText('exemplo@gmail.com')).toBeDefined()
      expect(screen.getByPlaceholderText('Digite sua senha...')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeDefined()
    })

    it('submits form and maps generic error on failure', async () => {
      // Mock sign-in failing
      server.use(
        http.post(`${VITE_API_URL}/api/auth/sign-in/email`, () => {
          return new HttpResponse(null, { status: 401 })
        })
      )

      render(
        <QueryClientProvider client={queryClient}>
          <LoginForm />
        </QueryClientProvider>
      )

      const emailInput = screen.getByPlaceholderText('exemplo@gmail.com')
      const passInput = screen.getByPlaceholderText('Digite sua senha...')
      const submitBtn = screen.getByRole('button', { name: 'Entrar' })

      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } })
      fireEvent.change(passInput, { target: { value: 'password123' } })
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('E-mail ou senha inválidos.')).toBeDefined()
      })
    })
  })

  describe('T12: SignUpForm', () => {
    it('renders signup fields', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <SignUpForm />
        </QueryClientProvider>
      )
      expect(screen.getByPlaceholderText('Ex: Calebe Silva')).toBeDefined()
      expect(screen.getByPlaceholderText('exemplo@gmail.com')).toBeDefined()
      expect(screen.getByPlaceholderText('Crie uma senha forte...')).toBeDefined()
      expect(screen.getByPlaceholderText('Confirme sua senha...')).toBeDefined()
    })

    it('displays duplicate email error message on 400/409', async () => {
      server.use(
        http.post(`${VITE_API_URL}/api/auth/sign-up/email`, () => {
          return HttpResponse.json(
            { message: 'Email already exists', code: 'EMAIL_ALREADY_EXISTS' },
            { status: 400 }
          )
        })
      )

      render(
        <QueryClientProvider client={queryClient}>
          <SignUpForm />
        </QueryClientProvider>
      )

      fireEvent.change(screen.getByPlaceholderText('Ex: Calebe Silva'), { target: { value: 'Jane' } })
      fireEvent.change(screen.getByPlaceholderText('exemplo@gmail.com'), { target: { value: 'already@example.com' } })
      fireEvent.change(screen.getByPlaceholderText('Crie uma senha forte...'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

      await waitFor(() => {
        expect(screen.getByText('Este e-mail já está cadastrado.')).toBeDefined()
      })
    })
  })

  describe('T13: VerifyEmailPanel', () => {
    it('renders with email and triggers resend with cooldown', async () => {
      // Use fake timers but only fake setInterval and clearInterval to avoid blocking async queries
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })

      render(
        <QueryClientProvider client={queryClient}>
          <VerifyEmailPanel email="user@example.com" />
        </QueryClientProvider>
      )

      expect(screen.getByText('user@example.com')).toBeDefined()
      const button = screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' })

      // Click to resend
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('E-mail de confirmação reenviado com sucesso!')).toBeDefined()
      })

      // Cooldown timer is now active
      expect(button).toBeDisabled()
      expect(screen.getByText('Reenviar em 60s')).toBeDefined()

      // Advance time by 10s
      vi.advanceTimersByTime(10000)
      
      await waitFor(() => {
        expect(screen.getByText('Reenviar em 50s')).toBeDefined()
      })

      // Advance remaining 50s
      vi.advanceTimersByTime(50000)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' })).not.toBeDisabled()
      })

      vi.useRealTimers()
    })
  })

  describe('T14: ForgotPasswordForm & ResetPasswordForm', () => {
    it('Forgot password always displays neutral success state on submit', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ForgotPasswordForm />
        </QueryClientProvider>
      )

      const emailInput = screen.getByPlaceholderText('exemplo@gmail.com')
      fireEvent.change(emailInput, { target: { value: 'any@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: 'Recuperar senha' }))

      await waitFor(() => {
        expect(
          screen.getByText(
            'Se o endereço de e-mail inserido estiver associado a uma conta, enviamos um link para redefinir sua senha.'
          )
        ).toBeDefined()
      })
    })

    it('Reset password renders invalid link card when token is missing', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ResetPasswordForm token={null} />
        </QueryClientProvider>
      )

      expect(screen.getByText('Link inválido ou expirado')).toBeDefined()
      expect(screen.getByText('Solicitar nova recuperação')).toBeDefined()
    })

    it('Reset password renders form and submits when token is present', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ResetPasswordForm token="valid-reset-token" />
        </QueryClientProvider>
      )

      expect(screen.getByPlaceholderText('Digite sua nova senha...')).toBeDefined()
      expect(screen.getByPlaceholderText('Confirme sua nova senha...')).toBeDefined()

      fireEvent.change(screen.getByPlaceholderText('Digite sua nova senha...'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirme sua nova senha...'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }))

      await waitFor(() => {
        expect(screen.queryByText('Token de recuperação ausente ou inválido.')).toBeNull()
      })
    })
  })
})
