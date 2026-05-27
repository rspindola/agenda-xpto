import { describe, expect, it, vi, beforeEach } from 'vitest'
import { api } from '#/lib/axios'
import { authApi } from '../auth-api'

vi.mock('#/lib/axios', () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

describe('authApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should call getMe on GET /api/v1/me', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'user@example.com',
      emailVerified: true,
      name: 'John Doe',
    }
    vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockUser } })

    const response = await authApi.getMe()
    expect(api.get).toHaveBeenCalledWith('/api/v1/me')
    expect(response).toEqual({ user: mockUser })
  })

  it('should call signUp on POST /api/auth/sign-up/email', async () => {
    const input = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
      callbackURL: 'http://localhost:3000/verify',
    }
    const mockResult = {
      user: {
        id: 'user_456',
        email: 'jane@example.com',
        emailVerified: false,
        name: 'Jane',
      },
      token: 'some-token',
    }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResult })

    const response = await authApi.signUp(input)
    expect(api.post).toHaveBeenCalledWith('/api/auth/sign-up/email', input)
    expect(response).toEqual(mockResult)
  })

  it('should call signIn on POST /api/auth/sign-in/email', async () => {
    const input = {
      email: 'jane@example.com',
      password: 'password123',
      rememberMe: true,
      callbackURL: 'http://localhost:3000/dashboard',
    }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { status: 'ok' } })

    const response = await authApi.signIn(input)
    expect(api.post).toHaveBeenCalledWith('/api/auth/sign-in/email', input)
    expect(response).toEqual({ status: 'ok' })
  })

  it('should call signOut on POST /api/auth/sign-out', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } })

    const response = await authApi.signOut()
    expect(api.post).toHaveBeenCalledWith('/api/auth/sign-out')
    expect(response).toEqual({ success: true })
  })

  it('should call sendVerificationEmail on POST /api/auth/send-verification-email', async () => {
    const input = { email: 'test@example.com', callbackURL: 'http://localhost:3000/verify' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } })

    const response = await authApi.sendVerificationEmail(input)
    expect(api.post).toHaveBeenCalledWith('/api/auth/send-verification-email', input)
    expect(response).toEqual({ success: true })
  })

  it('should call requestPasswordReset on POST /api/auth/request-password-reset', async () => {
    const input = { email: 'test@example.com', redirectTo: 'http://localhost:3000/reset' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } })

    const response = await authApi.requestPasswordReset(input)
    expect(api.post).toHaveBeenCalledWith('/api/auth/request-password-reset', input)
    expect(response).toEqual({ success: true })
  })

  it('should call resetPassword on POST /api/auth/reset-password', async () => {
    const input = { newPassword: 'new-password', token: 'reset-token' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } })

    const response = await authApi.resetPassword(input)
    expect(api.post).toHaveBeenCalledWith('/api/auth/reset-password', input)
    expect(response).toEqual({ success: true })
  })
})
