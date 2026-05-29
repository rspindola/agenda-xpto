import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProfessionalStepForm } from '#/modules/onboarding/components/professional-step-form'

export const Route = createFileRoute('/_authenticated/onboarding/professional')({
  component: ProfessionalRouteComponent,
})

function ProfessionalRouteComponent() {
  const navigate = useNavigate()

  const advance = () => {
    navigate({ to: '/onboarding/service' })
  }

  return <ProfessionalStepForm onSuccess={advance} onSkip={advance} />
}
