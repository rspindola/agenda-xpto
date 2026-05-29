import { api } from '#/lib/axios'

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

export type CreateEstablishmentBody = {
  name: string
  slug?: string
  email: string
  phone?: string
  address?: string
  timezone: string
  minAdvanceMinutes?: number
  isActive?: boolean
  operationalEmail?: string
}

export const establishmentsApi = {
  async list(): Promise<EstablishmentPublic[]> {
    const { data } = await api.get<EstablishmentPublic[]>('/api/v1/establishments')
    return data
  },

  async create(body: CreateEstablishmentBody): Promise<EstablishmentPublic> {
    const { data } = await api.post<EstablishmentPublic>('/api/v1/establishments', body)
    return data
  },
}
