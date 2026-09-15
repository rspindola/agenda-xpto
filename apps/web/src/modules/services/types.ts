export interface Service {
  id: string
  establishmentId: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  catalogCombo: boolean
  createdAt: string
  // Linked professionals can be represented via an array of relationships
  professionals?: ProfessionalServiceLink[]
}

export interface ProfessionalServiceLink {
  professionalId: string
  serviceId: string
  priceOverrideCents: number | null
}

export interface CreateServiceDTO {
  name: string
  description?: string | null
  durationMinutes: number
  priceCents: number
  catalogCombo: boolean
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}
