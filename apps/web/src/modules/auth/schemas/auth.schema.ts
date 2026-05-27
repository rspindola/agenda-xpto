import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
})

export type SignInInput = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório').max(200, 'O nome deve ter no máximo 200 caracteres'),
    email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(128, 'A senha deve ter no máximo 128 caracteres'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(128, 'A senha deve ter no máximo 128 caracteres'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const businessStepSchema = z.object({
  name: z.string().min(1, 'O nome do estabelecimento é obrigatório').max(200),
  timezone: z.string().min(1, 'O fuso horário é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type BusinessStepInput = z.infer<typeof businessStepSchema>

export const professionalStepSchema = z.object({
  name: z.string().min(1, 'O nome do profissional é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
})

export type ProfessionalStepInput = z.infer<typeof professionalStepSchema>

const hourFormat = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido')

const dailyHoursSchema = z
  .object({
    closed: z.boolean(),
    opensAt: z.string().optional().or(z.literal('')),
    closesAt: z.string().optional().or(z.literal('')),
    breakStartsAt: z.string().optional().or(z.literal('')).nullable(),
    breakEndsAt: z.string().optional().or(z.literal('')).nullable(),
  })
  .refine(
    (data) => {
      if (data.closed) return true
      return !!data.opensAt && !!data.closesAt
    },
    {
      message: 'Horários de abertura e fechamento são obrigatórios',
      path: ['opensAt'],
    }
  )
  .refine(
    (data) => {
      if (data.closed || !data.opensAt || !data.closesAt) return true
      return data.closesAt > data.opensAt
    },
    {
      message: 'O horário de fechamento deve ser após o de abertura',
      path: ['closesAt'],
    }
  )

export const hoursStepSchema = z
  .object({
    hours: z.record(z.string(), dailyHoursSchema),
  })
  .refine(
    (data) => {
      const openDays = Object.values(data.hours).filter((day) => !day.closed)
      return openDays.length > 0
    },
    {
      message: 'Selecione pelo menos um dia de funcionamento',
      path: ['hours'],
    }
  )

export type HoursStepInput = z.infer<typeof hoursStepSchema>
