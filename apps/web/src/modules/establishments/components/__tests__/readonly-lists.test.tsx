import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '#/test/setup'
import { HoursReadonlySummary } from '../hours-readonly-summary'
import { ProfessionalsReadonlyList } from '../professionals-readonly-list'
import { ServicesReadonlyList } from '../services-readonly-list'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Readonly Summaries: Hours, Professionals, Services (T10)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('HoursReadonlySummary', () => {
    it('should render weekday business hours', async () => {
      render(<HoursReadonlySummary establishmentId="est_mock_123" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('hours-readonly-summary')).toBeInTheDocument()
      })

      expect(screen.getByText('Segunda-feira')).toBeInTheDocument()
      expect(screen.getAllByText('09:00 – 18:00').length).toBeGreaterThan(0)
      expect(screen.getByText('Domingo')).toBeInTheDocument()
      expect(screen.getByText('Fechado')).toBeInTheDocument()
    })

    it('should render empty state when no hours are configured', async () => {
      server.use(
        http.get(`${apiBaseUrl}/api/v1/establishments/:id/availability/business-hours`, () => {
          return HttpResponse.json([])
        })
      )

      render(<HoursReadonlySummary establishmentId="est_empty" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('hours-empty-state')).toBeInTheDocument()
      })

      expect(screen.getByText('Nenhum horário configurado')).toBeInTheDocument()
    })
  })

  describe('ProfessionalsReadonlyList', () => {
    it('should render list of professionals', async () => {
      render(<ProfessionalsReadonlyList establishmentId="est_mock_123" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('professionals-readonly-list')).toBeInTheDocument()
      })

      expect(screen.getByText('Mock Professional')).toBeInTheDocument()
      expect(screen.getByText('mockprof@example.com')).toBeInTheDocument()
    })

    it('should render empty state when no professionals exist', async () => {
      server.use(
        http.get(`${apiBaseUrl}/api/v1/establishments/:id/professionals`, () => {
          return HttpResponse.json([])
        })
      )

      render(<ProfessionalsReadonlyList establishmentId="est_empty" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('professionals-empty-state')).toBeInTheDocument()
      })

      expect(screen.getByText('Nenhum profissional cadastrado')).toBeInTheDocument()
    })
  })

  describe('ServicesReadonlyList', () => {
    it('should render list of services with BRL currency formatting', async () => {
      render(<ServicesReadonlyList establishmentId="est_mock_123" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('services-readonly-list')).toBeInTheDocument()
      })

      expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument()
      expect(screen.getByText('30 min')).toBeInTheDocument()
      expect(screen.getByText(/50,00/)).toBeInTheDocument()
    })

    it('should render empty state when no services exist', async () => {
      server.use(
        http.get(`${apiBaseUrl}/api/v1/establishments/:id/services`, () => {
          return HttpResponse.json([])
        })
      )

      render(<ServicesReadonlyList establishmentId="est_empty" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByTestId('services-empty-state')).toBeInTheDocument()
      })

      expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument()
    })
  })
})
