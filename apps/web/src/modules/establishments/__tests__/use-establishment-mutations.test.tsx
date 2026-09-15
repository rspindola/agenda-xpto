import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { establishmentKeys } from '../query-keys'
import {
  useEstablishmentDetail,
  useEstablishmentProfessionals,
  useEstablishmentServices,
  useEstablishmentHours,
} from '../hooks/use-establishment-queries'
import { useUpdateEstablishment } from '../hooks/use-update-establishment'
import { useDeleteEstablishment } from '../hooks/use-delete-establishment'
import { useCreateEstablishment } from '../hooks/use-create-establishment'
import { establishmentStore, resetEstablishmentStore } from '../stores/establishment-store'

let queryClient: QueryClient

const createWrapper = () => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Establishment Query & Mutation Hooks (T5)', () => {
  beforeEach(() => {
    localStorage.clear()
    resetEstablishmentStore()
  })

  describe('Query Hooks', () => {
    it('should fetch establishment details', async () => {
      const { result } = renderHook(() => useEstablishmentDetail('est_mock_123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.name).toBe('Mock Establishment')
    })

    it('should fetch establishment professionals', async () => {
      const { result } = renderHook(() => useEstablishmentProfessionals('est_mock_123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeInstanceOf(Array)
      expect(result.current.data?.[0].name).toBe('Mock Professional')
    })

    it('should fetch establishment services', async () => {
      const { result } = renderHook(() => useEstablishmentServices('est_mock_123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeInstanceOf(Array)
      expect(result.current.data?.[0].name).toBe('Corte de Cabelo')
    })

    it('should fetch establishment business hours', async () => {
      const { result } = renderHook(() => useEstablishmentHours('est_mock_123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeInstanceOf(Array)
      expect(result.current.data?.length).toBe(7)
    })
  })

  describe('Mutation Hooks', () => {
    it('should update establishment and invalidate cache', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateEstablishment(), { wrapper })

      let updatedData
      await act(async () => {
        updatedData = await result.current.mutateAsync({
          id: 'est_mock_123',
          body: { name: 'Novo Nome do Negócio' },
        })
      })

      expect(updatedData).toBeDefined()
      expect(updatedData?.name).toBe('Novo Nome do Negócio')
    })

    it('should delete establishment and invalidate list query', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteEstablishment(), { wrapper })

      let deleteRes
      await act(async () => {
        deleteRes = await result.current.mutateAsync('est_mock_123')
      })

      expect(deleteRes).toEqual({ success: true })
    })

    it('should create establishment, invalidate list and set active store id', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateEstablishment(), { wrapper })

      let created
      await act(async () => {
        created = await result.current.mutateAsync({
          name: 'Nova Filial',
          email: 'filial@empresa.com',
          timezone: 'America/Sao_Paulo',
        })
      })

      expect(created?.id).toBe('est_mock_new')
      expect(establishmentStore.state.activeEstablishmentId).toBe('est_mock_new')
    })
  })
})
