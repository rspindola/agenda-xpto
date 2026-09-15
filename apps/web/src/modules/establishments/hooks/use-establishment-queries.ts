import { queryOptions, useQuery } from '@tanstack/react-query'
import { establishmentKeys } from '../query-keys'
import { establishmentsApi } from '../api/establishments-api'

export const establishmentDetailQueryOptions = (id: string | null | undefined) =>
  queryOptions({
    queryKey: establishmentKeys.detail(id),
    queryFn: () => (id ? establishmentsApi.getById(id) : null),
    enabled: Boolean(id),
    staleTime: 30_000,
  })

export const establishmentProfessionalsQueryOptions = (id: string | null | undefined) =>
  queryOptions({
    queryKey: establishmentKeys.professionals(id),
    queryFn: () => (id ? establishmentsApi.getProfessionals(id) : []),
    enabled: Boolean(id),
    staleTime: 30_000,
  })

export const establishmentServicesQueryOptions = (id: string | null | undefined) =>
  queryOptions({
    queryKey: establishmentKeys.services(id),
    queryFn: () => (id ? establishmentsApi.getServices(id) : []),
    enabled: Boolean(id),
    staleTime: 30_000,
  })

export const establishmentHoursQueryOptions = (id: string | null | undefined) =>
  queryOptions({
    queryKey: establishmentKeys.hours(id),
    queryFn: () => (id ? establishmentsApi.getBusinessHours(id) : []),
    enabled: Boolean(id),
    staleTime: 30_000,
  })

export function useEstablishmentDetail(id: string | null | undefined) {
  return useQuery(establishmentDetailQueryOptions(id))
}

export function useEstablishmentProfessionals(id: string | null | undefined) {
  return useQuery(establishmentProfessionalsQueryOptions(id))
}

export function useEstablishmentServices(id: string | null | undefined) {
  return useQuery(establishmentServicesQueryOptions(id))
}

export function useEstablishmentHours(id: string | null | undefined) {
  return useQuery(establishmentHoursQueryOptions(id))
}
