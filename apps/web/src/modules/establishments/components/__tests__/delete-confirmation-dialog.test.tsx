import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '#/test/setup'
import { DangerZoneSection } from '../danger-zone-section'
import { DeleteConfirmationDialog } from '../delete-confirmation-dialog'

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
  operationalEmail: null,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderDangerZone(establishment = mockEstablishment, totalEstablishments = 2, onDeleted = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <DangerZoneSection
        establishment={establishment}
        totalEstablishments={totalEstablishments}
        onDeleted={onDeleted}
      />
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}

describe('DangerZoneSection & DeleteConfirmationDialog (T9)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render danger zone card with warning', () => {
    renderDangerZone()

    expect(screen.getByTestId('danger-zone-section')).toBeInTheDocument()
    expect(screen.getByText('Zona de Perigo')).toBeInTheDocument()
    expect(screen.getByTestId('open-delete-dialog-button')).toBeInTheDocument()
  })

  it('should open dialog and keep confirm button disabled until exact name is typed', async () => {
    const user = userEvent.setup()
    renderDangerZone()

    await user.click(screen.getByTestId('open-delete-dialog-button'))
    expect(
      screen.getByRole('heading', { name: 'Excluir Estabelecimento' })
    ).toBeInTheDocument()

    const confirmBtn = screen.getByTestId('confirm-delete-button')
    expect(confirmBtn).toBeDisabled()

    const input = screen.getByTestId('confirm-name-input')
    await user.type(input, 'Nome Errado')
    expect(confirmBtn).toBeDisabled()

    await user.clear(input)
    await user.type(input, 'barbearia central') // case-insensitive match
    expect(confirmBtn).not.toBeDisabled()
  })

  it('should display warning about onboarding when totalEstablishments is 1', async () => {
    const user = userEvent.setup()
    renderDangerZone(mockEstablishment, 1)

    await user.click(screen.getByTestId('open-delete-dialog-button'))
    expect(screen.getByTestId('single-establishment-warning')).toBeInTheDocument()
    expect(
      screen.getByText(/Ao excluí-lo, você será redirecionado ao processo de configuração inicial/i)
    ).toBeInTheDocument()
  })

  it('should delete successfully and call onDeleted callback', async () => {
    const user = userEvent.setup()
    const handleDeleted = vi.fn()
    renderDangerZone(mockEstablishment, 2, handleDeleted)

    await user.click(screen.getByTestId('open-delete-dialog-button'))
    const input = screen.getByTestId('confirm-name-input')
    await user.type(input, 'Barbearia Central')

    const confirmBtn = screen.getByTestId('confirm-delete-button')
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(handleDeleted).toHaveBeenCalledTimes(1)
    })
  })

  it('should display server error if delete fails', async () => {
    server.use(
      http.delete(`${apiBaseUrl}/api/v1/establishments/:id`, () => {
        return HttpResponse.json(
          { message: 'Não é possível excluir o estabelecimento ativo.' },
          { status: 400 }
        )
      })
    )

    const user = userEvent.setup()
    renderDangerZone(mockEstablishment, 2)

    await user.click(screen.getByTestId('open-delete-dialog-button'))
    const input = screen.getByTestId('confirm-name-input')
    await user.type(input, 'Barbearia Central')

    const confirmBtn = screen.getByTestId('confirm-delete-button')
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('delete-error-message')).toBeInTheDocument()
      expect(
        screen.getByText('Não é possível excluir o estabelecimento ativo.')
      ).toBeInTheDocument()
    })
  })
})
