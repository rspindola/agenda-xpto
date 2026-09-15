import type { Meta, StoryObj } from '@storybook/react'
import { ProfessionalCard } from './professional-card'

const meta: Meta<typeof ProfessionalCard> = {
  title: 'Modules/Professionals/ProfessionalCard',
  component: ProfessionalCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    professional: {
      id: 'pro-1',
      establishmentId: 'est-1',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      createdAt: new Date().toISOString(),
    },
    onEdit: (p) => alert(`Edit ${p.name}`),
    onDelete: (p) => alert(`Delete ${p.name}`),
  }
}

export default meta
type Story = StoryObj<typeof ProfessionalCard>

export const Default: Story = {}

export const NoContactInfo: Story = {
  args: {
    professional: {
      id: 'pro-2',
      establishmentId: 'est-1',
      name: 'Maria Souza',
      email: null,
      phone: null,
      createdAt: new Date().toISOString(),
    }
  }
}
