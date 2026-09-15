import { api } from '#/lib/axios'
import type { Professional, CreateProfessionalDTO, UpdateProfessionalDTO } from '../types'

export const professionalsApi = {
  getProfessionals: async (establishmentId: string): Promise<Professional[]> => {
    const { data } = await api.get<{ professionals: Professional[] }>(`/establishments/${establishmentId}/professionals`)
    return data.professionals
  },

  getProfessional: async (establishmentId: string, professionalId: string): Promise<Professional> => {
    const { data } = await api.get<{ professional: Professional }>(`/establishments/${establishmentId}/professionals/${professionalId}`)
    return data.professional
  },

  createProfessional: async (establishmentId: string, payload: CreateProfessionalDTO): Promise<Professional> => {
    const { data } = await api.post<Professional>(`/establishments/${establishmentId}/professionals`, payload)
    return data
  },

  updateProfessional: async (establishmentId: string, professionalId: string, payload: UpdateProfessionalDTO): Promise<Professional> => {
    const { data } = await api.put<Professional>(`/establishments/${establishmentId}/professionals/${professionalId}`, payload)
    return data
  },

  deleteProfessional: async (establishmentId: string, professionalId: string): Promise<void> => {
    await api.delete(`/establishments/${establishmentId}/professionals/${professionalId}`)
  },
}
