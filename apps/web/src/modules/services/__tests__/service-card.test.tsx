import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceCard } from '../components/service-card'
import type { Service } from '../types'

describe('ServiceCard', () => {
  const mockService: Service = {
    id: 'srv-1',
    establishmentId: 'est-1',
    name: 'Corte',
    description: 'Corte de cabelo completo',
    durationMinutes: 30,
    priceCents: 5000,
    catalogCombo: false,
    createdAt: new Date().toISOString(),
  }

  it('renders service details correctly', () => {
    render(<ServiceCard service={mockService} onEdit={vi.fn()} onDelete={vi.fn()} />)
    
    expect(screen.getByText('Corte')).toBeInTheDocument()
    expect(screen.getByText('Corte de cabelo completo')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument()
  })

  it('renders combo badge when catalogCombo is true', () => {
    render(<ServiceCard service={{ ...mockService, catalogCombo: true }} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Pacote/Combo')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<ServiceCard service={mockService} onEdit={onEdit} onDelete={vi.fn()} />)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(mockService)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<ServiceCard service={mockService} onEdit={vi.fn()} onDelete={onDelete} />)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    expect(onDelete).toHaveBeenCalledWith(mockService)
  })
})
