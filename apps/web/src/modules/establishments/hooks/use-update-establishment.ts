import { useMutation, useQueryClient } from '@tanstack/react-query'
import { establishmentsApi } from '../api/establishments-api'
import type { UpdateEstablishmentBody } from '../api/establishments-api'
import { establishmentKeys } from '../query-keys'

export type UpdateEstablishmentVariables = {
  id: string
  body: UpdateEstablishmentBody
}

export function useUpdateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: UpdateEstablishmentVariables) => establishmentsApi.update(id, body),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(establishmentKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: establishmentKeys.list() })
      queryClient.invalidateQueries({ queryKey: establishmentKeys.detail(id) })
    },
  })
}
