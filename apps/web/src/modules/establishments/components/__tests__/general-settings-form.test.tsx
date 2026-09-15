import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '#/test/setup'
import { GeneralSettingsForm } from '../general-settings-form'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const mockEstablishment = {
  id: 'est_1',
  name: 'Barbearia Central',
  slug: 'barbearia-central',
  email: 'contato@barbearia.com',
  phone: '11999999999',
  address: 'Av. Paulista, 1000',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: 'operacional@barbearia.com',
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderForm(establishment = mockEstablishment) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <GeneralSettingsForm establishment={establishment} />
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}

describe('GeneralSettingsForm Component (T8)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should pre-fill form fields with establishment data', () => {
    renderForm()

    expect(screen.getByLabelText(/Nome do Estabelecimento/i)).toHaveValue('Barbearia Central')
    expect(screen.getByLabelText(/Slug/i)).toHaveValue('barbearia-central')
    expect(screen.getByLabelText(/E-mail Comercial/i)).toHaveValue('contato@barbearia.com')
    expect(screen.getByLabelText(/Telefone de Contato/i)).toHaveValue('11999999999')
    expect(screen.getByLabelText(/Endereço Físico/i)).toHaveValue('Av. Paulista, 1000')
    expect(screen.getByTestId('slug-preview')).toHaveTextContent('agenda.xpto.com/barbearia-central')
  })

  it('should show warning when isActive is toggled off', async () => {
    const user = userEvent.setup()
    renderForm()

    const activeCheckbox = screen.getByLabelText(/Estabelecimento Ativo/i)
    expect(activeCheckbox).toBeChecked()
    expect(screen.queryByTestId('inactive-warning')).toBeNull()

    await user.click(activeCheckbox)
    expect(activeCheckbox).not.toBeChecked()
    expect(screen.getByTestId('inactive-warning')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    renderForm()

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.clear(nameInput)

    await user.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    await waitFor(() => {
      expect(screen.getByText(/Nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument()
    })
  })

  it('should submit successfully and display success feedback', async () => {
    const user = userEvent.setup()
    renderForm()

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Barbearia Central VIP')

    await user.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    await waitFor(() => {
      expect(screen.getByTestId('general-settings-success')).toBeInTheDocument()
      expect(
        screen.getByText(/Informações do estabelecimento atualizadas com sucesso!/i)
      ).toBeInTheDocument()
    })
  })

  it('should display error message on API failure', async () => {
    server.use(
      http.patch(`${apiBaseUrl}/api/v1/establishments/:id`, () => {
        return HttpResponse.json({ message: 'Erro ao atualizar dados.' }, { status: 400 })
      })
    )

    const user = userEvent.setup()
    renderForm()

    const nameInput = screen.getByLabelText(/Nome do Estabelecimento/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Barbearia Erro')

    await user.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    await waitFor(() => {
      expect(screen.getByTestId('general-settings-error')).toBeInTheDocument()
      expect(screen.getByText('Erro ao atualizar dados.')).toBeInTheDocument()
    })
  })
})
