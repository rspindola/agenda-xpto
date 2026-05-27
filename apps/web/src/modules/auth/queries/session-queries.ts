import { queryOptions } from '@tanstack/react-query'
import { authApi } from '../api/auth-api'
import { authKeys, establishmentKeys } from '../query-keys'
import { api } from '#/lib/axios'

export const sessionQueryOptions = queryOptions({
  queryKey: authKeys.session(),
  queryFn: () => authApi.getMe(),
  retry: false,
  staleTime: 60_000,
})

export const establishmentsQueryOptions = queryOptions({
  queryKey: establishmentKeys.list(),
  queryFn: async () => {
    const { data } = await api.get<any[]>('/api/v1/establishments')
    return data
  },
  retry: false,
  staleTime: 30_000,
})
