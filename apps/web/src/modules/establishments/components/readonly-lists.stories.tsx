import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HoursReadonlySummary } from './hours-readonly-summary'
import { ProfessionalsReadonlyList } from './professionals-readonly-list'
import { ServicesReadonlyList } from './services-readonly-list'
import { establishmentKeys } from '../query-keys'

const mockHours = [
  { weekday: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { weekday: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { weekday: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { weekday: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { weekday: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { weekday: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
  { weekday: 0, isOpen: false, openTime: null, closeTime: null },
]

const mockProfessionals = [
  { id: 'p1', name: 'Carlos Barbeiro', email: 'carlos@salao.com', phone: '11999991111', isActive: true },
  { id: 'p2', name: 'Mariana Cabeleireira', email: 'mariana@salao.com', phone: '11999992222', isActive: true },
]

const mockServices = [
  { id: 's1', name: 'Corte Degradê', durationMinutes: 45, priceCents: 6000, isActive: true },
  { id: 's2', name: 'Barba Terapia', durationMinutes: 30, priceCents: 4500, isActive: true },
]

const meta: Meta = {
  title: 'Establishments/ReadonlySummaries',
  parameters: { layout: 'padded' },
}

export default meta

export const HoursPopulated: StoryObj = {
  render: () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(establishmentKeys.hours('est_1'), mockHours)
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl mx-auto p-6 bg-zinc-950">
          <HoursReadonlySummary establishmentId="est_1" />
        </div>
      </QueryClientProvider>
    )
  },
}

export const HoursEmpty: StoryObj = {
  render: () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(establishmentKeys.hours('est_empty'), [])
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl mx-auto p-6 bg-zinc-950">
          <HoursReadonlySummary establishmentId="est_empty" />
        </div>
      </QueryClientProvider>
    )
  },
}

export const ProfessionalsPopulated: StoryObj = {
  render: () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(establishmentKeys.professionals('est_1'), mockProfessionals)
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl mx-auto p-6 bg-zinc-950">
          <ProfessionalsReadonlyList establishmentId="est_1" />
        </div>
      </QueryClientProvider>
    )
  },
}

export const ServicesPopulated: StoryObj = {
  render: () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(establishmentKeys.services('est_1'), mockServices)
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl mx-auto p-6 bg-zinc-950">
          <ServicesReadonlyList establishmentId="est_1" />
        </div>
      </QueryClientProvider>
    )
  },
}
