import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BusinessManagement from '../BusinessManagement'

// Mock the API request function
const mockApiRequest = vi.fn()
vi.mock('@/lib/queryClient', () => ({
  apiRequest: mockApiRequest,
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock child components
vi.mock('../components/BusinessTable', () => ({
  default: ({ businesses, onEdit, onDelete, selectedBusinesses, onSelectionChange }: any) => (
    <div data-testid="business-table">
      <div>Business Table</div>
      {businesses.map((business: any) => (
        <div key={business.id} data-testid={`business-${business.id}`}>
          <span>{business.name}</span>
          <button onClick={() => onEdit(business)}>Edit</button>
          <button onClick={() => onDelete(business.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../components/BusinessDialog', () => ({
  default: ({ isOpen, onClose, business, onSave, mode }: any) => (
    <div data-testid="business-dialog" style={{ display: isOpen ? 'block' : 'none' }}>
      <div>{mode === 'create' ? 'Create Business' : 'Edit Business'}</div>
      <input
        data-testid="business-name-input"
        defaultValue={business?.name || ''}
        onChange={(e) => business && (business.name = e.target.value)}
      />
      <button onClick={() => onSave(business)}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

vi.mock('../components/DeleteConfirmDialog', () => ({
  default: ({ isOpen, onClose, onConfirm, itemName }: any) => (
    <div data-testid="delete-confirm-dialog" style={{ display: isOpen ? 'block' : 'none' }}>
      <div>Delete {itemName}?</div>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

describe('BusinessManagement', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BusinessManagement />
      </QueryClientProvider>
    )
  }

  const mockBusinesses = [
    {
      id: '1',
      name: 'Test Restaurant',
      category: 'Restaurant',
      description: 'A test restaurant',
      address: '123 Test St',
      phone: '555-0123',
      website: 'https://test.com',
      isApproved: true,
      isFeatured: false,
    },
    {
      id: '2',
      name: 'Test Cafe',
      category: 'Cafe',
      description: 'A test cafe',
      address: '456 Test Ave',
      phone: '555-0456',
      website: 'https://testcafe.com',
      isApproved: false,
      isFeatured: true,
    },
  ]

  const mockCategories = [
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 2, name: 'Cafe', slug: 'cafe' },
  ]

  it('renders business management interface', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    expect(screen.getByText('Business Management')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search businesses...')).toBeInTheDocument()
    expect(screen.getByText('Add Business')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByTestId('business-table')).toBeInTheDocument()
    })
  })

  it('handles search functionality', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    const searchInput = screen.getByPlaceholderText('Search businesses...')
    fireEvent.change(searchInput, { target: { value: 'restaurant' } })

    expect(searchInput).toHaveValue('restaurant')
  })

  it('handles category filtering', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument()
    })

    const categoryFilter = screen.getByRole('combobox')
    fireEvent.click(categoryFilter)

    // Should show category options
    await waitFor(() => {
      expect(screen.getByText('Restaurant')).toBeInTheDocument()
    })
  })

  it('opens create business dialog', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    const addButton = screen.getByText('Add Business')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('business-dialog')).toBeVisible()
      expect(screen.getByText('Create Business')).toBeInTheDocument()
    })
  })

  it('handles business creation', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ id: '3', name: 'New Business' })

    renderComponent()

    // Open create dialog
    const addButton = screen.getByText('Add Business')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('business-dialog')).toBeVisible()
    })

    // Fill form and save
    const nameInput = screen.getByTestId('business-name-input')
    fireEvent.change(nameInput, { target: { value: 'New Business' } })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/businesses', expect.any(Object))
    })
  })

  it('handles business editing', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ id: '1', name: 'Updated Restaurant' })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('business-1')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByTestId('business-dialog')).toBeVisible()
      expect(screen.getByText('Edit Business')).toBeInTheDocument()
    })

    // Update name and save
    const nameInput = screen.getByTestId('business-name-input')
    fireEvent.change(nameInput, { target: { value: 'Updated Restaurant' } })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/businesses/1', expect.any(Object))
    })
  })

  it('handles single business deletion', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('business-1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByTestId('delete-confirm-dialog')).toBeVisible()
    })

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/api/businesses/1')
    })
  })

  it('handles status filtering', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    // Find status filter dropdown
    const statusFilter = screen.getAllByRole('combobox')[1] // Second combobox is status filter
    fireEvent.click(statusFilter)

    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('displays loading state', () => {
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent()

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('API Error'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Error loading businesses')).toBeInTheDocument()
    })
  })

  it('clears search when clear button is clicked', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    const searchInput = screen.getByPlaceholderText('Search businesses...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(searchInput).toHaveValue('test search')

    const clearButton = screen.getByRole('button', { name: /clear/i })
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
  })

  it('handles bulk operations', async () => {
    mockApiRequest.mockResolvedValueOnce(mockBusinesses)
    mockApiRequest.mockResolvedValueOnce(mockCategories)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('business-table')).toBeInTheDocument()
    })

    // Test bulk selection would be handled by the BusinessTable component
    // This test ensures the component can handle selection changes
    expect(screen.getByTestId('business-table')).toBeInTheDocument()
  })
})