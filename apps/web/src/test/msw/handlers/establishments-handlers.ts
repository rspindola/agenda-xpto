import { http, HttpResponse } from 'msw'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const mockEstablishment = {
  id: 'est_mock_123',
  name: 'Mock Establishment',
  slug: 'mock-establishment',
  email: 'mock@establishment.com',
  phone: '11999999999',
  address: 'Rua Mock, 123',
  timezone: 'America/Sao_Paulo',
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: 'operacional@establishment.com',
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

export const establishmentsHandlers = [
  http.get(`${apiBaseUrl}/api/v1/establishments`, () => {
    return HttpResponse.json([mockEstablishment])
  }),

  http.get(`${apiBaseUrl}/api/v1/establishments/:establishmentId`, ({ params }) => {
    const { establishmentId } = params
    return HttpResponse.json({
      ...mockEstablishment,
      id: establishmentId,
    })
  }),

  http.post(`${apiBaseUrl}/api/v1/establishments`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>
    return HttpResponse.json({
      ...mockEstablishment,
      id: 'est_mock_new',
      name: body.name || mockEstablishment.name,
      slug: body.slug || mockEstablishment.slug,
      email: body.email || mockEstablishment.email,
      timezone: body.timezone || mockEstablishment.timezone,
      phone: body.phone ?? mockEstablishment.phone,
      address: body.address ?? mockEstablishment.address,
    })
  }),

  http.patch(`${apiBaseUrl}/api/v1/establishments/:establishmentId`, async ({ params, request }) => {
    const { establishmentId } = params
    const body = (await request.json()) as Record<string, any>
    return HttpResponse.json({
      ...mockEstablishment,
      id: establishmentId,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete(`${apiBaseUrl}/api/v1/establishments/:establishmentId`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.get(`${apiBaseUrl}/api/v1/establishments/:establishmentId/professionals`, () => {
    return HttpResponse.json([
      {
        id: 'prof_mock_123',
        name: 'Mock Professional',
        email: 'mockprof@example.com',
        phone: '11999999999',
        isActive: true,
      },
    ])
  }),

  http.post(`${apiBaseUrl}/api/v1/establishments/:establishmentId/professionals`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>
    return HttpResponse.json({
      id: 'prof_mock_123',
      name: body.name || 'Mock Professional',
      email: body.email || 'mockprof@example.com',
      phone: body.phone || '11999999999',
      isActive: true,
    })
  }),

  http.get(`${apiBaseUrl}/api/v1/establishments/:establishmentId/services`, () => {
    return HttpResponse.json([
      {
        id: 'serv_mock_123',
        name: 'Corte de Cabelo',
        durationMinutes: 30,
        priceCents: 5000,
        isActive: true,
      },
    ])
  }),

  http.get(`${apiBaseUrl}/api/v1/establishments/:establishmentId/availability/business-hours`, () => {
    return HttpResponse.json([
      { weekday: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { weekday: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { weekday: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { weekday: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { weekday: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { weekday: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
      { weekday: 0, isOpen: false, openTime: null, closeTime: null },
    ])
  }),

  http.put(`${apiBaseUrl}/api/v1/establishments/:establishmentId/availability/business-hours/:weekday`, () => {
    return HttpResponse.json({ success: true })
  }),
]
