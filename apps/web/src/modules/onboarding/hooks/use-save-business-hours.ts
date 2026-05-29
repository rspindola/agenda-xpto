import { useMutation } from '@tanstack/react-query'
import { onboardingApi } from '../api/onboarding-api'
import type { UpsertBusinessHourBody } from '../api/onboarding-api'

export function useSaveBusinessHours() {
  return useMutation({
    mutationFn: ({
      establishmentId,
      batch,
    }: {
      establishmentId: string
      batch: { weekday: string; body: UpsertBusinessHourBody }[]
    }) => {
      return onboardingApi.upsertBusinessHoursBatch(establishmentId, batch)
    },
  })
}
