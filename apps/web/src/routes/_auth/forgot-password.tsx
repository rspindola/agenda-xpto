import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: () => <div>Forgot Password Page Stub</div>,
})
