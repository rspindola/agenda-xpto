import { z } from 'zod'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const TIME_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/

export const step1BusinessSchema = z.object({
  name: z.string().min(1, 'O nome do negócio é obrigatório').max(200),
  slug: z
    .string()
    .min(1, 'O slug deve ter pelo menos 1 caractere')
    .max(120)
    .regex(SLUG_PATTERN, 'O slug deve conter apenas letras minúsculas, números e hífens')
    .optional()
    .or(z.literal('')),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(8, 'Telefone inválido').max(30).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  timezone: z.string().min(1, 'Fuso horário é obrigatório').max(64),
  minAdvanceMinutes: z.coerce.number().int().min(0).max(10080).default(0),
})

export type Step1BusinessInput = z.infer<typeof step1BusinessSchema>

export const step2ProfessionalSchema = z.object({
  name: z.string().min(1, 'O nome do profissional é obrigatório').max(200),
  email: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  phone: z
    .string()
    .min(8, 'Telefone inválido')
    .max(30)
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
})

export type Step2ProfessionalInput = z.infer<typeof step2ProfessionalSchema>

export const step3ServiceSchema = z.object({
  name: z.string().min(1, 'O nome do serviço é obrigatório').max(200),
  durationMinutes: z.coerce
    .number({ required_error: 'A duração é obrigatória' })
    .int()
    .min(5, 'A duração mínima é de 5 minutos')
    .max(1440, 'A duração máxima é de 24 horas'),
  priceCents: z.coerce
    .number()
    .int()
    .min(0, 'O preço não pode ser negativo')
    .optional()
    .default(0),
})

export type Step3ServiceInput = z.infer<typeof step3ServiceSchema>

const timeHmSchema = z.string().regex(TIME_HH_MM, 'Formato de hora deve ser HH:mm')

export const workingHourItemSchema = z
  .object({
    closed: z.boolean().default(false),
    opensAt: timeHmSchema.optional(),
    closesAt: timeHmSchema.optional(),
    breakStartsAt: timeHmSchema.nullable().optional(),
    breakEndsAt: timeHmSchema.nullable().optional(),
  })
  .superRefine((day, ctx) => {
    if (day.closed) {
      return
    }

    if (!day.opensAt || !day.closesAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Horário de abertura e fechamento são obrigatórios',
        path: ['opensAt'],
      })
      return
    }

    const timeToMinutes = (timeStr: string) => {
      const [hh, mm] = timeStr.split(':').map(Number)
      return hh * 60 + mm
    }

    const openMin = timeToMinutes(day.opensAt)
    const closeMin = timeToMinutes(day.closesAt)

    if (openMin >= closeMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O horário de fechamento deve ser depois do horário de abertura',
        path: ['closesAt'],
      })
    }

    const hasBreakStart = day.breakStartsAt !== undefined && day.breakStartsAt !== null && day.breakStartsAt !== ''
    const hasBreakEnd = day.breakEndsAt !== undefined && day.breakEndsAt !== null && day.breakEndsAt !== ''

    if (hasBreakStart !== hasBreakEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O horário de início e fim do intervalo devem ser definidos juntos',
        path: ['breakStartsAt'],
      })
      return
    }

    if (hasBreakStart && hasBreakEnd) {
      const breakStartMin = timeToMinutes(day.breakStartsAt!)
      const breakEndMin = timeToMinutes(day.breakEndsAt!)

      if (breakStartMin >= breakEndMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O fim do intervalo deve ser depois do início',
          path: ['breakEndsAt'],
        })
      }

      if (breakStartMin < openMin || breakEndMin > closeMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O intervalo deve estar contido no horário de funcionamento',
          path: ['breakStartsAt'],
        })
      }
    }
  })

export const step4WorkingHoursSchema = z.object({
  activeWeekdays: z.record(z.string(), z.boolean()),
  hours: z.record(z.string(), workingHourItemSchema),
})

export type Step4WorkingHoursInput = z.infer<typeof step4WorkingHoursSchema>
