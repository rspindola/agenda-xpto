import { Store } from '@tanstack/store'

export const ESTABLISHMENT_STORAGE_KEY = 'agenda_xpto_active_establishment_id'

export type EstablishmentStoreState = {
  activeEstablishmentId: string | null
}

const getInitialActiveId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(ESTABLISHMENT_STORAGE_KEY)
  } catch {
    return null
  }
}

export const establishmentStore = new Store<EstablishmentStoreState>({
  activeEstablishmentId: getInitialActiveId(),
})

export function setActiveEstablishmentId(id: string | null): void {
  establishmentStore.setState((state) => ({
    ...state,
    activeEstablishmentId: id,
  }))
  if (typeof window !== 'undefined') {
    try {
      if (id) {
        localStorage.setItem(ESTABLISHMENT_STORAGE_KEY, id)
      } else {
        localStorage.removeItem(ESTABLISHMENT_STORAGE_KEY)
      }
    } catch {
      // Ignore localStorage errors
    }
  }
}

export function resetEstablishmentStore(): void {
  setActiveEstablishmentId(null)
}
