import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { VerifyEmailPanel } from '#/modules/auth/components/verify-email-panel'

const verifyEmailSearchSchema = z.object({
  email: z.string().default(''),
})

export const Route = createFileRoute('/_auth/verify-email')({
  validateSearch: verifyEmailSearchSchema,
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { email } = Route.useSearch()
  return <VerifyEmailPanel email={email} />
}
