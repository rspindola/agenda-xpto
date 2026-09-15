import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DangerZoneSection } from './danger-zone-section'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'
import { Button } from '#/components/ui/button'

const mockEstablishment = {
  id: 'est_1',
  name: 'Barbearia Central',
  slug: 'barbearia-central',
  email: 'contato@barbearia.com',
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

const meta: Meta<typeof DangerZoneSection> = {
  title: 'Establishments/DangerZone',
  component: DangerZoneSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DangerZoneSection>

export const DangerCard: Story = {
  render: () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-3xl mx-auto p-6 bg-zinc-950">
          <DangerZoneSection establishment={mockEstablishment} totalEstablishments={2} />
        </div>
      </QueryClientProvider>
    )
  },
}

export const SingleEstablishmentWarningDialog: StoryObj<typeof DeleteConfirmationDialog> = {
  render: () => {
    const [open, setOpen] = useState(true)
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <div className="p-10">
          <Button onClick={() => setOpen(true)}>Abrir Modal</Button>
          <DeleteConfirmationDialog
            open={open}
            onOpenChange={setOpen}
            establishment={mockEstablishment}
            totalEstablishments={1}
            onSuccess={() => alert('Estabelecimento excluído!')}
          />
        </div>
      </QueryClientProvider>
    )
  },
}
