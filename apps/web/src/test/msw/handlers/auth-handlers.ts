import { http, HttpResponse } from 'msw'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const authHandlers = [
  http.get(`${apiBaseUrl}/api/v1/me`, () => {
    return HttpResponse.json({
      user: {
        id: 'user_mock_123',
        email: 'mock@example.com',
        emailVerified: true,
        name: 'Mock User',
      },
    })
  }),

  http.post(`${apiBaseUrl}/api/auth/sign-in/email`, () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  http.post(`${apiBaseUrl}/api/auth/sign-up/email`, () => {
    return HttpResponse.json({
      user: {
        id: 'user_mock_123',
        email: 'mock@example.com',
        emailVerified: false,
        name: 'Mock User',
      },
      token: 'mock-verification-token',
    })
  }),

  http.post(`${apiBaseUrl}/api/auth/sign-out`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.post(`${apiBaseUrl}/api/auth/send-verification-email`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.post(`${apiBaseUrl}/api/auth/request-password-reset`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.post(`${apiBaseUrl}/api/auth/reset-password`, () => {
    return HttpResponse.json({ success: true })
  }),
]
