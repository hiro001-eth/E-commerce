import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for testing
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test_db')

// Mock window.matchMedia for Radix UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock console methods to keep tests clean
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}