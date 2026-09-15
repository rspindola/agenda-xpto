import { describe, expect, it } from 'vitest'
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
} from '../schemas/establishment.schema'

describe('Establishment Schemas (T1)', () => {
  describe('createEstablishmentSchema', () => {
    it('should validate valid creation payload', () => {
      const validPayload = {
        name: 'Barbearia Premium',
        slug: 'barbearia-premium',
        email: 'contato@barbeariapremium.com',
        phone: '11999999999',
        address: 'Rua das Flores, 123',
        timezone: 'America/Sao_Paulo',
        minAdvanceMinutes: 60,
        isActive: true,
        operationalEmail: 'operacional@barbeariapremium.com',
      }

      const result = createEstablishmentSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('should accept optional fields as empty strings or omitted', () => {
      const minimalPayload = {
        name: 'Studio Beleza',
        email: 'studio@beleza.com',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(minimalPayload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
      }
    })

    it('should reject short or empty name', () => {
      const invalidPayload = {
        name: 'A',
        email: 'teste@email.com',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('should reject invalid email', () => {
      const invalidPayload = {
        name: 'Studio Beleza',
        email: 'not-an-email',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('should reject invalid slug with spaces or special characters', () => {
      const invalidPayload = {
        name: 'Studio Beleza',
        slug: 'Studio Beleza!',
        email: 'studio@beleza.com',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('slug')
      }
    })

    it('should accept valid slug with lowercase alphanumeric and hyphens', () => {
      const validPayload = {
        name: 'Studio Beleza',
        slug: 'studio-beleza-123',
        email: 'studio@beleza.com',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('should accept empty string slug (for auto-generation on backend)', () => {
      const validPayload = {
        name: 'Studio Beleza',
        slug: '',
        email: 'studio@beleza.com',
        timezone: 'America/Sao_Paulo',
      }

      const result = createEstablishmentSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })
  })

  describe('updateEstablishmentSchema', () => {
    it('should validate partial updates', () => {
      const partialPayload = {
        name: 'Barbearia VIP Atualizada',
        isActive: false,
      }

      const result = updateEstablishmentSchema.safeParse(partialPayload)
      expect(result.success).toBe(true)
    })

    it('should validate changing minAdvanceMinutes', () => {
      const partialPayload = {
        minAdvanceMinutes: 120,
      }

      const result = updateEstablishmentSchema.safeParse(partialPayload)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email in update', () => {
      const invalidPayload = {
        email: 'invalid-email',
      }

      const result = updateEstablishmentSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })
  })
})
