import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ensureEmailVerified, fetchEstablishments } from '#/modules/auth/lib/route-guards'
import { OnboardingLayout } from '#/components/layouts/onboarding-layout'

export const Route = createFileRoute('/_authenticated/onboarding')({
  beforeLoad: async ({ context, location }) => {
    // 1. Ensure logged in and email verified
    await ensureEmailVerified(context.queryClient)

    // 2. Fetch establishments
    const establishments = await fetchEstablishments(context.queryClient)

    // 3. If no establishment is created yet, force redirect to step 1 (/onboarding/business)
    if (establishments.length === 0 && location.pathname !== '/onboarding/business') {
      throw redirect({ to: '/onboarding/business' })
    }

    // 4. If they already have an establishment, and are trying to access the root /onboarding
    // or re-visit step 1 (/onboarding/business), redirect them to dashboard (since step 1 is done).
    if (
      establishments.length >= 1 &&
      (location.pathname === '/onboarding' || location.pathname === '/onboarding/business' || location.pathname === '/onboarding/')
    ) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: OnboardingLayoutComponent,
})

function OnboardingLayoutComponent() {
  return (
    <OnboardingLayout>
      <Outlet />
    </OnboardingLayout>
  )
}
