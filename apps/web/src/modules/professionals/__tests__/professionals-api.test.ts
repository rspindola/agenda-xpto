import { describe, it, expect, vi, beforeEach } from 'vitest'
import { professionalsApi } from '../api/professionals-api'
import { api } from '#/lib/axios'
import type { Professional, CreateProfessionalDTO, UpdateProfessionalDTO } from '../types'

vi.mock('#/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('professionalsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const establishmentId = 'est-123'
  const mockProfessional: Professional = {
    id: 'pro-1',
    establishmentId,
    name: 'João',
    email: 'joao@example.com',
    phone: '11999999999',
    createdAt: new Date().toISOString(),
  }

  it('getProfessionals should call api.get with correct url', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { professionals: [mockProfessional] } })
    const result = await professionalsApi.getProfessionals(establishmentId)
    expect(api.get).toHaveBeenCalledWith(`/establishments/${establishmentId}/professionals`)
    expect(result).toEqual([mockProfessional])
  })

  it('createProfessional should call api.post with correct payload', async () => {
    const payload: CreateProfessionalDTO = {
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
    }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockProfessional })
    const result = await professionalsApi.createProfessional(establishmentId, payload)
    expect(api.post).toHaveBeenCalledWith(`/establishments/${establishmentId}/professionals`, payload)
    expect(result).toEqual(mockProfessional)
  })

  it('updateProfessional should call api.put with correct payload', async () => {
    const payload: UpdateProfessionalDTO = { name: 'João Silva' }
    vi.mocked(api.put).mockResolvedValueOnce({ data: { ...mockProfessional, ...payload } })
    const result = await professionalsApi.updateProfessional(establishmentId, 'pro-1', payload)
    expect(api.put).toHaveBeenCalledWith(`/establishments/${establishmentId}/professionals/pro-1`, payload)
    expect(result.name).toBe('João Silva')
  })

  it('deleteProfessional should call api.delete with correct url', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } })
    await professionalsApi.deleteProfessional(establishmentId, 'pro-1')
    expect(api.delete).toHaveBeenCalledWith(`/establishments/${establishmentId}/professionals/pro-1`)
  })
})
