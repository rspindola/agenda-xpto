import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router'
import { SettingsSidebar } from '../settings-sidebar'

async function renderWithRouter(initialPath = '/settings/general') {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <SettingsSidebar />
        <Outlet />
      </div>
    ),
  })

  const generalRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/general',
    component: () => <div data-testid="page-general">Página Geral</div>,
  })

  const hoursRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/hours',
    component: () => <div data-testid="page-hours">Página Horários</div>,
  })

  const teamServicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/team-and-services',
    component: () => <div data-testid="page-team-services">Página Equipe e Serviços</div>,
  })

  const dangerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/danger',
    component: () => <div data-testid="page-danger">Página Zona de Perigo</div>,
  })

  const routeTree = rootRoute.addChildren([
    generalRoute,
    hoursRoute,
    teamServicesRoute,
    dangerRoute,
  ])

  const history = createMemoryHistory({ initialEntries: [initialPath] })
  const router = createRouter({ routeTree, history })

  const utils = render(<RouterProvider router={router} />)
  await router.load()
  return { ...utils, router }
}

describe('SettingsSidebar Component (T11)', () => {
    it('should render all 4 navigation links', async () => {
    await renderWithRouter('/settings/general')

    expect(await screen.findByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('nav-settings-general')).toHaveTextContent('Geral')
    expect(screen.getByTestId('nav-settings-hours')).toHaveTextContent('Horários de Funcionamento')
    expect(screen.getByTestId('nav-settings-team-services')).toHaveTextContent('Equipe e Serviços')
    expect(screen.getByTestId('nav-settings-danger')).toHaveTextContent('Zona de Perigo')
  })

  it('should highlight active link and apply danger styling to danger zone', async () => {
    await renderWithRouter('/settings/danger')

    const dangerLink = await screen.findByTestId('nav-settings-danger')
    expect(dangerLink.className).toContain('text-rose-300')
  })

  it('should navigate to new sub-route when clicking sidebar link', async () => {
    const user = userEvent.setup()
    await renderWithRouter('/settings/general')

    const hoursLink = await screen.findByTestId('nav-settings-hours')
    await user.click(hoursLink)

    expect(await screen.findByTestId('page-hours')).toBeInTheDocument()
  })
})
