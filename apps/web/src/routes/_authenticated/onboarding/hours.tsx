import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HoursStepForm } from '#/modules/onboarding/components/hours-step-form'

export const Route = createFileRoute('/_authenticated/onboarding/hours')({
  component: HoursRouteComponent,
})

function HoursRouteComponent() {
  const navigate = useNavigate()

  const advance = () => {
    navigate({ to: '/onboarding/done' })
  }

  return <HoursStepForm onSuccess={advance} onSkip={advance} />
}
