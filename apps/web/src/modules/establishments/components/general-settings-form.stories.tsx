import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GeneralSettingsForm } from './general-settings-form'

const mockEstablishment = {
  id: 'est_1',
  name: 'Barbearia Central',
  slug: 'barbearia-central',
  email: 'contato@barbearia.com',
  phone: '(11) 99999-9999',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: 'operacional@barbearia.com',
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const meta: Meta<typeof GeneralSettingsForm> = {
  title: 'Establishments/GeneralSettingsForm',
  component: GeneralSettingsForm,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof GeneralSettingsForm>

export const Default: Story = {
  render: () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-4xl mx-auto p-6 bg-zinc-950">
          <GeneralSettingsForm establishment={mockEstablishment} />
        </div>
      </QueryClientProvider>
    )
  },
}

export const InactiveEstablishment: Story = {
  render: () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-4xl mx-auto p-6 bg-zinc-950">
          <GeneralSettingsForm
            establishment={{
              ...mockEstablishment,
              isActive: false,
            }}
          />
        </div>
      </QueryClientProvider>
    )
  },
}
