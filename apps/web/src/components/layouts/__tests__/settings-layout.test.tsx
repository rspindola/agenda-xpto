import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { SettingsLayout } from '../settings-layout'
import { setActiveEstablishmentId, resetEstablishmentStore } from '#/modules/establishments/stores/establishment-store'
import { authKeys } from '#/modules/auth/query-keys'
import { establishmentKeys } from '#/modules/establishments/query-keys'

function createTestQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  queryClient.setQueryData(authKeys.session(), {
    user: { id: 'usr_1', email: 'owner@example.com', name: 'Renato', plan: 'pro' },
    establishmentCount: 1,
  })

  queryClient.setQueryData(establishmentKeys.list(), [
    {
      id: 'est_1',
      name: 'Barbearia Vintage',
      slug: 'barbearia-vintage',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
    },
  ])

  return queryClient
}

async function renderSettingsLayout(initialPath = '/settings/general') {
  const queryClient = createTestQueryClient()

  const rootRoute = createRootRoute({
    component: () => (
      <SettingsLayout>
        <div data-testid="settings-child">Configurações Gerais Conteúdo</div>
      </SettingsLayout>
    ),
  })

  const generalRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/general',
    component: () => <div>General</div>,
  })

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <div data-testid="dashboard-page">Dashboard</div>,
  })

  const routeTree = rootRoute.addChildren([generalRoute, dashboardRoute])
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  const router = createRouter({ routeTree, history })

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  await router.load()
  return { ...utils, router }
}

describe('SettingsLayout Component (T12)', () => {
  beforeEach(() => {
    resetEstablishmentStore()
    setActiveEstablishmentId('est_1')
  })

  it('should render header with establishment switcher and link back to dashboard', async () => {
    await renderSettingsLayout()

    expect(await screen.findByTestId('settings-layout')).toBeInTheDocument()
    expect(screen.getByTestId('establishment-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('link-back-dashboard')).toHaveTextContent('Voltar ao Painel')
  })

  it('should render sidebar and content container', async () => {
    await renderSettingsLayout()

    expect(await screen.findByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('settings-content')).toBeInTheDocument()
    expect(screen.getByTestId('settings-child')).toHaveTextContent('Configurações Gerais Conteúdo')
  })
})
