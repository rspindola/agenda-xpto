import { useMutation } from '@tanstack/react-query'
import { onboardingApi } from '../api/onboarding-api'
import type { CreateProfessionalBody } from '../api/onboarding-api'

export function useCreateProfessional() {
  return useMutation({
    mutationFn: ({
      establishmentId,
      body,
    }: {
      establishmentId: string
      body: CreateProfessionalBody
    }) => {
      return onboardingApi.createProfessional(establishmentId, body)
    },
  })
}
