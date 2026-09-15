import { useMutation, useQueryClient } from '@tanstack/react-query'
import { establishmentsApi } from '../api/establishments-api'
import type { CreateEstablishmentBody } from '../api/establishments-api'
import { establishmentKeys } from '../query-keys'
import { setActiveEstablishmentId } from '../stores/establishment-store'

export function useCreateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateEstablishmentBody) => establishmentsApi.create(body),
    onSuccess: (data) => {
      queryClient.setQueryData(establishmentKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: establishmentKeys.list() })
      setActiveEstablishmentId(data.id)
    },
  })
}
