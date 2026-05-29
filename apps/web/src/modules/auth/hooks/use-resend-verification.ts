import { useMutation } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { authApi } from '../api/auth-api'
import { webUrls } from '#/lib/urls'

export function useResendVerification() {
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const mutation = useMutation({
    mutationFn: (email: string) => {
      return authApi.sendVerificationEmail({
        email,
        callbackURL: webUrls.onboardingBusiness(),
      })
    },
    onSuccess: () => {
      // Start 60s cooldown countdown
      setCooldown(60)
    },
  })

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [cooldown])

  return {
    resend: mutation.mutate,
    resendAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    cooldown,
  }
}
