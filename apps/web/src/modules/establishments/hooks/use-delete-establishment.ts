import { useMutation, useQueryClient } from '@tanstack/react-query'
import { establishmentsApi } from '../api/establishments-api'
import { establishmentKeys } from '../query-keys'

export function useDeleteEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => establishmentsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: establishmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: establishmentKeys.list() })
    },
  })
}
