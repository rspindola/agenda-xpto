import { describe, expect, it } from 'vitest'
import { establishmentsApi } from '../api/establishments-api'
import { establishmentKeys } from '../query-keys'

describe('Establishments API Client (T2)', () => {
  it('should list establishments', async () => {
    const list = await establishmentsApi.list()
    expect(list).toBeInstanceOf(Array)
    expect(list.length).toBeGreaterThan(0)
    expect(list[0].id).toBe('est_mock_123')
    expect(list[0].name).toBe('Mock Establishment')
  })

  it('should get establishment by id', async () => {
    const establishment = await establishmentsApi.getById('est_mock_123')
    expect(establishment).toBeDefined()
    expect(establishment.id).toBe('est_mock_123')
    expect(establishment.name).toBe('Mock Establishment')
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

  it('should update an establishment via PATCH', async () => {
    const updated = await establishmentsApi.update('est_mock_123', {
      name: 'Mock Establishment Atualizado',
      isActive: false,
    })
    expect(updated).toBeDefined()
    expect(updated.name).toBe('Mock Establishment Atualizado')
  })

  it('should delete an establishment', async () => {
    const res = await establishmentsApi.delete('est_mock_123')
    expect(res).toEqual({ success: true })
  })

  it('should get establishment professionals', async () => {
    const profs = await establishmentsApi.getProfessionals('est_mock_123')
    expect(profs).toBeInstanceOf(Array)
  })

  it('should get establishment services', async () => {
    const services = await establishmentsApi.getServices('est_mock_123')
    expect(services).toBeInstanceOf(Array)
  })

  it('should get establishment business hours', async () => {
    const hours = await establishmentsApi.getBusinessHours('est_mock_123')
    expect(hours).toBeInstanceOf(Array)
  })

  describe('establishmentKeys factory', () => {
    it('should generate structured query keys', () => {
      expect(establishmentKeys.all).toEqual(['establishments'])
      expect(establishmentKeys.list()).toEqual(['establishments', 'list'])
      expect(establishmentKeys.detail('est_1')).toEqual(['establishments', 'detail', 'est_1'])
      expect(establishmentKeys.professionals('est_1')).toEqual(['establishments', 'professionals', 'est_1'])
      expect(establishmentKeys.services('est_1')).toEqual(['establishments', 'services', 'est_1'])
      expect(establishmentKeys.hours('est_1')).toEqual(['establishments', 'hours', 'est_1'])
    })
  })
})
