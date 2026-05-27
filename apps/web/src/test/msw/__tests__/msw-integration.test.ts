import { describe, expect, it } from 'vitest'
import { api } from '#/lib/axios'

describe('MSW Integration Server', () => {
  it('should intercept GET /api/v1/me and return mock user', async () => {
    const { data } = await api.get('/api/v1/me')
    expect(data).toEqual({
      user: {
        id: 'user_mock_123',
        email: 'mock@example.com',
        emailVerified: true,
        name: 'Mock User',
      },
    })
  })

  it('should intercept GET /api/v1/establishments and return mock establishments', async () => {
    const { data } = await api.get('/api/v1/establishments')
    expect(data).toEqual([
      {
        id: 'est_mock_123',
        name: 'Mock Establishment',
        slug: 'mock-establishment',
        email: 'mock@establishment.com',
        timezone: 'America/Sao_Paulo',
      },
    ])
  })
})
