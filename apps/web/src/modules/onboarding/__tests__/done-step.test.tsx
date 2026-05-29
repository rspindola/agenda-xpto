import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnboardingDoneSummary } from '../components/onboarding-done-summary'
import { establishmentKeys } from '#/modules/auth/query-keys'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

describe('OnboardingDoneSummary Component (T22)', () => {
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

  it('renders congratulatory message and business summary', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingDoneSummary onSuccess={vi.fn()} />
      </QueryClientProvider>
    )

    expect(screen.getByText('Tudo Pronto!')).toBeDefined()
    expect(screen.getByText('Mock Salon')).toBeDefined()
    expect(screen.getByText('salon@example.com')).toBeDefined()
  })

  it('triggers onSuccess when next button is clicked', () => {
    const handleSuccess = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingDoneSummary onSuccess={handleSuccess} />
      </QueryClientProvider>
    )

    const nextBtn = screen.getByRole('button', { name: 'Ir para o Dashboard' })
    fireEvent.click(nextBtn)
    expect(handleSuccess).toHaveBeenCalledTimes(1)
  })
})
