import { describe, expect, it } from 'vitest'
import { mapSignUpError } from '../map-auth-error'

describe('mapSignUpError', () => {
  it('should return fallback message if error is null/undefined', () => {
    expect(mapSignUpError(null)).toBe('Não foi possível realizar o cadastro. Tente novamente.')
    expect(mapSignUpError(undefined)).toBe('Não foi possível realizar o cadastro. Tente novamente.')
  })

  it('should map duplicate email codes to pt-BR message', () => {
    expect(mapSignUpError({ code: 'USER_ALREADY_EXISTS', message: '' })).toBe('Este e-mail já está cadastrado.')
    expect(mapSignUpError({ code: 'EMAIL_ALREADY_EXISTS', message: '' })).toBe('Este e-mail já está cadastrado.')
  })

  it('should map duplicate email message to pt-BR message', () => {
    expect(mapSignUpError({ code: 'UNKNOWN_CODE', message: 'User already exists' })).toBe('Este e-mail já está cadastrado.')
    expect(mapSignUpError({ code: 'UNKNOWN_CODE', message: 'Email already registered' })).toBe('Este e-mail já está cadastrado.')
  })

  it('should return error message for unknown errors', () => {
    expect(mapSignUpError({ code: 'INVALID_PASSWORD', message: 'Password is too weak' })).toBe('Password is too weak')
  })
})
