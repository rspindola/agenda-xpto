import type { Meta, StoryObj } from '@storybook/react'
import { ServiceCard } from './service-card'

const meta: Meta<typeof ServiceCard> = {
  title: 'Modules/Services/ServiceCard',
  component: ServiceCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    service: {
      id: 'srv-1',
      establishmentId: 'est-1',
      name: 'Corte de Cabelo',
      description: 'Corte completo com lavagem',
      durationMinutes: 45,
      priceCents: 6500,
      catalogCombo: false,
      createdAt: new Date().toISOString(),
    },
    onEdit: (s) => alert(`Edit ${s.name}`),
    onDelete: (s) => alert(`Delete ${s.name}`),
  }
}

export default meta
type Story = StoryObj<typeof ServiceCard>

export const Default: Story = {}

export const CatalogCombo: Story = {
  args: {
    service: {
      id: 'srv-2',
      establishmentId: 'est-1',
      name: 'Combo Cabelo + Barba',
      description: 'Pacote completo',
      durationMinutes: 90,
      priceCents: 12000,
      catalogCombo: true,
      createdAt: new Date().toISOString(),
    }
  }
}
