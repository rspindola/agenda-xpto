import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BusinessStepForm } from '../components/business-step-form'
import { authKeys } from '#/modules/auth/query-keys'

// Mock TanStack router useNavigate
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

describe('BusinessStepForm Component (T18)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()

    // Pre-populate session query
    queryClient.setQueryData(authKeys.session(), {
      user: {
        id: 'user_123',
        email: 'owner@example.com',
        emailVerified: true,
        name: 'John Owner',
      },
    })
  })

  it('pre-populates email from query-cached session user', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BusinessStepForm onSuccess={vi.fn()} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const emailInput = screen.getByLabelText('E-mail Comercial')
      expect(emailInput).toHaveValue('owner@example.com')
    })
  })

  it('validates name input on submit', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BusinessStepForm onSuccess={vi.fn()} />
      </QueryClientProvider>
    )

    const submitBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Nome do negócio é obrigatório')).toBeDefined()
    })
  })

  it('submits successfully when name is provided', async () => {
    const handleSuccess = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <BusinessStepForm onSuccess={handleSuccess} />
      </QueryClientProvider>
    )

    const nameInput = screen.getByLabelText('Nome da Empresa')
    fireEvent.change(nameInput, { target: { value: 'Minha Barbearia' } })

    const submitBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
