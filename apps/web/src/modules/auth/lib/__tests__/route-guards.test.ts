import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { isRedirect } from '@tanstack/react-router'
import {
  ensureGuest,
  ensureSession,
  ensureEmailVerified,
  ensureOnboardingPending,
  ensureOnboardingComplete,
} from '../route-guards'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    redirect: vi.fn((opts) => opts),
    isRedirect: vi.fn((err) => err && typeof err === 'object' && 'to' in err),
  }
})

function createMockQueryClient(sessionData: any, establishmentData: any = []) {
  const queryClient = new QueryClient()
  queryClient.ensureQueryData = vi.fn().mockImplementation((options) => {
    if (options.queryKey.includes('session')) {
      if (!sessionData) throw new Error('Unauthorized')
      return Promise.resolve(sessionData)
    }
    if (options.queryKey.includes('establishments')) {
      return Promise.resolve(establishmentData)
    }
    return Promise.resolve(null)
  })
  return queryClient
}

describe('Route Guards', () => {
  describe('ensureGuest', () => {
    it('should allow guest if no session', async () => {
      const qc = createMockQueryClient(null)
      await expect(ensureGuest(qc)).resolves.toBeUndefined()
    })

    it('should redirect verified user to dashboard', async () => {
      const qc = createMockQueryClient({ user: { emailVerified: true } }, [{}])
      try {
        await ensureGuest(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/dashboard' })
      }
    })

    it('should redirect unverified user to verify-email', async () => {
      const qc = createMockQueryClient({ user: { emailVerified: false } })
      try {
        await ensureGuest(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/verify-email' })
      }
    })
  })

  describe('ensureSession', () => {
    it('should redirect to login if no session', async () => {
      const qc = createMockQueryClient(null)
      try {
        await ensureSession(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/login' })
      }
    })

    it('should return user if session exists', async () => {
      const user = { email: 'test@example.com' }
      const qc = createMockQueryClient({ user })
      const result = await ensureSession(qc)
      expect(result).toEqual(user)
    })
  })

  describe('ensureEmailVerified', () => {
    it('should redirect to verify-email if not verified', async () => {
      const qc = createMockQueryClient({ user: { emailVerified: false } })
      try {
        await ensureEmailVerified(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/verify-email' })
      }
    })

    it('should allow verified users', async () => {
      const user = { emailVerified: true }
      const qc = createMockQueryClient({ user })
      const result = await ensureEmailVerified(qc)
      expect(result).toEqual(user)
    })
  })

  describe('ensureOnboardingPending', () => {
    it('should redirect to dashboard if establishments exist', async () => {
      const qc = createMockQueryClient({ user: { emailVerified: true } }, [{}])
      try {
        await ensureOnboardingPending(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/dashboard' })
      }
    })

    it('should allow onboarding if no establishments', async () => {
      const user = { emailVerified: true }
      const qc = createMockQueryClient({ user }, [])
      const result = await ensureOnboardingPending(qc)
      expect(result).toEqual(user)
    })
  })

  describe('ensureOnboardingComplete', () => {
    it('should redirect to onboarding if no establishments', async () => {
      const qc = createMockQueryClient({ user: { emailVerified: true } }, [])
      try {
        await ensureOnboardingComplete(qc)
        expect.fail('Should have thrown redirect')
      } catch (err) {
        expect(err).toEqual({ to: '/onboarding/business' })
      }
    })

    it('should allow dashboard access if establishments exist', async () => {
      const user = { emailVerified: true }
      const qc = createMockQueryClient({ user }, [{}])
      const result = await ensureOnboardingComplete(qc)
      expect(result).toEqual(user)
    })
  })
})
