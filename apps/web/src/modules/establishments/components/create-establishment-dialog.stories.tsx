import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateEstablishmentDialog } from './create-establishment-dialog'
import { Button } from '#/components/ui/button'

const meta: Meta<typeof CreateEstablishmentDialog> = {
  title: 'Establishments/CreateEstablishmentDialog',
  component: CreateEstablishmentDialog,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof CreateEstablishmentDialog>

function DialogWrapper() {
  const [open, setOpen] = useState(true)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-10">
        <Button onClick={() => setOpen(true)}>Abrir Modal</Button>
        <CreateEstablishmentDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={(created) => alert(`Estabelecimento criado: ${created.name}`)}
        />
      </div>
    </QueryClientProvider>
  )
}

export const DefaultOpen: Story = {
  render: () => <DialogWrapper />,
}
