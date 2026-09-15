import { queryOptions } from '@tanstack/react-query'
import { professionalsApi } from '../api/professionals-api'
import { professionalsKeys } from '../query-keys'

export function professionalsQueryOptions(establishmentId: string) {
  return queryOptions({
    queryKey: professionalsKeys.lists(establishmentId),
    queryFn: () => professionalsApi.getProfessionals(establishmentId),
    enabled: !!establishmentId,
  })
}

export function professionalDetailQueryOptions(establishmentId: string, professionalId: string) {
  return queryOptions({
    queryKey: professionalsKeys.detail(establishmentId, professionalId),
    queryFn: () => professionalsApi.getProfessional(establishmentId, professionalId),
    enabled: !!establishmentId && !!professionalId,
  })
}
