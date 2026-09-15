import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/team-and-services/')({
  beforeLoad: () => {
    throw redirect({
      to: '/settings/team-and-services/professionals',
    })
  },
})
