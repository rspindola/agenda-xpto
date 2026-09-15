import type { Meta, StoryObj } from '@storybook/react'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { SettingsSidebar } from './settings-sidebar'

function createTestRouter(initialPath = '/settings/general') {
  const rootRoute = createRootRoute()
  const generalRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/general',
    component: () => <SettingsSidebar />,
  })
  const hoursRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/hours',
    component: () => <SettingsSidebar />,
  })
  const profsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/professionals',
    component: () => <SettingsSidebar />,
  })
  const servsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/services',
    component: () => <SettingsSidebar />,
  })
  const dangerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/danger',
    component: () => <SettingsSidebar />,
  })

  const routeTree = rootRoute.addChildren([
    generalRoute,
    hoursRoute,
    profsRoute,
    servsRoute,
    dangerRoute,
  ])
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  return createRouter({ routeTree, history })
}

const meta: Meta<typeof SettingsSidebar> = {
  title: 'Establishments/SettingsSidebar',
  component: SettingsSidebar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof SettingsSidebar>

export const DesktopGeneralActive: Story = {
  render: () => {
    const router = createTestRouter('/settings/general')
    return (
      <div className="w-64 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <RouterProvider router={router} />
      </div>
    )
  },
}

export const DesktopDangerActive: Story = {
  render: () => {
    const router = createTestRouter('/settings/danger')
    return (
      <div className="w-64 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <RouterProvider router={router} />
      </div>
    )
  },
}

export const MobileHorizontalTabs: Story = {
  render: () => {
    const router = createTestRouter('/settings/hours')
    return (
      <div className="max-w-md p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <RouterProvider router={router} />
      </div>
    )
  },
}
