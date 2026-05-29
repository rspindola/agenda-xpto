import { z } from 'zod'

export const businessStepSchema = z.object({
  name: z.string().min(1, 'Nome do negócio é obrigatório').max(200, 'Nome muito longo'),
  email: z.string().email('E-mail inválido'),
  timezone: z.string().min(1, 'Fuso horário é obrigatório').default('America/Sao_Paulo'),
})

export type BusinessStepInput = z.infer<typeof businessStepSchema>

export const professionalStepSchema = z.object({
  name: z.string().min(1, 'Nome do profissional é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

export type ProfessionalStepInput = z.infer<typeof professionalStepSchema>
