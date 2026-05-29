import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { OnboardingDoneSummary } from '#/modules/onboarding/components/onboarding-done-summary'

export const Route = createFileRoute('/_authenticated/onboarding/done')({
  component: DoneRouteComponent,
})

function DoneRouteComponent() {
  const navigate = useNavigate()

  return (
    <OnboardingDoneSummary
      onSuccess={() => {
        navigate({ to: '/dashboard' })
      }}
    />
  )
}
