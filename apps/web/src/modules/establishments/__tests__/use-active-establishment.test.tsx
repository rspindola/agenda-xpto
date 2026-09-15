import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '#/test/setup'
import {
  establishmentStore,
  setActiveEstablishmentId,
  resetEstablishmentStore,
  ESTABLISHMENT_STORAGE_KEY,
} from '../stores/establishment-store'
import { useActiveEstablishment } from '../hooks/use-active-establishment'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const mockEstablishment1 = {
  id: 'est_mock_123',
  name: 'Mock Establishment 1',
  slug: 'mock-establishment-1',
  email: 'mock1@establishment.com',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: null,
  phone: null,
  address: null,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockEstablishment2 = {
  id: 'est_mock_456',
  name: 'Mock Establishment 2',
  slug: 'mock-establishment-2',
  email: 'mock2@establishment.com',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: null,
  phone: null,
  address: null,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Active Establishment Store & Hook (T4)', () => {
  beforeEach(() => {
    localStorage.clear()
    resetEstablishmentStore()
  })

  describe('establishmentStore', () => {
    it('should initialize with null or localStorage value', () => {
      expect(establishmentStore.state.activeEstablishmentId).toBeNull()

      localStorage.setItem(ESTABLISHMENT_STORAGE_KEY, 'est_saved_123')
      setActiveEstablishmentId('est_saved_123')
      expect(establishmentStore.state.activeEstablishmentId).toBe('est_saved_123')
      expect(localStorage.getItem(ESTABLISHMENT_STORAGE_KEY)).toBe('est_saved_123')
    })

    it('should update active establishment id and localStorage', () => {
      setActiveEstablishmentId('est_abc')
      expect(establishmentStore.state.activeEstablishmentId).toBe('est_abc')
      expect(localStorage.getItem(ESTABLISHMENT_STORAGE_KEY)).toBe('est_abc')

      setActiveEstablishmentId(null)
      expect(establishmentStore.state.activeEstablishmentId).toBeNull()
      expect(localStorage.getItem(ESTABLISHMENT_STORAGE_KEY)).toBeNull()
    })
  })

  describe('useActiveEstablishment hook', () => {
    it('should auto-fallback to first establishment when none is active', async () => {
      const { result } = renderHook(() => useActiveEstablishment(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.establishments.length).toBeGreaterThan(0)
      })

      expect(result.current.activeEstablishmentId).toBe('est_mock_123')
      expect(result.current.activeEstablishment?.name).toBe('Mock Establishment')
    })

    it('should allow switching between valid establishments', async () => {
      server.use(
        http.get(`${apiBaseUrl}/api/v1/establishments`, () => {
          return HttpResponse.json([mockEstablishment1, mockEstablishment2])
        })
      )

      const { result } = renderHook(() => useActiveEstablishment(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.establishments.length).toBe(2)
      })

      expect(result.current.activeEstablishmentId).toBe('est_mock_123')

      act(() => {
        result.current.setActiveEstablishmentId('est_mock_456')
      })

      expect(establishmentStore.state.activeEstablishmentId).toBe('est_mock_456')
      expect(result.current.activeEstablishment?.name).toBe('Mock Establishment 2')
    })
  })
})
