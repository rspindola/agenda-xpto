import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ref: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" name="example" />
        <label htmlFor="option-one">Option One</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" name="example" />
        <label htmlFor="option-two">Option Two</label>
      </div>
    </RadioGroup>
  ),
}
