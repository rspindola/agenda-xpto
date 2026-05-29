import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth-api'
import { webUrls } from '#/lib/urls'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => {
      return authApi.requestPasswordReset({
        email,
        redirectTo: webUrls.resetPassword(),
      })
    },
  })
}
