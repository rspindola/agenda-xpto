import { api } from '#/lib/axios'
import type { Service, CreateServiceDTO, UpdateServiceDTO } from '../types'

export const servicesApi = {
  getServices: async (establishmentId: string): Promise<Service[]> => {
    const { data } = await api.get<{ services: Service[] }>(`/establishments/${establishmentId}/services`)
    return data.services
  },

  getService: async (establishmentId: string, serviceId: string): Promise<Service> => {
    const { data } = await api.get<{ service: Service }>(`/establishments/${establishmentId}/services/${serviceId}`)
    return data.service
  },

  createService: async (establishmentId: string, payload: CreateServiceDTO): Promise<Service> => {
    const { data } = await api.post<Service>(`/establishments/${establishmentId}/services`, payload)
    return data
  },

  updateService: async (establishmentId: string, serviceId: string, payload: UpdateServiceDTO): Promise<Service> => {
    const { data } = await api.put<Service>(`/establishments/${establishmentId}/services/${serviceId}`, payload)
    return data
  },

  deleteService: async (establishmentId: string, serviceId: string): Promise<void> => {
    await api.delete(`/establishments/${establishmentId}/services/${serviceId}`)
  },
}
