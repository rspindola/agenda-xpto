import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog } from './dialog'
import { Button } from './button'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    ref: {
      table: { disable: true },
    },
  },
  args: {
    open: false,
    onOpenChange: () => {},
    children: null,
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

const DialogDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Dialog Title"
        description="This is a description for the dialog."
      >
        <div className="py-4">
          <p>Content of the dialog goes here.</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Dialog>
    </div>
  )
}

export const Default: Story = {
  render: () => <DialogDemo />,
}
