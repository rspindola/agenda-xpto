import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { SettingsLayout } from '#/components/layouts/settings-layout'
import { GeneralSettingsForm } from '#/modules/establishments/components/general-settings-form'
import { HoursReadonlySummary } from '#/modules/establishments/components/hours-readonly-summary'
import { ProfessionalsReadonlyList } from '#/modules/establishments/components/professionals-readonly-list'
import { ServicesReadonlyList } from '#/modules/establishments/components/services-readonly-list'
import { DangerZoneSection } from '#/modules/establishments/components/danger-zone-section'
import {
  setActiveEstablishmentId,
  resetEstablishmentStore,
} from '#/modules/establishments/stores/establishment-store'
import { authKeys } from '#/modules/auth/query-keys'
import { establishmentKeys } from '#/modules/establishments/query-keys'

const mockEstablishment = {
  id: 'est_vintage',
  name: 'Barbearia Vintage',
  slug: 'barbearia-vintage',
  email: 'contato@vintage.com',
  phone: '(11) 98765-4321',
  address: 'Rua Augusta, 500',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  operationalEmail: 'agenda@vintage.com',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

function createTestQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  queryClient.setQueryData(authKeys.session(), {
    user: { id: 'usr_1', email: 'owner@example.com', name: 'Renato', plan: 'pro' },
    establishmentCount: 2,
  })

  queryClient.setQueryData(establishmentKeys.list(), [
    mockEstablishment,
    {
      id: 'est_2',
      name: 'Salão Elegance',
      slug: 'salao-elegance',
      email: 'contato@elegance.com',
      phone: '(11) 91234-5678',
      timezone: 'America/Sao_Paulo',
      minAdvanceMinutes: 30,
      isActive: true,
    },
  ])

  queryClient.setQueryData(establishmentKeys.hours('est_vintage'), [
    {
      weekday: 1,
      isOpen: true,
      openTime: '09:00',
      closeTime: '19:00',
    },
  ])

  queryClient.setQueryData(establishmentKeys.professionals('est_vintage'), [
    {
      id: 'prof_1',
      establishmentId: 'est_vintage',
      name: 'Carlos Barbeiro',
      email: 'carlos@vintage.com',
      isActive: true,
    },
  ])

  queryClient.setQueryData(establishmentKeys.services('est_vintage'), [
    {
      id: 'srv_1',
      establishmentId: 'est_vintage',
      name: 'Corte Tradicional',
      durationMinutes: 45,
      priceCents: 6000,
      isActive: true,
    },
  ])

  return queryClient
}

async function renderSettingsRoutes(initialPath = '/settings/general') {
  const queryClient = createTestQueryClient()

  const rootRoute = createRootRoute({
    component: () => <SettingsLayout />,
  })

  const generalRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/general',
    component: () => <GeneralSettingsForm establishment={mockEstablishment} />,
  })

  const hoursRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/hours',
    component: () => <HoursReadonlySummary establishmentId={mockEstablishment.id} />,
  })

  const professionalsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/professionals',
    component: () => <ProfessionalsReadonlyList establishmentId={mockEstablishment.id} />,
  })

  const servicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/services',
    component: () => <ServicesReadonlyList establishmentId={mockEstablishment.id} />,
  })

  const dangerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/danger',
    component: () => (
      <DangerZoneSection
        establishment={mockEstablishment}
        totalEstablishments={2}
      />
    ),
  })

  const routeTree = rootRoute.addChildren([
    generalRoute,
    hoursRoute,
    professionalsRoute,
    servicesRoute,
    dangerRoute,
  ])

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

describe('Settings Routes Integration (T13)', () => {
  beforeEach(() => {
    resetEstablishmentStore()
    setActiveEstablishmentId('est_vintage')
  })

  it('renders General settings page with establishment form fields', async () => {
    await renderSettingsRoutes('/settings/general')

    expect(await screen.findByTestId('general-settings-form')).toBeInTheDocument()
    expect(screen.getByTestId('general-name-input')).toHaveValue('Barbearia Vintage')
    expect(screen.getByTestId('general-slug-input')).toHaveValue('barbearia-vintage')
  })

  it('renders Business Hours readonly summary page', async () => {
    await renderSettingsRoutes('/settings/hours')

    expect(await screen.findByTestId('hours-readonly-summary')).toBeInTheDocument()
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument()
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText(/19:00/)).toBeInTheDocument()
  })

  it('renders Professionals readonly list page', async () => {
    await renderSettingsRoutes('/settings/professionals')

    expect(await screen.findByTestId('professionals-readonly-list')).toBeInTheDocument()
    expect(screen.getByText('Carlos Barbeiro')).toBeInTheDocument()
    expect(screen.getByText('carlos@vintage.com')).toBeInTheDocument()
  })

  it('renders Services readonly list page with formatted price in BRL', async () => {
    await renderSettingsRoutes('/settings/services')

    expect(await screen.findByTestId('services-readonly-list')).toBeInTheDocument()
    expect(screen.getByText('Corte Tradicional')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('R$ 60,00')).toBeInTheDocument()
  })

  it('renders Danger Zone page with delete button and warning', async () => {
    await renderSettingsRoutes('/settings/danger')

    expect(await screen.findByTestId('danger-zone-section')).toBeInTheDocument()
    expect(screen.getByTestId('open-delete-dialog-button')).toBeInTheDocument()
  })
})
