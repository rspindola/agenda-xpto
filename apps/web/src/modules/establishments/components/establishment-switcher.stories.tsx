import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EstablishmentSwitcher } from './establishment-switcher'
import { authKeys } from '#/modules/auth/query-keys'
import { establishmentKeys } from '../query-keys'
import { setActiveEstablishmentId } from '../stores/establishment-store'

const mockEst1 = {
  id: 'est_1',
  name: 'Barbearia Central',
  slug: 'barbearia-central',
  email: 'central@barbearia.com',
  phone: '11999999999',
  address: 'Av. Paulista, 1000',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: null,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockEst2 = {
  ...mockEst1,
  id: 'est_2',
  name: 'Barbearia Jardins (Filial)',
  slug: 'barbearia-jardins',
}

const mockEst3 = {
  ...mockEst1,
  id: 'est_3',
  name: 'Studio Moema',
  slug: 'studio-moema',
}

function createStoryClient(plan: string, establishments = [mockEst1]) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  qc.setQueryData(authKeys.session(), {
    user: { id: 'u1', email: 'owner@example.com', name: 'Renato Castro', plan },
  })
  qc.setQueryData(establishmentKeys.list(), establishments)
  setActiveEstablishmentId(establishments[0].id)
  return qc
}

const meta: Meta<typeof EstablishmentSwitcher> = {
  title: 'Establishments/EstablishmentSwitcher',
  component: EstablishmentSwitcher,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof EstablishmentSwitcher>

export const StarterPlan: Story = {
  render: () => {
    const queryClient = createStoryClient('starter', [mockEst1])
    return (
      <QueryClientProvider client={queryClient}>
        <div className="p-10 bg-zinc-950 flex justify-center">
          <EstablishmentSwitcher />
        </div>
      </QueryClientProvider>
    )
  },
}

export const ProPlanWithMultiple: Story = {
  render: () => {
    const queryClient = createStoryClient('pro', [mockEst1, mockEst2])
    return (
      <QueryClientProvider client={queryClient}>
        <div className="p-10 bg-zinc-950 flex justify-center">
          <EstablishmentSwitcher onOpenCreate={() => alert('Abrir Modal de Criação')} />
        </div>
      </QueryClientProvider>
    )
  },
}

export const ProPlanAtLimit: Story = {
  render: () => {
    const queryClient = createStoryClient('pro', [mockEst1, mockEst2, mockEst3])
    return (
      <QueryClientProvider client={queryClient}>
        <div className="p-10 bg-zinc-950 flex justify-center">
          <EstablishmentSwitcher onOpenCreate={() => alert('Abrir Modal de Criação')} />
        </div>
      </QueryClientProvider>
    )
  },
}
