import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '#/test/setup'
import { CreateEstablishmentDialog } from '../create-establishment-dialog'
import { authKeys } from '#/modules/auth/query-keys'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function renderDialog(open = true, onOpenChange = vi.fn(), onSuccess = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(authKeys.session(), {
    user: { id: 'u1', email: 'owner@example.com', name: 'Renato Castro' },
  })

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CreateEstablishmentDialog open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}

describe('CreateEstablishmentDialog Component (T7)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render form fields with prefilled owner email', () => {
    renderDialog(true)

    expect(screen.getByText('Novo Estabelecimento')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome do Estabelecimento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail Comercial/i)).toHaveValue('owner@example.com')
    expect(screen.getByLabelText(/Fuso Horário/i)).toHaveValue('America/Sao_Paulo')
  })

  it('should show validation error when submitting empty name', async () => {
    const user = userEvent.setup()
    renderDialog(true)

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /Criar Estabelecimento/i }))

    await waitFor(() => {
      expect(screen.getByText(/Nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should submit successfully and trigger onSuccess and onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    renderDialog(true, onOpenChange, onSuccess)

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.type(nameInput, 'Barbearia Jardins')

    const submitBtn = screen.getByRole('button', { name: /Criar Estabelecimento/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should show server error when creation fails (e.g. duplicate slug)', async () => {
    server.use(
      http.post(`${apiBaseUrl}/api/v1/establishments`, () => {
        return HttpResponse.json(
          { message: 'Já existe um estabelecimento com este slug.' },
          { status: 409 }
        )
      })
    )

    const user = userEvent.setup()
    renderDialog(true)

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.type(nameInput, 'Barbearia Jardins')

    await user.click(screen.getByRole('button', { name: /Criar Estabelecimento/i }))

    await waitFor(() => {
      expect(screen.getByTestId('create-establishment-error')).toBeInTheDocument()
      expect(
        screen.getByText('Já existe um estabelecimento com este slug.')
      ).toBeInTheDocument()
    })
  })
})
