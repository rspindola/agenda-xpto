import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HoursStepForm } from '../components/hours-step-form'
import { establishmentKeys } from '#/modules/auth/query-keys'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

describe('HoursStepForm Component (T21)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()

    // Pre-populate establishments list query
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

  it('renders all weekdays with correct toggles', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HoursStepForm onSuccess={vi.fn()} onSkip={vi.fn()} />
      </QueryClientProvider>
    )

    expect(screen.getByText('Segunda-feira')).toBeDefined()
    expect(screen.getByText('Sábado')).toBeDefined()
    expect(screen.getByText('Domingo')).toBeDefined()
  })

  it('calls onSkip when skip button is clicked', () => {
    const handleSkip = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <HoursStepForm onSuccess={vi.fn()} onSkip={handleSkip} />
      </QueryClientProvider>
    )

    const skipBtn = screen.getByRole('button', { name: 'Pular' })
    fireEvent.click(skipBtn)
    expect(handleSkip).toHaveBeenCalledTimes(1)
  })

  it('submits successfully when next button is clicked', async () => {
    const handleSuccess = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <HoursStepForm onSuccess={handleSuccess} onSkip={vi.fn()} />
      </QueryClientProvider>
    )

    const submitBtn = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
