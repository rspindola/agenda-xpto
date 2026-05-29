import { queryOptions } from '@tanstack/react-query'
import { authApi } from '../api/auth-api'
import { authKeys, establishmentKeys } from '../query-keys'
import { establishmentsApi } from '#/modules/establishments/api/establishments-api'

export const sessionQueryOptions = queryOptions({
  queryKey: authKeys.session(),
  queryFn: () => authApi.getMe(),
  retry: false,
  staleTime: 60_000,
})

export const establishmentsQueryOptions = queryOptions({
  queryKey: establishmentKeys.list(),
  queryFn: () => establishmentsApi.list(),
  retry: false,
  staleTime: 30_000,
})
