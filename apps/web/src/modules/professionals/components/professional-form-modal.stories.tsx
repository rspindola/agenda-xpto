import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ProfessionalFormModal } from './professional-form-modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const meta: Meta<typeof ProfessionalFormModal> = {
  title: 'Modules/Professionals/ProfessionalFormModal',
  component: ProfessionalFormModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof ProfessionalFormModal>

const Demo = (args: any) => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 bg-zinc-800 text-white rounded">Open Modal</button>
      <ProfessionalFormModal 
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
      id: 'pro-1',
      establishmentId: 'est-1',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      createdAt: new Date().toISOString()
    }
  }
}
