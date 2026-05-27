import { http, HttpResponse } from 'msw'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const establishmentsHandlers = [
  http.get(`${apiBaseUrl}/api/v1/establishments`, () => {
    return HttpResponse.json([
      {
        id: 'est_mock_123',
        name: 'Mock Establishment',
        slug: 'mock-establishment',
        email: 'mock@establishment.com',
        timezone: 'America/Sao_Paulo',
      },
    ])
  }),

  http.post(`${apiBaseUrl}/api/v1/establishments`, async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json({
      id: 'est_mock_123',
      name: body.name || 'Mock Establishment',
      slug: body.slug || 'mock-establishment',
      email: body.email || 'mock@establishment.com',
      timezone: body.timezone || 'America/Sao_Paulo',
    })
  }),

  http.post(`${apiBaseUrl}/api/v1/establishments/:establishmentId/professionals`, async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json({
      id: 'prof_mock_123',
      name: body.name || 'Mock Professional',
      email: body.email || 'mockprof@example.com',
      phone: body.phone || '11999999999',
    })
  }),

  http.put(`${apiBaseUrl}/api/v1/establishments/:establishmentId/availability/business-hours/:weekday`, () => {
    return HttpResponse.json({ success: true })
  }),
]
