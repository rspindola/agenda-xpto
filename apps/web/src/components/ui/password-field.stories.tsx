import type { Meta, StoryObj } from '@storybook/react'
import { PasswordField } from './password-field'

const meta = {
  title: 'UI/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ref: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof PasswordField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Sua senha...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Senha',
    placeholder: 'Sua senha secreta...',
  },
}

export const WithError: Story = {
  args: {
    label: 'Senha',
    placeholder: 'Digite sua senha...',
    error: 'A senha deve ter pelo menos 8 caracteres',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Senha',
    disabled: true,
    placeholder: 'Indisponível...',
  },
}
