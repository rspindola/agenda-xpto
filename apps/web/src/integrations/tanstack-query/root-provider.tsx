import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds default stale time
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
