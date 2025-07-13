import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReviewsManagement from '../ReviewsManagement'

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('ReviewsManagement', () => {
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

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReviewsManagement />
      </QueryClientProvider>
    )
  }

  const mockReviews = [
    {
      id: '1',
      businessId: 'bus1',
      businessName: 'Test Restaurant',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      rating: 5,
      comment: 'Excellent food and service!',
      isApproved: true,
      isFlagged: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      businessId: 'bus2',
      businessName: 'Test Cafe',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      rating: 2,
      comment: 'Poor service and cold food.',
      isApproved: false,
      isFlagged: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      businessId: 'bus1',
      businessName: 'Test Restaurant',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      rating: 4,
      comment: 'Good experience overall.',
      isApproved: true,
      isFlagged: false,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ]

  it('renders reviews management interface', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    expect(screen.getByText('Reviews Management')).toBeInTheDocument()
    expect(screen.getByText('Manage customer reviews')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search reviews...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })
  })

  it('displays review information correctly', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
      expect(screen.getByText('Test Cafe')).toBeInTheDocument()
      expect(screen.getByText('Excellent food and service!')).toBeInTheDocument()
      expect(screen.getByText('Poor service and cold food.')).toBeInTheDocument()
    })

    // Check ratings
    expect(screen.getByText('5 stars')).toBeInTheDocument()
    expect(screen.getByText('2 stars')).toBeInTheDocument()
    expect(screen.getByText('4 stars')).toBeInTheDocument()

    // Check status indicators
    expect(screen.getAllByText('Approved')).toHaveLength(2)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Flagged')).toBeInTheDocument()
  })

  it('handles review search', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    const searchInput = screen.getByPlaceholderText('Search reviews...')
    fireEvent.change(searchInput, { target: { value: 'excellent' } })

    expect(searchInput).toHaveValue('excellent')
  })

  it('filters reviews by status', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('All Reviews')).toBeInTheDocument()
    })

    const statusFilter = screen.getByDisplayValue('All Reviews')
    fireEvent.click(statusFilter)

    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Flagged')).toBeInTheDocument()
  })

  it('filters reviews by rating', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('All Ratings')).toBeInTheDocument()
    })

    const ratingFilter = screen.getByDisplayValue('All Ratings')
    fireEvent.click(ratingFilter)

    expect(screen.getByText('5 Stars')).toBeInTheDocument()
    expect(screen.getByText('4 Stars')).toBeInTheDocument()
    expect(screen.getByText('3 Stars')).toBeInTheDocument()
    expect(screen.getByText('2 Stars')).toBeInTheDocument()
    expect(screen.getByText('1 Star')).toBeInTheDocument()
  })

  it('handles review approval', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ id: '2', isApproved: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Find approve button for pending review
    const approveButton = screen.getByText('Approve')
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/reviews/2', {
        isApproved: true,
      })
    })
  })

  it('handles review rejection', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ id: '1', isApproved: false })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find reject button for approved review
    const rejectButton = screen.getByText('Reject')
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/reviews/1', {
        isApproved: false,
      })
    })
  })

  it('handles review flagging', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ id: '1', isFlagged: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find flag button
    const flagButton = screen.getByText('Flag')
    fireEvent.click(flagButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/reviews/1', {
        isFlagged: true,
      })
    })
  })

  it('handles review deletion', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Find and click delete button
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Review'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/api/admin/reviews/2')
    })
  })

  it('opens review detail modal', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click on review to open details
    fireEvent.click(screen.getByText('Excellent food and service!'))

    expect(screen.getByText('Review Details')).toBeInTheDocument()
    expect(screen.getByText('Customer: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Business: Test Restaurant')).toBeInTheDocument()
    expect(screen.getByText('Rating: 5 stars')).toBeInTheDocument()
  })

  it('handles bulk approval', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Select multiple reviews
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // Select first review
    fireEvent.click(checkboxes[2]) // Select second review

    // Bulk approve
    fireEvent.click(screen.getByText('Bulk Approve'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/reviews/bulk', {
        ids: ['1', '2'],
        action: 'approve',
      })
    })
  })

  it('handles bulk deletion', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Select multiple reviews
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])

    // Bulk delete
    fireEvent.click(screen.getByText('Bulk Delete'))

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Selected'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/api/admin/reviews/bulk', {
        ids: ['1', '2'],
      })
    })
  })

  it('displays review statistics', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Total Reviews: 3')).toBeInTheDocument()
      expect(screen.getByText('Approved: 2')).toBeInTheDocument()
      expect(screen.getByText('Pending: 1')).toBeInTheDocument()
      expect(screen.getByText('Flagged: 1')).toBeInTheDocument()
      expect(screen.getByText('Average Rating: 3.7')).toBeInTheDocument()
    })
  })

  it('handles loading state', () => {
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent()

    expect(screen.getByText('Loading reviews...')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Failed to load reviews'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Error loading reviews')).toBeInTheDocument()
    })
  })

  it('sorts reviews by date', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Sort by Date')).toBeInTheDocument()
    })

    const sortSelect = screen.getByDisplayValue('Sort by Date')
    fireEvent.click(sortSelect)

    expect(screen.getByText('Sort by Rating')).toBeInTheDocument()
    expect(screen.getByText('Sort by Business')).toBeInTheDocument()
    expect(screen.getByText('Sort by Customer')).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    mockApiRequest.mockResolvedValueOnce(mockReviews)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    })

    // Test pagination controls exist
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })
})