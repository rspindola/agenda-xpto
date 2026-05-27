import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthFormCard } from '../auth-form-card'
import { AuthLayout } from '#/components/layouts/auth-layout'

describe('Auth Layout & Components', () => {
  describe('AuthLayout', () => {
    it('renders children correctly', () => {
      render(
        <AuthLayout>
          <div>My Child Content</div>
        </AuthLayout>
      )
      expect(screen.getByText('My Child Content')).toBeDefined()
    })
  })

  describe('AuthFormCard', () => {
    it('renders title, subtitle, children and footer', () => {
      render(
        <AuthFormCard title="Entrar" subtitle="Insira suas credenciais" footer={<div>Card Footer</div>}>
          <div>Main Form Content</div>
        </AuthFormCard>
      )

      expect(screen.getByText('Agenda XPTO')).toBeDefined()
      expect(screen.getByText('Entrar')).toBeDefined()
      expect(screen.getByText('Insira suas credenciais')).toBeDefined()
      expect(screen.getByText('Main Form Content')).toBeDefined()
      expect(screen.getByText('Card Footer')).toBeDefined()
    })
  })
})
