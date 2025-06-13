import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {},
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  writable: true,
  value: {
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
    VITE_API_URL: 'http://localhost:5000',
  },
})

// MSW Server setup for API mocking
export const server = setupServer(
  // Default handlers
  http.get('/api/auth/user', () => {
    return HttpResponse.json({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    })
  }),

  http.get('/api/businesses', () => {
    return HttpResponse.json([
      {
        placeid: 'test-business-1',
        title: 'Test Business',
        description: 'A test business for unit testing',
        categoryname: 'Restaurant',
        phone: '555-0123',
        website: 'https://testbusiness.com',
        address: '123 Test St',
        city: 'Test City',
        rating: 4.5,
        reviewCount: 10
      }
    ])
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Restaurant',
        slug: 'restaurant',
        icon: 'utensils',
        color: '#ef4444'
      }
    ])
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())