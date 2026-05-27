import { describe, expect, it } from 'vitest'
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  businessStepSchema,
  professionalStepSchema,
  hoursStepSchema,
} from '../auth.schema'

describe('Auth Validation Schemas', () => {
  describe('signInSchema', () => {
    it('should validate valid inputs', () => {
      const result = signInSchema.safeParse({ email: 'test@example.com', password: 'password123' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = signInSchema.safeParse({ email: 'not-an-email', password: 'password123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('E-mail inválido')
      }
    })

    it('should reject short password', () => {
      const result = signInSchema.safeParse({ email: 'test@example.com', password: 'short' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A senha deve ter pelo menos 8 caracteres')
      }
    })
  })

  describe('signUpSchema', () => {
    it('should validate valid inputs', () => {
      const result = signUpSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject password mismatch', () => {
      const result = signUpSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('As senhas não coincidem')
      }
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' })
      expect(result.success).toBe(true)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('businessStepSchema', () => {
    it('should validate valid inputs', () => {
      const result = businessStepSchema.safeParse({
        name: 'Barbearia XPTO',
        timezone: 'America/Sao_Paulo',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('professionalStepSchema', () => {
    it('should validate optional fields', () => {
      const result = professionalStepSchema.safeParse({
        name: 'Calebe',
        email: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('hoursStepSchema', () => {
    it('should validate functioning days', () => {
      const result = hoursStepSchema.safeParse({
        hours: {
          MON: { closed: false, opensAt: '09:00', closesAt: '18:00' },
          TUE: { closed: true },
        },
      })
      expect(result.success).toBe(true)
    })

    it('should reject when closesAt <= opensAt', () => {
      const result = hoursStepSchema.safeParse({
        hours: {
          MON: { closed: false, opensAt: '18:00', closesAt: '09:00' },
        },
      })
      expect(result.success).toBe(false)
    })

    it('should reject when all days are closed', () => {
      const result = hoursStepSchema.safeParse({
        hours: {
          MON: { closed: true },
          TUE: { closed: true },
        },
      })
      expect(result.success).toBe(false)
    })
  })
})
