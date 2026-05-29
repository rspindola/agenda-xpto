import { useMutation, useQueryClient } from '@tanstack/react-query'
import { establishmentsApi } from '#/modules/establishments/api/establishments-api'
import type { CreateEstablishmentBody } from '#/modules/establishments/api/establishments-api'
import { establishmentKeys } from '#/modules/auth/query-keys'

export function useCreateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateEstablishmentBody) => {
      return establishmentsApi.create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establishmentKeys.list() })
    },
  })
}
