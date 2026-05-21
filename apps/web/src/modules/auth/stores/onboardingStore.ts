import { Store } from '@tanstack/store'

export type Step1Data = {
  name: string
  slug?: string
  email: string
  phone?: string
  address?: string
  timezone: string
  minAdvanceMinutes: number
}

export type Step2Data = {
  name: string
  email?: string
  phone?: string
}

export type Step3Data = {
  name: string
  durationMinutes: number
  priceCents?: number
}

export type Step4Data = {
  activeWeekdays: Record<string, boolean>
  hours: Record<
    string,
    {
      opensAt?: string
      closesAt?: string
      closed: boolean
      breakStartsAt?: string | null
      breakEndsAt?: string | null
    }
  >
}

export type OnboardingState = {
  // Wizard Progress
  currentStep: number
  establishmentId: string | null
  professionalId: string | null
  serviceId: string | null

  // Step Data Cache (Autosaved)
  step1: Step1Data | null
  step2: Step2Data | null
  step3: Step3Data | null
  step4: Step4Data | null

  // Status
  completedSteps: number[]
  skippedSteps: number[]
}

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
  establishmentId: null,
  professionalId: null,
  serviceId: null,
  step1: null,
  step2: null,
  step3: null,
  step4: null,
  completedSteps: [],
  skippedSteps: [],
}

const LOCAL_STORAGE_KEY = 'agenda-xpto-onboarding-progress'

const loadInitialState = (): OnboardingState => {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_STATE
  } catch (error) {
    console.error('Failed to load onboarding state from localStorage:', error)
    return DEFAULT_STATE
  }
}

export const onboardingStore = new Store<OnboardingState>(loadInitialState())

// Subscribe to store updates to sync to LocalStorage
if (typeof window !== 'undefined') {
  onboardingStore.subscribe((state) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save onboarding state to localStorage:', error)
    }
  })
}

// Actions
export const onboardingActions = {
  setStep: (step: number) => {
    onboardingStore.setState((state) => ({ ...state, currentStep: step }))
  },

  saveStep1: (data: Step1Data, establishmentId: string) => {
    onboardingStore.setState((state) => ({
      ...state,
      step1: data,
      establishmentId,
      completedSteps: Array.from(new Set([...state.completedSteps, 1])),
    }))
  },

  saveStep2: (data: Step2Data, professionalId: string) => {
    onboardingStore.setState((state) => ({
      ...state,
      step2: data,
      professionalId,
      completedSteps: Array.from(new Set([...state.completedSteps, 2])),
    }))
  },

  saveStep3: (data: Step3Data, serviceId: string) => {
    onboardingStore.setState((state) => ({
      ...state,
      step3: data,
      serviceId,
      completedSteps: Array.from(new Set([...state.completedSteps, 3])),
    }))
  },

  saveStep4: (data: Step4Data) => {
    onboardingStore.setState((state) => ({
      ...state,
      step4: data,
      completedSteps: Array.from(new Set([...state.completedSteps, 4])),
    }))
  },

  skipStep: (step: number) => {
    onboardingStore.setState((state) => ({
      ...state,
      skippedSteps: Array.from(new Set([...state.skippedSteps, step])),
    }))
  },

  resetOnboarding: () => {
    onboardingStore.setState(() => DEFAULT_STATE)
  },
}
