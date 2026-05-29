import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolvePostLoginPath } from '#/modules/auth/lib/route-guards'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const to = await resolvePostLoginPath(context.queryClient)
    throw redirect({ to })
  },
})
