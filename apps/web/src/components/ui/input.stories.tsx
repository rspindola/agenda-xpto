import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '#/components/ui/input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ref: {
      table: { disable: true },
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Placeholder...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Password...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled...',
  },
}
