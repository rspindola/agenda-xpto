import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect } from 'vitest'
import { setupServer } from 'msw/node'
import { authHandlers } from './msw/handlers/auth-handlers'
import { establishmentsHandlers } from './msw/handlers/establishments-handlers'

expect.extend(matchers)

if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}

export const server = setupServer(...authHandlers, ...establishmentsHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
