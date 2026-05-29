import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../api/auth-api'
import { authKeys } from '../query-keys'
import { webUrls } from '#/lib/urls'

export function useSignUp() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) => {
      return authApi.signUp({
        ...input,
        callbackURL: webUrls.onboardingBusiness(),
      })
    },
    onSuccess: async (_data, variables) => {
      // Invalidate the session query cache
      await queryClient.invalidateQueries({ queryKey: authKeys.all })

      // Redirect to verification page with email parameter
      navigate({
        to: '/verify-email',
        search: { email: variables.email },
      })
    },
  })
}
