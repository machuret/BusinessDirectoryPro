import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminHomepage from '../homepage'

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

describe('AdminHomepage', () => {
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
        <AdminHomepage />
      </QueryClientProvider>
    )
  }

  const mockHomepageSettings = {
    heroTitle: 'Welcome to Our Business Directory',
    heroSubtitle: 'Discover amazing local businesses',
    heroImage: '/hero-image.jpg',
    featuredBusinessesCount: 6,
    showCategories: true,
    showRecentBusinesses: true,
    showTestimonials: true,
    testimonials: [
      {
        id: 1,
        name: 'John Doe',
        comment: 'Great platform!',
        rating: 5,
        business: 'Local Restaurant',
      },
    ],
  }

  it('renders homepage management interface', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)

    renderComponent()

    expect(screen.getByText('Homepage Management')).toBeInTheDocument()
    expect(screen.getByText('Configure homepage content and layout')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Welcome to Our Business Directory')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Discover amazing local businesses')).toBeInTheDocument()
    })
  })

  it('updates hero section', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)
    mockApiRequest.mockResolvedValueOnce({ success: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Welcome to Our Business Directory')).toBeInTheDocument()
    })

    // Update hero title
    const titleInput = screen.getByDisplayValue('Welcome to Our Business Directory')
    fireEvent.change(titleInput, { target: { value: 'Updated Hero Title' } })

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('PUT', '/api/admin/homepage', {
        heroTitle: 'Updated Hero Title',
        heroSubtitle: 'Discover amazing local businesses',
        heroImage: '/hero-image.jpg',
        featuredBusinessesCount: 6,
        showCategories: true,
        showRecentBusinesses: true,
        showTestimonials: true,
        testimonials: mockHomepageSettings.testimonials,
      })
    })
  })

  it('handles testimonials management', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Testimonials')).toBeInTheDocument()
    })

    // Add new testimonial
    fireEvent.click(screen.getByText('Add Testimonial'))

    expect(screen.getByText('Add New Testimonial')).toBeInTheDocument()
    expect(screen.getByLabelText('Customer Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Comment')).toBeInTheDocument()
    expect(screen.getByLabelText('Rating')).toBeInTheDocument()
  })

  it('manages featured businesses count', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('6')).toBeInTheDocument()
    })

    const countInput = screen.getByDisplayValue('6')
    fireEvent.change(countInput, { target: { value: '8' } })

    expect(countInput).toHaveValue('8')
  })

  it('toggles section visibility', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByLabelText('Show Categories')).toBeChecked()
    })

    const categoriesToggle = screen.getByLabelText('Show Categories')
    fireEvent.click(categoriesToggle)

    expect(categoriesToggle).not.toBeChecked()
  })

  it('handles image upload', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)
    mockApiRequest.mockResolvedValueOnce({ url: '/new-hero-image.jpg' })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Upload Hero Image')).toBeInTheDocument()
    })

    // Mock file upload
    const fileInput = screen.getByLabelText('Hero Image')
    const file = new File(['image'], 'hero.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/admin/upload', expect.any(FormData))
    })
  })

  it('previews homepage changes', async () => {
    mockApiRequest.mockResolvedValueOnce(mockHomepageSettings)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Preview Changes')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Preview Changes'))

    expect(screen.getByText('Homepage Preview')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent()

    expect(screen.getByText('Loading homepage settings...')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Failed to load homepage'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Error loading homepage settings')).toBeInTheDocument()
    })
  })
})