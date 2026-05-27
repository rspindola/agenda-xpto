import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { authHandlers } from './msw/handlers/auth-handlers'
import { establishmentsHandlers } from './msw/handlers/establishments-handlers'

export const server = setupServer(...authHandlers, ...establishmentsHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
