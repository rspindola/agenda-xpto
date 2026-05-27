import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordField } from '../password-field'

describe('PasswordField', () => {
  it('renders correctly with placeholder', () => {
    render(<PasswordField placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toBeDefined()
    expect(input.getAttribute('type')).toBe('password')
  })

  it('renders label and associates correctly with htmlFor', () => {
    render(<PasswordField label="Senha" id="my-pass" />)
    const label = screen.getByText('Senha')
    expect(label).toBeDefined()
    expect(label.getAttribute('for')).toBe('my-pass')
  })

  it('renders error message correctly', () => {
    render(<PasswordField error="Senha muito curta" />)
    expect(screen.getByText('Senha muito curta')).toBeDefined()
  })

  it('toggles password visibility when toggle button is clicked', () => {
    render(<PasswordField placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    const button = screen.getByLabelText('Exibir senha')

    expect(input.getAttribute('type')).toBe('password')

    // Click to show password
    fireEvent.click(button)
    expect(input.getAttribute('type')).toBe('text')
    expect(screen.getByLabelText('Ocultar senha')).toBeDefined()

    // Click to hide password again
    fireEvent.click(screen.getByLabelText('Ocultar senha'))
    expect(input.getAttribute('type')).toBe('password')
  })

  it('is disabled when disabled prop is true', () => {
    render(<PasswordField disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })
})
