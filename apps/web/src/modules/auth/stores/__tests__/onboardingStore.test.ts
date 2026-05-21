import { beforeEach, describe, expect, it } from 'vitest'
import {
  onboardingStore,
  onboardingActions,
} from '#/modules/auth/stores/onboardingStore'

describe('Onboarding TanStack Store', () => {
  beforeEach(() => {
    localStorage.clear()
    onboardingActions.resetOnboarding()
  })

  it('should initialize with default state', () => {
    const state = onboardingStore.state
    expect(state.currentStep).toBe(1)
    expect(state.establishmentId).toBeNull()
    expect(state.professionalId).toBeNull()
    expect(state.serviceId).toBeNull()
    expect(state.step1).toBeNull()
    expect(state.step2).toBeNull()
    expect(state.step3).toBeNull()
    expect(state.step4).toBeNull()
    expect(state.completedSteps).toEqual([])
    expect(state.skippedSteps).toEqual([])
  })

  it('should set current step', () => {
    onboardingActions.setStep(3)
    expect(onboardingStore.state.currentStep).toBe(3)
  })

  it('should save Step 1 (Business Setup) data and establishmentId', () => {
    const step1Data = {
      name: 'Salão Beleza Pura',
      email: 'contato@belezapura.com',
      phone: '11999999999',
      timezone: 'America/Sao_Paulo',
      minAdvanceMinutes: 30,
    }
    const estId = 'est_123456'

    onboardingActions.saveStep1(step1Data, estId)

    const state = onboardingStore.state
    expect(state.step1).toEqual(step1Data)
    expect(state.establishmentId).toBe(estId)
    expect(state.completedSteps).toContain(1)
  })

  it('should save Step 2 (Professional Setup) data and professionalId', () => {
    const step2Data = {
      name: 'Maria Silva',
      email: 'maria@belezapura.com',
      phone: '11988888888',
    }
    const profId = 'prof_789'

    onboardingActions.saveStep2(step2Data, profId)

    const state = onboardingStore.state
    expect(state.step2).toEqual(step2Data)
    expect(state.professionalId).toBe(profId)
    expect(state.completedSteps).toContain(2)
  })

  it('should save Step 3 (Service Setup) data and serviceId', () => {
    const step3Data = {
      name: 'Corte de Cabelo Feminino',
      durationMinutes: 45,
      priceCents: 8000,
    }
    const servId = 'serv_abc'

    onboardingActions.saveStep3(step3Data, servId)

    const state = onboardingStore.state
    expect(state.step3).toEqual(step3Data)
    expect(state.serviceId).toBe(servId)
    expect(state.completedSteps).toContain(3)
  })

  it('should save Step 4 (Working Hours Setup) data', () => {
    const step4Data = {
      activeWeekdays: { MON: true, TUE: true },
      hours: {
        MON: { opensAt: '09:00', closesAt: '18:00', closed: false },
        TUE: { opensAt: '09:00', closesAt: '18:00', closed: false },
      },
    }

    onboardingActions.saveStep4(step4Data)

    const state = onboardingStore.state
    expect(state.step4).toEqual(step4Data)
    expect(state.completedSteps).toContain(4)
  })

  it('should skip step', () => {
    onboardingActions.skipStep(2)
    expect(onboardingStore.state.skippedSteps).toContain(2)
  })

  it('should persist state to localStorage on updates', () => {
    const step1Data = {
      name: 'Salão Beleza Pura',
      email: 'contato@belezapura.com',
      phone: '11999999999',
      timezone: 'America/Sao_Paulo',
      minAdvanceMinutes: 30,
    }
    onboardingActions.saveStep1(step1Data, 'est_xyz')

    const saved = localStorage.getItem('agenda-xpto-onboarding-progress')
    expect(saved).not.toBeNull()

    const parsed = JSON.parse(saved!)
    expect(parsed.establishmentId).toBe('est_xyz')
    expect(parsed.step1).toEqual(step1Data)
  })
})
