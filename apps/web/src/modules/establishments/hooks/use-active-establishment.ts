import { useStore } from '@tanstack/react-store'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { establishmentStore, setActiveEstablishmentId } from '../stores/establishment-store'
import { establishmentsQueryOptions } from '#/modules/auth/queries/session-queries'
import type { EstablishmentPublic } from '../api/establishments-api'

export type UseActiveEstablishmentReturn = {
  activeEstablishmentId: string | null
  activeEstablishment: EstablishmentPublic | null
  establishments: EstablishmentPublic[]
  isLoading: boolean
  error: Error | null
  setActiveEstablishmentId: (id: string | null) => void
}

export function useActiveEstablishment(): UseActiveEstablishmentReturn {
  const activeEstablishmentId = useStore(establishmentStore, (state) => state.activeEstablishmentId)
  const { data: establishments = [], isLoading, error } = useQuery(establishmentsQueryOptions)

  // Find active establishment in the list
  const activeEstablishment = useMemo(() => {
    if (!establishments.length) return null
    if (!activeEstablishmentId) return establishments[0]
    const found = establishments.find((e) => e.id === activeEstablishmentId)
    return found || establishments[0]
  }, [establishments, activeEstablishmentId])

  // Sync back to store if activeEstablishmentId is null or stale/invalid
  useEffect(() => {
    if (establishments.length > 0) {
      if (!activeEstablishmentId || !establishments.some((e) => e.id === activeEstablishmentId)) {
        setActiveEstablishmentId(establishments[0].id)
      }
    }
  }, [establishments, activeEstablishmentId])

  return {
    activeEstablishmentId: activeEstablishment?.id ?? activeEstablishmentId,
    activeEstablishment,
    establishments,
    isLoading,
    error,
    setActiveEstablishmentId,
  }
}
