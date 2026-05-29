import { describe, expect, it } from 'vitest'
import { establishmentsApi } from '../api/establishments-api'

describe('Establishments API Client (T15)', () => {
  it('should list establishments', async () => {
    const list = await establishmentsApi.list()
    expect(list).toBeInstanceOf(Array)
    expect(list.length).toBeGreaterThan(0)
    expect(list[0].id).toBe('est_mock_123')
    expect(list[0].name).toBe('Mock Establishment')
  })

  it('should create an establishment', async () => {
    const payload = {
      name: 'Salão do Zé',
      email: 'ze@salon.com',
      timezone: 'America/Sao_Paulo',
    }
    const created = await establishmentsApi.create(payload)
    expect(created.id).toBeDefined()
    expect(created.name).toBe('Salão do Zé')
    expect(created.email).toBe('ze@salon.com')
  })
})
