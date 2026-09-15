import { describe, it, expect, vi, beforeEach } from 'vitest'
import { servicesApi } from '../api/services-api'
import { api } from '#/lib/axios'
import type { Service, CreateServiceDTO, UpdateServiceDTO } from '../types'

vi.mock('#/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('servicesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const establishmentId = 'est-123'
  const mockService: Service = {
    id: 'srv-1',
    establishmentId,
    name: 'Corte',
    description: null,
    durationMinutes: 30,
    priceCents: 5000,
    catalogCombo: false,
    createdAt: new Date().toISOString(),
  }

  it('getServices should call api.get with correct url', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { services: [mockService] } })
    const result = await servicesApi.getServices(establishmentId)
    expect(api.get).toHaveBeenCalledWith(`/establishments/${establishmentId}/services`)
    expect(result).toEqual([mockService])
  })

  it('createService should call api.post with correct payload', async () => {
    const payload: CreateServiceDTO = {
      name: 'Corte',
      durationMinutes: 30,
      priceCents: 5000,
      catalogCombo: false,
    }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockService })
    const result = await servicesApi.createService(establishmentId, payload)
    expect(api.post).toHaveBeenCalledWith(`/establishments/${establishmentId}/services`, payload)
    expect(result).toEqual(mockService)
  })

  it('updateService should call api.put with correct payload', async () => {
    const payload: UpdateServiceDTO = { priceCents: 6000 }
    vi.mocked(api.put).mockResolvedValueOnce({ data: { ...mockService, ...payload } })
    const result = await servicesApi.updateService(establishmentId, 'srv-1', payload)
    expect(api.put).toHaveBeenCalledWith(`/establishments/${establishmentId}/services/srv-1`, payload)
    expect(result.priceCents).toBe(6000)
  })

  it('deleteService should call api.delete with correct url', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } })
    await servicesApi.deleteService(establishmentId, 'srv-1')
    expect(api.delete).toHaveBeenCalledWith(`/establishments/${establishmentId}/services/srv-1`)
  })
})
