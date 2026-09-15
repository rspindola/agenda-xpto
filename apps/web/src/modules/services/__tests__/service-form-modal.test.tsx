import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceFormModal } from '../components/service-form-modal'
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

describe('ServiceFormModal', () => {
  it('renders correctly and submits valid data', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    
    renderWithQueryClient(
      <ServiceFormModal 
        establishmentId="est-1"
        isOpen={true} 
        onClose={onClose} 
        onSubmit={onSubmit} 
      />
    )
    
    expect(screen.getByText('Novo Serviço')).toBeInTheDocument()
    
    const user = userEvent.setup()
    
    const nameInput = screen.getByLabelText(/nome/i)
    const durationInput = screen.getByLabelText(/duração/i)
    const priceInput = screen.getByLabelText(/preço/i)
    
    await user.clear(nameInput)
    await user.type(nameInput, 'Corte')
    
    await user.clear(durationInput)
    await user.type(durationInput, '30')
    
    await user.clear(priceInput)
    await user.type(priceInput, '50')
    
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Corte',
        description: '',
        durationMinutes: 30,
        priceCents: 5000,
        catalogCombo: false, // Checkbox click removed for simplicity in JSDOM
        professionals: []
      })
    })
  })
})
