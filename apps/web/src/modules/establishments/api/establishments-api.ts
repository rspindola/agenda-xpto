import { api } from '#/lib/axios'
import type {
  BusinessHoursSummary,
  CreateEstablishmentInput,
  ProfessionalSummary,
  ServiceSummary,
  UpdateEstablishmentInput,
} from '../schemas/establishment.schema'

export type EstablishmentPublic = {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  address: string | null
  timezone: string
  minAdvanceMinutes: number
  isActive: boolean
  operationalEmail: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateEstablishmentBody = CreateEstablishmentInput
export type UpdateEstablishmentBody = UpdateEstablishmentInput

export const establishmentsApi = {
  async list(): Promise<EstablishmentPublic[]> {
    const { data } = await api.get<EstablishmentPublic[]>('/api/v1/establishments')
    return data
  },

  async getById(id: string): Promise<EstablishmentPublic> {
    const { data } = await api.get<EstablishmentPublic>(`/api/v1/establishments/${id}`)
    return data
  },

  async create(body: CreateEstablishmentBody): Promise<EstablishmentPublic> {
    const { data } = await api.post<EstablishmentPublic>('/api/v1/establishments', body)
    return data
  },

  async update(id: string, body: UpdateEstablishmentBody): Promise<EstablishmentPublic> {
    const { data } = await api.patch<EstablishmentPublic>(`/api/v1/establishments/${id}`, body)
    return data
  },

  async delete(id: string): Promise<{ success: true }> {
    const { data } = await api.delete<{ success: true }>(`/api/v1/establishments/${id}`)
    return data
  },

  async getProfessionals(id: string): Promise<ProfessionalSummary[]> {
    const { data } = await api.get<ProfessionalSummary[]>(`/api/v1/establishments/${id}/professionals`)
    return data
  },

  async getServices(id: string): Promise<ServiceSummary[]> {
    const { data } = await api.get<ServiceSummary[]>(`/api/v1/establishments/${id}/services`)
    return data
  },

  async getBusinessHours(id: string): Promise<BusinessHoursSummary[]> {
    const { data } = await api.get<BusinessHoursSummary[]>(
      `/api/v1/establishments/${id}/availability/business-hours`
    )
    return data
  },
}
