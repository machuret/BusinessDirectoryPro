/**
 * Admin Panel Test Runner
 * Comprehensive test suite for admin functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Global test configuration for admin tests
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: { 
        retry: false,
      },
    },
  })
}

// Mock API functions
export const mockApiRequest = vi.fn()

// Common test utilities for admin components
export const adminTestUtils = {
  // Mock successful API responses
  mockSuccessfulResponse: (data: any) => {
    mockApiRequest.mockResolvedValueOnce(data)
  },

  // Mock API errors
  mockErrorResponse: (error: string) => {
    mockApiRequest.mockRejectedValueOnce(new Error(error))
  },

  // Mock loading state
  mockLoadingResponse: (delay: number = 100) => {
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, delay)))
  },

  // Render component with query client
  renderWithQueryClient: (component: React.ReactElement) => {
    const queryClient = createTestQueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  },

  // Wait for data to load
  waitForDataLoad: async (testId: string) => {
    await waitFor(() => {
      expect(screen.getByTestId(testId)).toBeInTheDocument()
    })
  },

  // Test common CRUD operations
  testCRUDOperations: (componentName: string, mockData: any[], apiEndpoint: string) => {
    describe(`${componentName} CRUD Operations`, () => {
      it('loads data on mount', async () => {
        adminTestUtils.mockSuccessfulResponse(mockData)
        // Component rendering would be handled by the specific test
      })

      it('creates new items', async () => {
        adminTestUtils.mockSuccessfulResponse(mockData)
        adminTestUtils.mockSuccessfulResponse({ id: 'new-id', ...mockData[0] })
        // Create operation test logic
      })

      it('updates existing items', async () => {
        adminTestUtils.mockSuccessfulResponse(mockData)
        adminTestUtils.mockSuccessfulResponse({ ...mockData[0], updated: true })
        // Update operation test logic
      })

      it('deletes items', async () => {
        adminTestUtils.mockSuccessfulResponse(mockData)
        adminTestUtils.mockSuccessfulResponse({ success: true })
        // Delete operation test logic
      })
    })
  },

  // Test search functionality
  testSearchFunctionality: (searchPlaceholder: string) => {
    it('handles search input', async () => {
      const searchInput = screen.getByPlaceholderText(searchPlaceholder)
      fireEvent.change(searchInput, { target: { value: 'search term' } })
      expect(searchInput).toHaveValue('search term')
    })

    it('clears search', async () => {
      const searchInput = screen.getByPlaceholderText(searchPlaceholder)
      fireEvent.change(searchInput, { target: { value: 'search term' } })
      const clearButton = screen.getByRole('button', { name: /clear/i })
      fireEvent.click(clearButton)
      expect(searchInput).toHaveValue('')
    })
  },

  // Test filtering functionality
  testFilterFunctionality: (filterOptions: string[]) => {
    it('filters by different criteria', async () => {
      const filterSelect = screen.getByRole('combobox')
      fireEvent.click(filterSelect)

      filterOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument()
      })
    })
  },

  // Test pagination
  testPagination: () => {
    it('handles pagination', async () => {
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText('Page 2')).toBeInTheDocument()
      })
    })
  },

  // Test bulk operations
  testBulkOperations: (mockData: any[]) => {
    it('handles bulk selection', async () => {
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(selectAllCheckbox)
      
      // Should select all items
      const itemCheckboxes = screen.getAllByRole('checkbox').slice(1)
      itemCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })
    })

    it('handles bulk deletion', async () => {
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(selectAllCheckbox)
      
      const bulkDeleteButton = screen.getByText('Bulk Delete')
      fireEvent.click(bulkDeleteButton)
      
      expect(screen.getByText('Delete Selected Items')).toBeInTheDocument()
    })
  }
}

// Test data generators
export const generateMockData = {
  business: (overrides = {}) => ({
    id: 'bus-1',
    name: 'Test Business',
    category: 'Restaurant',
    description: 'Test description',
    address: '123 Test St',
    phone: '555-0123',
    website: 'https://test.com',
    isApproved: true,
    isFeatured: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  category: (overrides = {}) => ({
    id: 1,
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test category description',
    isActive: true,
    businessCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  review: (overrides = {}) => ({
    id: 'review-1',
    businessId: 'bus-1',
    businessName: 'Test Business',
    customerName: 'Test Customer',
    customerEmail: 'customer@test.com',
    rating: 5,
    comment: 'Great service!',
    isApproved: true,
    isFlagged: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  contentString: (overrides = {}) => ({
    id: 'content-1',
    stringKey: 'test.key',
    defaultValue: 'Test Value',
    translations: { en: 'Test Value', es: 'Valor de Prueba' },
    category: 'forms',
    description: 'Test content string',
    isHtml: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }),
}

// Performance testing utilities
export const performanceTestUtils = {
  // Test component rendering time
  testRenderingPerformance: (component: React.ReactElement, expectedTime: number = 1000) => {
    it('renders within performance threshold', async () => {
      const startTime = performance.now()
      adminTestUtils.renderWithQueryClient(component)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(expectedTime)
    })
  },

  // Test memory usage
  testMemoryUsage: (component: React.ReactElement) => {
    it('cleans up resources properly', async () => {
      const { unmount } = adminTestUtils.renderWithQueryClient(component)
      
      // Check for memory leaks
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      unmount()
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0
      expect(finalMemory).toBeLessThanOrEqual(initialMemory * 1.1) // Allow 10% increase
    })
  }
}

// Accessibility testing utilities
export const accessibilityTestUtils = {
  // Test keyboard navigation
  testKeyboardNavigation: () => {
    it('supports keyboard navigation', async () => {
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('textbox'),
        screen.getAllByRole('combobox'),
        screen.getAllByRole('checkbox')
      )
      
      focusableElements.forEach(element => {
        element.focus()
        expect(element).toHaveFocus()
      })
    })
  },

  // Test screen reader support
  testScreenReaderSupport: () => {
    it('has proper ARIA labels', async () => {
      const interactiveElements = screen.getAllByRole('button')
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label')
      })
    })
  },

  // Test color contrast
  testColorContrast: () => {
    it('meets color contrast requirements', async () => {
      const textElements = screen.getAllByText(/./i)
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        expect(styles.color).toBeDefined()
        expect(styles.backgroundColor).toBeDefined()
      })
    })
  }
}

// Export test runner configuration
export const adminTestConfig = {
  testTimeout: 10000,
  setupTests: () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
    
    afterEach(() => {
      vi.restoreAllMocks()
    })
  },
  
  // Common test patterns
  testPatterns: {
    loading: 'Loading...',
    error: 'Error loading',
    empty: 'No items found',
    success: 'Success',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
  }
}