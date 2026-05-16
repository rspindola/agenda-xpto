import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: 50,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 30,
  },
}
