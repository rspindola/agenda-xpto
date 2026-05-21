import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '#/modules/auth/schemas/auth.schema'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct inputs', () => {
      const valid = { email: 'test@example.com', password: 'password123' }
      const parsed = loginSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalid = { email: 'not-an-email', password: 'password123' }
      const parsed = loginSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toBe('E-mail inválido')
      }
    })

    it('should reject short password', () => {
      const invalid = { email: 'test@example.com', password: 'short' }
      const parsed = loginSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toBe(
          'A senha deve ter pelo menos 8 caracteres',
        )
      }
    })
  })

  describe('signUpSchema', () => {
    it('should validate correct inputs', () => {
      const valid = {
        name: 'Jane Doe',
        email: 'test@example.com',
        password: 'password123',
      }
      const parsed = signUpSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalid = {
        name: '',
        email: 'test@example.com',
        password: 'password123',
      }
      const parsed = signUpSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toBe('O nome é obrigatório')
      }
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const parsed = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      })
      expect(parsed.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const parsed = forgotPasswordSchema.safeParse({ email: 'invalid' })
      expect(parsed.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const valid = {
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }
      const parsed = resetPasswordSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const invalid = {
        password: 'newpassword123',
        confirmPassword: 'different123',
      }
      const parsed = resetPasswordSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toBe('As senhas não coincidem')
      }
    })
  })
})
