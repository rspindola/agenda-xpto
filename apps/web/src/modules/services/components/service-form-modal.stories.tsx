import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ServiceFormModal } from './service-form-modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const meta: Meta<typeof ServiceFormModal> = {
  title: 'Modules/Services/ServiceFormModal',
  component: ServiceFormModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof ServiceFormModal>

const Demo = (args: any) => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 bg-zinc-800 text-white rounded">Open Modal</button>
      <ServiceFormModal 
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => {
          alert(JSON.stringify(data, null, 2))
          setOpen(false)
        }}
      />
    </>
  )
}

export const Create: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    establishmentId: 'est-1',
  }
}

export const Edit: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    establishmentId: 'est-1',
    initialData: {
      id: 'srv-1',
      establishmentId: 'est-1',
      name: 'Corte',
      description: 'Corte tesoura',
      durationMinutes: 45,
      priceCents: 6000,
      catalogCombo: false,
      createdAt: new Date().toISOString()
    }
  }
}
