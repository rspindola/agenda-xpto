import { describe, expect, it } from 'vitest'
import { authKeys, establishmentKeys } from '../query-keys'

describe('Query Key Factories', () => {
  it('should return correct auth query keys', () => {
    expect(authKeys.all).toEqual(['auth'])
    expect(authKeys.session()).toEqual(['auth', 'session'])
  })

  it('should return correct establishment query keys', () => {
    expect(establishmentKeys.all).toEqual(['establishments'])
    expect(establishmentKeys.list()).toEqual(['establishments', 'list'])
  })
})
