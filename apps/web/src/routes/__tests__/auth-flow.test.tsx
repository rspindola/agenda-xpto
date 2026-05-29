import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { resolvePostLoginPath } from '#/modules/auth/lib/route-guards'
import { authKeys, establishmentKeys } from '#/modules/auth/query-keys'

describe('Auth & Onboarding End-to-End Flow Scenarios (T23)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('Scenario 1: Guest User redirect flow', async () => {
    // 1. Session query throws error (Guest)
    queryClient.setQueryData(authKeys.session(), null)
    
    // Resolve post login path should direct to /login
    const target = await resolvePostLoginPath(queryClient)
    expect(target).toBe('/login')
  })

  it('Scenario 2: Registered but Unverified User flow', async () => {
    // 1. Session exists but emailVerified is false
    queryClient.setQueryData(authKeys.session(), {
      user: {
        id: 'user_123',
        email: 'owner@example.com',
        emailVerified: false,
        name: 'New Owner',
      },
    })

    // Resolve post login path should direct to /verify-email
    const target = await resolvePostLoginPath(queryClient)
    expect(target).toBe('/verify-email')
  })

  it('Scenario 3: Verified User but Onboarding Pending flow', async () => {
    // 1. Session is verified
    queryClient.setQueryData(authKeys.session(), {
      user: {
        id: 'user_123',
        email: 'owner@example.com',
        emailVerified: true,
        name: 'Verified Owner',
      },
    })
    // 2. Establishments query returns empty list
    queryClient.setQueryData(establishmentKeys.list(), [])

    // Resolve post login path should force redirect to step 1 /onboarding/business
    const target = await resolvePostLoginPath(queryClient)
    expect(target).toBe('/onboarding/business')
  })

  it('Scenario 4: Already Onboarded Owner direct visit flow', async () => {
    // 1. Session is verified
    queryClient.setQueryData(authKeys.session(), {
      user: {
        id: 'user_123',
        email: 'owner@example.com',
        emailVerified: true,
        name: 'Onboarded Owner',
      },
    })
    // 2. Establishments query returns active company
    queryClient.setQueryData(establishmentKeys.list(), [
      {
        id: 'est_123',
        name: 'Robson Hair',
        slug: 'robson-hair',
        email: 'robson@hair.com',
        timezone: 'America/Sao_Paulo',
      },
    ])

    // Resolve post login path should direct directly to /dashboard
    const target = await resolvePostLoginPath(queryClient)
    expect(target).toBe('/dashboard')
  })
})
