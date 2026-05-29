import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../api/auth-api'
import { authKeys } from '../query-keys'
import { sessionQueryOptions, establishmentsQueryOptions } from '../queries/session-queries'

export function useSignIn() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: async () => {
      // Invalidate the session query cache
      await queryClient.invalidateQueries({ queryKey: authKeys.all })

      // Fetch the updated session and establishments list
      const sessionData = await queryClient.fetchQuery(sessionQueryOptions)
      
      if (!sessionData.user.emailVerified) {
        navigate({ to: '/verify-email', search: { email: sessionData.user.email } })
        return
      }

      const establishments = await queryClient.fetchQuery(establishmentsQueryOptions)

      if (establishments.length === 0) {
        navigate({ to: '/onboarding/business' })
      } else {
        navigate({ to: '/dashboard' })
      }
    },
  })
}
