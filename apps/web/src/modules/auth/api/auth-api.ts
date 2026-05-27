import { api } from '#/lib/axios'
import type { AuthUser, MeResponse } from '../types/auth-types'

export type SignUpInput = {
  name: string
  email: string
  password: string
  callbackURL?: string
}

export type SignInInput = {
  email: string
  password: string
  rememberMe?: boolean
  callbackURL?: string
}

export type RequestPasswordResetInput = {
  email: string
  redirectTo?: string
}

export type ResetPasswordInput = {
  newPassword: string
  token: string
}

export const authApi = {
  async getMe(): Promise<MeResponse> {
    const { data } = await api.get<MeResponse>('/api/v1/me')
    return data
  },

  async signUp(input: SignUpInput): Promise<{ user: AuthUser; token?: string | null }> {
    const { data } = await api.post<{ user: AuthUser; token?: string | null }>('/api/auth/sign-up/email', input)
    return data
  },

  async signIn(input: SignInInput): Promise<Record<string, unknown>> {
    const { data } = await api.post<Record<string, unknown>>('/api/auth/sign-in/email', input)
    return data
  },

  async signOut(): Promise<Record<string, unknown>> {
    const { data } = await api.post<Record<string, unknown>>('/api/auth/sign-out')
    return data
  },

  async sendVerificationEmail(input: { email: string; callbackURL: string }): Promise<Record<string, unknown>> {
    const { data } = await api.post<Record<string, unknown>>('/api/auth/send-verification-email', input)
    return data
  },

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<Record<string, unknown>> {
    const { data } = await api.post<Record<string, unknown>>('/api/auth/request-password-reset', input)
    return data
  },

  async resetPassword(input: ResetPasswordInput): Promise<Record<string, unknown>> {
    const { data } = await api.post<Record<string, unknown>>('/api/auth/reset-password', input)
    return data
  },
}
