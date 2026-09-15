import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { EstablishmentSwitcher } from '../establishment-switcher'
import { authKeys } from '#/modules/auth/query-keys'
import { establishmentKeys } from '../../query-keys'
import { establishmentStore, resetEstablishmentStore, setActiveEstablishmentId } from '../../stores/establishment-store'

const mockEst1 = {
  id: 'est_1',
  name: 'Barbearia Central',
  slug: 'barbearia-central',
  email: 'central@barbearia.com',
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

const mockEst2 = {
  ...mockEst1,
  id: 'est_2',
  name: 'Barbearia Jardins',
  slug: 'barbearia-jardins',
}

const mockEst3 = {
  ...mockEst1,
  id: 'est_3',
  name: 'Studio Moema',
  slug: 'studio-moema',
}

function renderSwitcher(plan = 'starter', establishments = [mockEst1], onOpenCreate?: () => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  queryClient.setQueryData(authKeys.session(), {
    user: { id: 'u1', email: 'owner@example.com', name: 'Renato Castro', plan },
  })
  queryClient.setQueryData(establishmentKeys.list(), establishments)
  setActiveEstablishmentId(establishments[0].id)

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <EstablishmentSwitcher onOpenCreate={onOpenCreate} />
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}

describe('EstablishmentSwitcher Component (T6)', () => {
  beforeEach(() => {
    localStorage.clear()
    resetEstablishmentStore()
  })

  it('should render static badge with no dropdown on Starter plan', async () => {
    renderSwitcher('starter', [mockEst1])

    expect(screen.getByTestId('starter-establishment-badge')).toBeInTheDocument()
    expect(screen.getByText('Barbearia Central')).toBeInTheDocument()
    expect(screen.queryByTestId('establishment-switcher-trigger')).toBeNull()
  })

  it('should render interactive trigger and open dropdown on Pro plan', async () => {
    const user = userEvent.setup()
    renderSwitcher('pro', [mockEst1, mockEst2])

    const trigger = screen.getByTestId('establishment-switcher-trigger')
    expect(trigger).toBeInTheDocument()
    expect(screen.queryByTestId('establishment-switcher-dropdown')).toBeNull()

    await user.click(trigger)
    expect(screen.getByTestId('establishment-switcher-dropdown')).toBeInTheDocument()
    expect(screen.getByText('2 de 3')).toBeInTheDocument()
    expect(screen.getByText('Barbearia Jardins')).toBeInTheDocument()
  })

  it('should switch active establishment when clicking another item', async () => {
    const user = userEvent.setup()
    renderSwitcher('pro', [mockEst1, mockEst2])

    await user.click(screen.getByTestId('establishment-switcher-trigger'))
    const item2 = screen.getByTestId('establishment-item-est_2')
    await user.click(item2)

    expect(establishmentStore.state.activeEstablishmentId).toBe('est_2')
  })

  it('should show plan limit warning and disable "+ Novo" button when at limit', async () => {
    const user = userEvent.setup()
    renderSwitcher('pro', [mockEst1, mockEst2, mockEst3])

    await user.click(screen.getByTestId('establishment-switcher-trigger'))
    expect(screen.getByTestId('plan-limit-alert')).toBeInTheDocument()
    expect(
      screen.getByText('Seu plano permite até 3 estabelecimentos. Faça upgrade para adicionar mais.')
    ).toBeInTheDocument()

    const addBtn = screen.getByTestId('add-establishment-button')
    expect(addBtn).toBeDisabled()
  })

  it('should call onOpenCreate when clicking "+ Novo" within limit', async () => {
    const user = userEvent.setup()
    const handleOpenCreate = vi.fn()
    renderSwitcher('pro', [mockEst1, mockEst2], handleOpenCreate)

    await user.click(screen.getByTestId('establishment-switcher-trigger'))
    const addBtn = screen.getByTestId('add-establishment-button')
    expect(addBtn).not.toBeDisabled()

    await user.click(addBtn)
    expect(handleOpenCreate).toHaveBeenCalledTimes(1)
  })
})
