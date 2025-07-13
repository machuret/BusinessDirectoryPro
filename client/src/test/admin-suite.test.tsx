import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  adminTestUtils, 
  generateMockData, 
  performanceTestUtils, 
  accessibilityTestUtils,
  adminTestConfig
} from './admin-test-runner'

// Import admin components
import BusinessManagement from '@/components/admin/business-management/BusinessManagement'
import CategoriesManagement from '@/components/admin/sections/CategoriesManagement'
import UserManagement from '@/components/admin/sections/UserManagement'
import ReviewsManagement from '@/components/admin/sections/ReviewsManagement'

// Mock API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Setup test configuration
adminTestConfig.setupTests()

describe('Admin Panel Test Suite', () => {
  let queryClient: QueryClient
  const mockApiRequest = vi.mocked(await import('@/lib/queryClient')).apiRequest

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  describe('Business Management Integration', () => {
    const mockBusinesses = [
      generateMockData.business(),
      generateMockData.business({ id: 'bus-2', name: 'Test Cafe', category: 'Cafe' }),
      generateMockData.business({ id: 'bus-3', name: 'Test Shop', category: 'Retail', isApproved: false }),
    ]

    const mockCategories = [
      generateMockData.category(),
      generateMockData.category({ id: 2, name: 'Cafe', slug: 'cafe' }),
      generateMockData.category({ id: 3, name: 'Retail', slug: 'retail' }),
    ]

    it('loads and displays business data', async () => {
      mockApiRequest.mockResolvedValueOnce(mockBusinesses)
      mockApiRequest.mockResolvedValueOnce(mockCategories)

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Test Business')).toBeInTheDocument()
        expect(screen.getByText('Test Cafe')).toBeInTheDocument()
        expect(screen.getByText('Test Shop')).toBeInTheDocument()
      })
    })

    it('handles business search and filtering', async () => {
      mockApiRequest.mockResolvedValueOnce(mockBusinesses)
      mockApiRequest.mockResolvedValueOnce(mockCategories)

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search businesses...')).toBeInTheDocument()
      })

      adminTestUtils.testSearchFunctionality('Search businesses...')
    })

    it('performs CRUD operations', async () => {
      mockApiRequest.mockResolvedValueOnce(mockBusinesses)
      mockApiRequest.mockResolvedValueOnce(mockCategories)

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Add Business')).toBeInTheDocument()
      })

      // Test create
      fireEvent.click(screen.getByText('Add Business'))
      expect(screen.getByText('Create Business')).toBeInTheDocument()

      // Test edit
      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit')
        expect(editButtons.length).toBeGreaterThan(0)
      })
    })

    performanceTestUtils.testRenderingPerformance(<BusinessManagement />)
  })

  describe('Categories Management Integration', () => {
    const mockCategories = [
      generateMockData.category(),
      generateMockData.category({ id: 2, name: 'Services', slug: 'services', businessCount: 12 }),
      generateMockData.category({ id: 3, name: 'Retail', slug: 'retail', isActive: false }),
    ]

    it('manages categories effectively', async () => {
      mockApiRequest.mockResolvedValueOnce(mockCategories)

      adminTestUtils.renderWithQueryClient(<CategoriesManagement />)

      await waitFor(() => {
        expect(screen.getByText('Categories Management')).toBeInTheDocument()
        expect(screen.getByText('Test Category')).toBeInTheDocument()
        expect(screen.getByText('Services')).toBeInTheDocument()
        expect(screen.getByText('Retail')).toBeInTheDocument()
      })
    })

    it('handles category status changes', async () => {
      mockApiRequest.mockResolvedValueOnce(mockCategories)
      mockApiRequest.mockResolvedValueOnce({ id: 3, isActive: true })

      adminTestUtils.renderWithQueryClient(<CategoriesManagement />)

      await waitFor(() => {
        expect(screen.getByText('Activate')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Activate'))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/categories/3', {
          isActive: true,
        })
      })
    })

    accessibilityTestUtils.testKeyboardNavigation()
  })

  describe('User Management Integration', () => {
    const mockUsers = [
      generateMockData.user(),
      generateMockData.user({ id: 'user-2', email: 'admin@test.com', role: 'admin' }),
      generateMockData.user({ id: 'user-3', email: 'inactive@test.com', isActive: false }),
    ]

    it('displays user information', async () => {
      mockApiRequest.mockResolvedValueOnce(mockUsers)

      adminTestUtils.renderWithQueryClient(<UserManagement />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('admin@test.com')).toBeInTheDocument()
        expect(screen.getByText('inactive@test.com')).toBeInTheDocument()
      })
    })

    it('handles user role changes', async () => {
      mockApiRequest.mockResolvedValueOnce(mockUsers)
      mockApiRequest.mockResolvedValueOnce({ id: 'user-1', role: 'admin' })

      adminTestUtils.renderWithQueryClient(<UserManagement />)

      await waitFor(() => {
        expect(screen.getByText('Make Admin')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Make Admin'))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/users/user-1', {
          role: 'admin',
        })
      })
    })

    adminTestUtils.testBulkOperations(mockUsers)
  })

  describe('Reviews Management Integration', () => {
    const mockReviews = [
      generateMockData.review(),
      generateMockData.review({ id: 'review-2', rating: 2, isApproved: false, isFlagged: true }),
      generateMockData.review({ id: 'review-3', rating: 4, customerName: 'Jane Doe' }),
    ]

    it('manages reviews effectively', async () => {
      mockApiRequest.mockResolvedValueOnce(mockReviews)

      adminTestUtils.renderWithQueryClient(<ReviewsManagement />)

      await waitFor(() => {
        expect(screen.getByText('Reviews Management')).toBeInTheDocument()
        expect(screen.getByText('Test Customer')).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      })
    })

    it('handles review moderation', async () => {
      mockApiRequest.mockResolvedValueOnce(mockReviews)
      mockApiRequest.mockResolvedValueOnce({ id: 'review-2', isApproved: true })

      adminTestUtils.renderWithQueryClient(<ReviewsManagement />)

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Approve'))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/reviews/review-2', {
          isApproved: true,
        })
      })
    })

    it('displays review statistics', async () => {
      mockApiRequest.mockResolvedValueOnce(mockReviews)

      adminTestUtils.renderWithQueryClient(<ReviewsManagement />)

      await waitFor(() => {
        expect(screen.getByText('Total Reviews: 3')).toBeInTheDocument()
        expect(screen.getByText('Approved: 2')).toBeInTheDocument()
        expect(screen.getByText('Flagged: 1')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('API Error'))

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Error loading businesses')).toBeInTheDocument()
      })
    })

    it('shows loading states', () => {
      adminTestUtils.mockLoadingResponse(200)

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('handles network connectivity issues', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Network Error'))

      adminTestUtils.renderWithQueryClient(<CategoriesManagement />)

      await waitFor(() => {
        expect(screen.getByText('Error loading categories')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Tests', () => {
    it('renders components within performance threshold', async () => {
      const startTime = performance.now()
      
      adminTestUtils.renderWithQueryClient(<BusinessManagement />)
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Less than 1 second
    })

    it('handles large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        generateMockData.business({ id: `bus-${i}`, name: `Business ${i}` })
      )

      mockApiRequest.mockResolvedValueOnce(largeDataset)
      mockApiRequest.mockResolvedValueOnce([])

      const startTime = performance.now()
      adminTestUtils.renderWithQueryClient(<BusinessManagement />)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(2000) // Less than 2 seconds for large dataset
    })
  })

  describe('Accessibility Tests', () => {
    it('meets accessibility standards', async () => {
      mockApiRequest.mockResolvedValueOnce([])

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /business management/i })).toBeInTheDocument()

      // Check for proper form labels
      const searchInput = screen.getByPlaceholderText('Search businesses...')
      expect(searchInput).toHaveAttribute('aria-label')
    })

    accessibilityTestUtils.testKeyboardNavigation()
    accessibilityTestUtils.testScreenReaderSupport()
  })

  describe('Data Validation', () => {
    it('validates form inputs', async () => {
      mockApiRequest.mockResolvedValueOnce([])
      mockApiRequest.mockResolvedValueOnce([])

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Add Business')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Business'))

      // Try to submit without required fields
      fireEvent.click(screen.getByText('Create Business'))

      await waitFor(() => {
        expect(screen.getByText('Business name is required')).toBeInTheDocument()
      })
    })

    it('prevents invalid data submission', async () => {
      mockApiRequest.mockResolvedValueOnce([])
      mockApiRequest.mockResolvedValueOnce([])

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Add Business')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Business'))

      // Enter invalid phone number
      const phoneInput = screen.getByLabelText('Phone')
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } })
      fireEvent.blur(phoneInput)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      })
    })
  })

  describe('Integration Tests', () => {
    it('integrates with authentication system', async () => {
      // Mock authentication check
      mockApiRequest.mockResolvedValueOnce({ user: { role: 'admin' } })
      mockApiRequest.mockResolvedValueOnce([])

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/auth/user')
      })
    })

    it('handles session expiration', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Unauthorized'))

      adminTestUtils.renderWithQueryClient(<BusinessManagement />)

      await waitFor(() => {
        expect(screen.getByText('Session expired. Please login again.')).toBeInTheDocument()
      })
    })
  })
})