import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ensureGuest } from '#/modules/auth/lib/route-guards'
import { AuthLayout } from '#/components/layouts/auth-layout'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    await ensureGuest(context.queryClient)
  },
  component: AuthLayoutComponent,
})

function AuthLayoutComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
