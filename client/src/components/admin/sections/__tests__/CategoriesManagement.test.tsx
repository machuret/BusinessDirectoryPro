import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CategoriesManagement from '../CategoriesManagement'

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

describe('CategoriesManagement', () => {
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
        <CategoriesManagement />
      </QueryClientProvider>
    )
  }

  const mockCategories = [
    {
      id: 1,
      name: 'Restaurant',
      slug: 'restaurant',
      description: 'Food and dining establishments',
      isActive: true,
      businessCount: 45,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Retail',
      slug: 'retail',
      description: 'Shopping and retail stores',
      isActive: true,
      businessCount: 32,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      name: 'Services',
      slug: 'services',
      description: 'Professional services',
      isActive: false,
      businessCount: 18,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ]

  it('renders categories management interface', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    expect(screen.getByText('Categories Management')).toBeInTheDocument()
    expect(screen.getByText('Manage business categories')).toBeInTheDocument()
    expect(screen.getByText('Add Category')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Restaurant')).toBeInTheDocument()
      expect(screen.getByText('Retail')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
    })
  })

  it('displays category information correctly', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Food and dining establishments')).toBeInTheDocument()
      expect(screen.getByText('Shopping and retail stores')).toBeInTheDocument()
      expect(screen.getByText('Professional services')).toBeInTheDocument()
    })

    // Check business counts
    expect(screen.getByText('45 businesses')).toBeInTheDocument()
    expect(screen.getByText('32 businesses')).toBeInTheDocument()
    expect(screen.getByText('18 businesses')).toBeInTheDocument()

    // Check status indicators
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('opens create category dialog', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    const addButton = screen.getByText('Add Category')
    fireEvent.click(addButton)

    expect(screen.getByText('Create Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Category Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('handles category creation', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ id: 4, name: 'Healthcare', slug: 'healthcare' })

    renderComponent()

    // Open create dialog
    fireEvent.click(screen.getByText('Add Category'))

    // Fill form
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Healthcare' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Medical and healthcare services' } })

    // Submit
    fireEvent.click(screen.getByText('Create Category'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/admin/categories', {
        name: 'Healthcare',
        description: 'Medical and healthcare services',
        isActive: true,
      })
    })
  })

  it('handles category editing', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ id: 1, name: 'Updated Restaurant' })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Restaurant')).toBeInTheDocument()
    })

    // Find and click edit button
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    // Update name
    fireEvent.change(screen.getByDisplayValue('Restaurant'), { target: { value: 'Updated Restaurant' } })

    // Save changes
    fireEvent.click(screen.getByText('Update Category'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/categories/1', {
        name: 'Updated Restaurant',
        description: 'Food and dining establishments',
        isActive: true,
      })
    })
  })

  it('handles category activation/deactivation', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ id: 3, isActive: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Services')).toBeInTheDocument()
    })

    // Find activate button for inactive category
    const activateButton = screen.getByText('Activate')
    fireEvent.click(activateButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/categories/3', {
        isActive: true,
      })
    })
  })

  it('handles category deletion', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Services')).toBeInTheDocument()
    })

    // Find and click delete button
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[2]) // Third category (Services)

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Category'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/api/admin/categories/3')
    })
  })

  it('prevents deletion of categories with businesses', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Restaurant')).toBeInTheDocument()
    })

    // Try to delete category with businesses
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0]) // Restaurant category

    expect(screen.getByText('Cannot delete category with existing businesses')).toBeInTheDocument()
  })

  it('auto-generates slug from name', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    fireEvent.click(screen.getByText('Add Category'))

    // Enter category name
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Health & Wellness' } })

    // Check that slug is auto-generated
    expect(screen.getByDisplayValue('health-wellness')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    fireEvent.click(screen.getByText('Add Category'))

    // Try to submit without name
    fireEvent.click(screen.getByText('Create Category'))

    await waitFor(() => {
      expect(screen.getByText('Category name is required')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent()

    expect(screen.getByText('Loading categories...')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Failed to load categories'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Error loading categories')).toBeInTheDocument()
    })
  })

  it('filters categories by status', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument()
    })

    const statusFilter = screen.getByDisplayValue('All Categories')
    fireEvent.click(statusFilter)

    expect(screen.getByText('Active Only')).toBeInTheDocument()
    expect(screen.getByText('Inactive Only')).toBeInTheDocument()
  })

  it('sorts categories by different criteria', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Sort by Name')).toBeInTheDocument()
    })

    const sortSelect = screen.getByDisplayValue('Sort by Name')
    fireEvent.click(sortSelect)

    expect(screen.getByText('Sort by Business Count')).toBeInTheDocument()
    expect(screen.getByText('Sort by Date Created')).toBeInTheDocument()
  })

  it('displays category statistics', async () => {
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Total Categories: 3')).toBeInTheDocument()
      expect(screen.getByText('Active: 2')).toBeInTheDocument()
      expect(screen.getByText('Inactive: 1')).toBeInTheDocument()
      expect(screen.getByText('Total Businesses: 95')).toBeInTheDocument()
    })
  })
})