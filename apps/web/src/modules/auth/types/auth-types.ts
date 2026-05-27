export type AuthUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
}

export type MeResponse = {
  user: AuthUser
}

export type BetterAuthErrorBody = {
  message: string
  code?: string
}
