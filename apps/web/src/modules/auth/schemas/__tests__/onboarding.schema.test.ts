import { describe, expect, it } from 'vitest'
import {
  step1BusinessSchema,
  step2ProfessionalSchema,
  step3ServiceSchema,
  step4WorkingHoursSchema,
} from '#/modules/auth/schemas/onboarding.schema'

describe('Onboarding Validation Schemas', () => {
  describe('step1BusinessSchema', () => {
    it('should validate correct inputs', () => {
      const valid = {
        name: 'Saloes XPTO',
        slug: 'saloes-xpto',
        email: 'contato@saloesxpto.com',
        timezone: 'America/Sao_Paulo',
        minAdvanceMinutes: 60,
      }
      const parsed = step1BusinessSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should reject invalid slug format', () => {
      const invalid = {
        name: 'Saloes XPTO',
        slug: 'Saloes_XPTO',
        email: 'contato@saloesxpto.com',
        timezone: 'America/Sao_Paulo',
      }
      const parsed = step1BusinessSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })
  })

  describe('step2ProfessionalSchema', () => {
    it('should validate correct inputs', () => {
      const valid = {
        name: 'Dr. John Doe',
        email: 'john@example.com',
        phone: '+5511999999999',
      }
      const parsed = step2ProfessionalSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should allow optional email and phone', () => {
      const valid = { name: 'Dr. John Doe' }
      const parsed = step2ProfessionalSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })
  })

  describe('step3ServiceSchema', () => {
    it('should validate correct inputs', () => {
      const valid = {
        name: 'Corte de Cabelo',
        durationMinutes: 30,
        priceCents: 5000,
      }
      const parsed = step3ServiceSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should require durationMinutes', () => {
      const invalid = { name: 'Corte de Cabelo' }
      const parsed = step3ServiceSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })
  })

  describe('step4WorkingHoursSchema', () => {
    it('should validate correct hours structure', () => {
      const valid = {
        activeWeekdays: { MON: true, TUE: true },
        hours: {
          MON: { opensAt: '09:00', closesAt: '18:00', closed: false },
          TUE: { opensAt: '09:00', closesAt: '18:00', closed: false },
        },
      }
      const parsed = step4WorkingHoursSchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it('should reject opensAt after closesAt', () => {
      const invalid = {
        activeWeekdays: { MON: true },
        hours: {
          MON: { opensAt: '18:00', closesAt: '09:00', closed: false },
        },
      }
      const parsed = step4WorkingHoursSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })
  })
})
