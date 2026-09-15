import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfessionalFormModal } from '../components/professional-form-modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('ProfessionalFormModal', () => {
  it('renders correctly and submits valid data', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    
    renderWithQueryClient(
      <ProfessionalFormModal 
        establishmentId="est-1"
        isOpen={true} 
        onClose={onClose} 
        onSubmit={onSubmit} 
      />
    )
    
    expect(screen.getByText('Novo Profissional')).toBeInTheDocument()
    
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/nome/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@example.com')
    await user.type(screen.getByLabelText(/celular/i), '11999999999')
    
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11999999999',
        services: []
      })
    })
  })
})
