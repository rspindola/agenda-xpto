import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ServiceInfoStep } from '#/modules/onboarding/components/service-info-step'

export const Route = createFileRoute('/_authenticated/onboarding/service')({
  component: ServiceRouteComponent,
})

function ServiceRouteComponent() {
  const navigate = useNavigate()

  return (
    <ServiceInfoStep
      onSuccess={() => {
        navigate({ to: '/onboarding/hours' })
      }}
    />
  )
}
