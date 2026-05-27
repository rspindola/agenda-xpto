import type { BetterAuthErrorBody } from '../types/auth-types'

export const DUPLICATE_EMAIL_CODES = new Set([
  'USER_ALREADY_EXISTS',
  'EMAIL_ALREADY_EXISTS',
])

export function mapSignUpError(error?: BetterAuthErrorBody | null): string {
  if (!error) {
    return 'Não foi possível realizar o cadastro. Tente novamente.'
  }

  const code = error.code?.toUpperCase()
  const message = error.message?.toLowerCase() || ''

  if (code && DUPLICATE_EMAIL_CODES.has(code)) {
    return 'Este e-mail já está cadastrado.'
  }

  if (message.includes('already exists') || message.includes('already registered')) {
    return 'Este e-mail já está cadastrado.'
  }

  return error.message || 'Não foi possível realizar o cadastro. Tente novamente.'
}
