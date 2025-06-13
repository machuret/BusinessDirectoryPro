import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { UIProvider } from '@/contexts/UIContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </UIProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockBusiness = (overrides = {}) => ({
  placeid: 'test-business-1',
  title: 'Test Business',
  description: 'A test business for unit testing',
  categoryname: 'Restaurant',
  phone: '555-0123',
  website: 'https://testbusiness.com',
  address: '123 Test St',
  city: 'Test City',
  rating: 4.5,
  reviewCount: 10,
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  ...overrides
})

export const createMockCategory = (overrides = {}) => ({
  id: 1,
  name: 'Restaurant',
  slug: 'restaurant',
  icon: 'utensils',
  color: '#ef4444',
  ...overrides
})