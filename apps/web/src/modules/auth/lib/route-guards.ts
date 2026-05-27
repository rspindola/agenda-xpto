import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQueryOptions, establishmentsQueryOptions } from '../queries/session-queries'

export async function fetchSession(queryClient: QueryClient) {
  try {
    const data = await queryClient.ensureQueryData(sessionQueryOptions)
    return data.user
  } catch (error) {
    return null
  }
}

export async function fetchEstablishments(queryClient: QueryClient) {
  try {
    const data = await queryClient.ensureQueryData(establishmentsQueryOptions)
    return data
  } catch (error) {
    return []
  }
}

export async function resolvePostLoginPath(queryClient: QueryClient): Promise<string> {
  const user = await fetchSession(queryClient)
  if (!user) return '/login'

  if (!user.emailVerified) {
    return '/verify-email'
  }

  const establishments = await fetchEstablishments(queryClient)
  if (establishments.length === 0) {
    return '/onboarding/business'
  }

  return '/dashboard'
}

export async function ensureGuest(queryClient: QueryClient) {
  const user = await fetchSession(queryClient)
  if (user) {
    if (!user.emailVerified) {
      throw redirect({ to: '/verify-email' })
    }
    const establishments = await fetchEstablishments(queryClient)
    if (establishments.length === 0) {
      throw redirect({ to: '/onboarding/business' })
    }
    throw redirect({ to: '/dashboard' })
  }
}

export async function ensureSession(queryClient: QueryClient) {
  const user = await fetchSession(queryClient)
  if (!user) {
    throw redirect({ to: '/login' })
  }
  return user
}

export async function ensureEmailVerified(queryClient: QueryClient) {
  const user = await ensureSession(queryClient)
  if (!user.emailVerified) {
    throw redirect({ to: '/verify-email' })
  }
  return user
}

export async function ensureOnboardingPending(queryClient: QueryClient) {
  const user = await ensureEmailVerified(queryClient)
  const establishments = await fetchEstablishments(queryClient)
  if (establishments.length >= 1) {
    throw redirect({ to: '/dashboard' })
  }
  return user
}

export async function ensureOnboardingComplete(queryClient: QueryClient) {
  const user = await ensureEmailVerified(queryClient)
  const establishments = await fetchEstablishments(queryClient)
  if (establishments.length === 0) {
    throw redirect({ to: '/onboarding/business' })
  }
  return user
}
