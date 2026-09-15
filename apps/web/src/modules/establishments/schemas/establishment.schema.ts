import { z } from 'zod'

export const createEstablishmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional()
    .or(z.literal('')),
  email: z.string().email('E-mail comercial inválido'),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
  minAdvanceMinutes: z.number().int().min(0).max(1440).optional(),
  isActive: z.boolean().optional().default(true),
  operationalEmail: z.string().email('E-mail operacional inválido').optional().or(z.literal('')),
})

export const updateEstablishmentSchema = createEstablishmentSchema.partial()

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>

export type ProfessionalSummary = {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
}

export type ServiceSummary = {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
  isActive: boolean
}

export type BusinessHoursSummary = {
  weekday: number
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}
