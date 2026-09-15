import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ensureOnboardingComplete } from '#/modules/auth/lib/route-guards'
import { SettingsLayout } from '#/components/layouts/settings-layout'

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: async ({ context }) => {
    await ensureOnboardingComplete(context.queryClient)
  },
  component: SettingsLayoutRouteComponent,
})

function SettingsLayoutRouteComponent() {
  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  )
}
