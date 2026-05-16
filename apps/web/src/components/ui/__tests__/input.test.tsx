import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeDefined()
  })

  it('updates value on change', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    fireEvent.change(input, { target: { value: 'New value' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })
})
