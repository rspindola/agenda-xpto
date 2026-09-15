import { queryOptions } from '@tanstack/react-query'
import { servicesApi } from '../api/services-api'
import { servicesKeys } from '../query-keys'

export function servicesQueryOptions(establishmentId: string) {
  return queryOptions({
    queryKey: servicesKeys.lists(establishmentId),
    queryFn: () => servicesApi.getServices(establishmentId),
    enabled: !!establishmentId,
  })
}

export function serviceDetailQueryOptions(establishmentId: string, serviceId: string) {
  return queryOptions({
    queryKey: servicesKeys.detail(establishmentId, serviceId),
    queryFn: () => servicesApi.getService(establishmentId, serviceId),
    enabled: !!establishmentId && !!serviceId,
  })
}
