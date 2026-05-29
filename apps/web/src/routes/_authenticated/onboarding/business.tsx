import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BusinessStepForm } from '#/modules/onboarding/components/business-step-form'

export const Route = createFileRoute('/_authenticated/onboarding/business')({
  component: BusinessRouteComponent,
})

function BusinessRouteComponent() {
  const navigate = useNavigate()

  return (
    <BusinessStepForm
      onSuccess={() => {
        navigate({ to: '/onboarding/professional' })
      }}
    />
  )
}
