import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ResetPasswordForm } from '#/modules/auth/components/reset-password-form'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional().nullable(),
})

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  return <ResetPasswordForm token={token} />
}
