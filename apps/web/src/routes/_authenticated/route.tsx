import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ensureEmailVerified } from '#/modules/auth/lib/route-guards'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    await ensureEmailVerified(context.queryClient)
  },
  component: AuthenticatedLayoutComponent,
})

function AuthenticatedLayoutComponent() {
  return <Outlet />
}
