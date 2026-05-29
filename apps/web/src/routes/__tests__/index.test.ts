import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { Route } from '../index'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  return {
    ...actual,
    redirect: vi.fn((opts) => opts),
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

describe('Index Route "/" (T16)', () => {
  it('should redirect guest user to /login', async () => {
    const qc = createMockQueryClient(null)
    const beforeLoad = (Route as any).options.beforeLoad

    try {
      await beforeLoad({ context: { queryClient: qc } })
      expect.fail('Should have redirected')
    } catch (err) {
      expect(err).toEqual({ to: '/login' })
    }
  })

  it('should redirect unverified user to /verify-email', async () => {
    const qc = createMockQueryClient({ user: { emailVerified: false } })
    const beforeLoad = (Route as any).options.beforeLoad

    try {
      await beforeLoad({ context: { queryClient: qc } })
      expect.fail('Should have redirected')
    } catch (err) {
      expect(err).toEqual({ to: '/verify-email' })
    }
  })

  it('should redirect onboarding-pending user to /onboarding/business', async () => {
    const qc = createMockQueryClient({ user: { emailVerified: true } }, [])
    const beforeLoad = (Route as any).options.beforeLoad

    try {
      await beforeLoad({ context: { queryClient: qc } })
      expect.fail('Should have redirected')
    } catch (err) {
      expect(err).toEqual({ to: '/onboarding/business' })
    }
  })

  it('should redirect completed onboarding user to /dashboard', async () => {
    const qc = createMockQueryClient({ user: { emailVerified: true } }, [{}])
    const beforeLoad = (Route as any).options.beforeLoad

    try {
      await beforeLoad({ context: { queryClient: qc } })
      expect.fail('Should have redirected')
    } catch (err) {
      expect(err).toEqual({ to: '/dashboard' })
    }
  })
})
