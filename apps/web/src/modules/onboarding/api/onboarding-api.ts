import { api } from '#/lib/axios'

export type CreateProfessionalBody = {
  name: string
  email?: string
  phone?: string
}

export type ProfessionalPublic = {
  id: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export type BusinessHourPublic = {
  id?: string
  weekday: string
  closed: boolean
  opensAt?: string
  closesAt?: string
  breakStartsAt?: string | null
  breakEndsAt?: string | null
}

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export type UpsertBusinessHourBody = {
  closed: boolean
  opensAt?: string
  closesAt?: string
  breakStartsAt?: string | null
  breakEndsAt?: string | null
}

export const onboardingApi = {
  async createProfessional(
    establishmentId: string,
    body: CreateProfessionalBody
  ): Promise<ProfessionalPublic> {
    const { data } = await api.post<ProfessionalPublic>(
      `/api/v1/establishments/${establishmentId}/professionals`,
      body
    )
    return data
  },

  async upsertBusinessHour(
    establishmentId: string,
    weekday: string,
    body: UpsertBusinessHourBody
  ): Promise<BusinessHourPublic> {
    const { data } = await api.put<BusinessHourPublic>(
      `/api/v1/establishments/${establishmentId}/availability/business-hours/${weekday}`,
      body
    )
    return data
  },

  async upsertBusinessHoursBatch(
    establishmentId: string,
    batch: { weekday: string; body: UpsertBusinessHourBody }[]
  ): Promise<BusinessHourPublic[]> {
    return Promise.all(
      batch.map((item) => onboardingApi.upsertBusinessHour(establishmentId, item.weekday, item.body))
    )
  },
}
