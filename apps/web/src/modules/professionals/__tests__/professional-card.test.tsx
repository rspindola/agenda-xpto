import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfessionalCard } from '../components/professional-card'
import type { Professional } from '../types'

describe('ProfessionalCard', () => {
  const mockProfessional: Professional = {
    id: 'pro-1',
    establishmentId: 'est-1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    createdAt: new Date().toISOString(),
  }

  it('renders professional details correctly', () => {
    render(<ProfessionalCard professional={mockProfessional} onEdit={vi.fn()} onDelete={vi.fn()} />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<ProfessionalCard professional={mockProfessional} onEdit={onEdit} onDelete={vi.fn()} />)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(mockProfessional)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<ProfessionalCard professional={mockProfessional} onEdit={vi.fn()} onDelete={onDelete} />)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    expect(onDelete).toHaveBeenCalledWith(mockProfessional)
  })
})
