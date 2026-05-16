import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './toast'
import { Button } from './button'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Scheduled: Catch up',
    description: 'Friday, February 10, 2023 at 5:57 PM',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Uh oh! Something went wrong.',
    description: 'There was a problem with your request.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'Uh oh! Something went wrong.',
    description: 'There was a problem with your request.',
    action: (
      <Button
        variant="outline"
        size="sm"
        className="bg-transparent border-white hover:bg-white/20 text-white"
      >
        Undo
      </Button>
    ),
  },
}
