import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfessionalStepForm } from '../components/professional-step-form'
import { establishmentKeys } from '#/modules/auth/query-keys'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

describe('ProfessionalStepForm Component (T19)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()

    // Pre-populate establishments query so the form has an establishmentId
    queryClient.setQueryData(establishmentKeys.list(), [
      {
        id: 'est_mock_123',
        name: 'Mock Salon',
        slug: 'mock-salon',
        email: 'salon@example.com',
        timezone: 'America/Sao_Paulo',
      },
    ])
  })

  it('validates name input on submit', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfessionalStepForm onSuccess={vi.fn()} onSkip={vi.fn()} />
      </QueryClientProvider>
    )

    const submitBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Nome do profissional é obrigatório')).toBeDefined()
    })
  })

  it('calls onSkip when skip button is clicked', () => {
    const handleSkip = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <ProfessionalStepForm onSuccess={vi.fn()} onSkip={handleSkip} />
      </QueryClientProvider>
    )

    const skipBtn = screen.getByRole('button', { name: 'Pular' })
    fireEvent.click(skipBtn)
    expect(handleSkip).toHaveBeenCalledTimes(1)
  })

  it('submits successfully when name is provided', async () => {
    const handleSuccess = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <ProfessionalStepForm onSuccess={handleSuccess} onSkip={vi.fn()} />
      </QueryClientProvider>
    )

    const nameInput = screen.getByLabelText('Nome do Profissional')
    fireEvent.change(nameInput, { target: { value: 'Robson Hair' } })

    const submitBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
