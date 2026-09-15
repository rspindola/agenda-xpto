export interface Professional {
  id: string
  establishmentId: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  services?: ProfessionalServiceLink[]
}

export interface ProfessionalServiceLink {
  professionalId: string
  serviceId: string
  priceOverrideCents: number | null
}

export interface CreateProfessionalDTO {
  name: string
  email?: string | null
  phone?: string | null
  services?: { serviceId: string; priceOverrideCents: number | null }[]
}

export interface UpdateProfessionalDTO extends Partial<CreateProfessionalDTO> {}
