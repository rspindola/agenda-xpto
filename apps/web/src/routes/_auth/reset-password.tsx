import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/reset-password')({
  component: () => <div>Reset Password Page Stub</div>,
})
