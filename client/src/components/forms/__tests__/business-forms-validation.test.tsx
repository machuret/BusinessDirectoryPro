import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Import business form components
import ClaimBusinessForm from '../../ClaimBusinessForm-migrated'
import { BusinessContactFormStandardized } from '../BusinessContactFormStandardized'
import BusinessRegistrationForm from '../../business/BusinessRegistrationForm'
import ReviewForm from '../../review-form-migrated'

// Mock API request function
const mockApiRequest = vi.fn()
vi.mock('@/lib/queryClient', () => ({
  apiRequest: mockApiRequest,
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock file upload
vi.mock('@/lib/upload', () => ({
  uploadFile: vi.fn(),
}))

describe('Business Forms Validation Suite', () => {
  let queryClient: QueryClient
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('ClaimBusinessForm Validation', () => {
    const mockBusiness = {
      id: 'test-business-id',
      name: 'Test Business',
      address: '123 Test St',
      phone: '(555) 123-4567'
    }

    it('validates required claim form fields', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      // Submit without filling required fields
      await user.click(screen.getByRole('button', { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Phone is required')).toBeInTheDocument()
        expect(screen.getByText('Relationship to business is required')).toBeInTheDocument()
      })
    })

    it('validates email format in claim form', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email-format')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('validates phone number format in claim form', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      })
    })

    it('validates business relationship selection', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      // Fill required fields except relationship
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '(555) 123-4567')

      await user.click(screen.getByRole('button', { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText('Please select your relationship to the business')).toBeInTheDocument()
      })
    })

    it('validates file upload requirements', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '(555) 123-4567')
      await user.selectOptions(screen.getByLabelText(/relationship/i), 'owner')

      // Submit without uploading verification documents
      await user.click(screen.getByRole('button', { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText('Please upload verification documents')).toBeInTheDocument()
      })
    })

    it('validates file type and size restrictions', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      const fileInput = screen.getByLabelText(/upload verification/i)
      
      // Test invalid file type
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' })
      await user.upload(fileInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText('Only PDF, JPG, and PNG files are allowed')).toBeInTheDocument()
      })

      // Test file size limit
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument()
      })
    })

    it('submits claim form with valid data', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true, claimId: 'claim-123' })

      renderWithQueryClient(<ClaimBusinessForm business={mockBusiness} />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '(555) 123-4567')
      await user.selectOptions(screen.getByLabelText(/relationship/i), 'owner')
      await user.type(screen.getByLabelText(/additional information/i), 'I am the owner of this business')

      // Upload valid file
      const validFile = new File(['content'], 'verification.pdf', { type: 'application/pdf' })
      await user.upload(screen.getByLabelText(/upload verification/i), validFile)

      await user.click(screen.getByRole('button', { name: /submit claim/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/business-claims', {
          businessId: 'test-business-id',
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          relationship: 'owner',
          additionalInfo: 'I am the owner of this business',
          verificationDocuments: expect.any(Array)
        })
      })
    })
  })

  describe('BusinessRegistrationForm Validation', () => {
    it('validates business registration required fields', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      await user.click(screen.getByRole('button', { name: /register business/i }))

      await waitFor(() => {
        expect(screen.getByText('Business name is required')).toBeInTheDocument()
        expect(screen.getByText('Category is required')).toBeInTheDocument()
        expect(screen.getByText('Address is required')).toBeInTheDocument()
        expect(screen.getByText('Phone is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('validates business name uniqueness', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Business name already exists'))

      renderWithQueryClient(<BusinessRegistrationForm />)

      await user.type(screen.getByLabelText(/business name/i), 'Existing Business')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('This business name is already registered')).toBeInTheDocument()
      })
    })

    it('validates business hours format', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      const mondayOpenInput = screen.getByLabelText(/monday open/i)
      await user.type(mondayOpenInput, '25:00')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid time (HH:MM)')).toBeInTheDocument()
      })
    })

    it('validates website URL format', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      const websiteInput = screen.getByLabelText(/website/i)
      await user.type(websiteInput, 'not-a-valid-url')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument()
      })
    })

    it('validates business description length', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Test minimum length
      await user.type(descriptionInput, 'Too short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Description must be at least 20 characters')).toBeInTheDocument()
      })

      // Test maximum length
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'A'.repeat(1001))
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Description must be less than 1000 characters')).toBeInTheDocument()
      })
    })

    it('validates photo upload requirements', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      const photoInput = screen.getByLabelText(/business photos/i)
      
      // Test invalid file type
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      await user.upload(photoInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText('Only image files (JPG, PNG, WEBP) are allowed')).toBeInTheDocument()
      })

      // Test file size limit
      const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      await user.upload(photoInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText('Image size must be less than 2MB')).toBeInTheDocument()
      })
    })

    it('validates maximum number of photos', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      const photoInput = screen.getByLabelText(/business photos/i)
      
      // Upload more than allowed photos
      const photos = Array.from({ length: 11 }, (_, i) => 
        new File(['content'], `photo${i}.jpg`, { type: 'image/jpeg' })
      )
      
      await user.upload(photoInput, photos)

      await waitFor(() => {
        expect(screen.getByText('Maximum 10 photos allowed')).toBeInTheDocument()
      })
    })
  })

  describe('ReviewForm Validation', () => {
    const mockBusiness = {
      id: 'test-business-id',
      name: 'Test Business'
    }

    it('validates review form required fields', async () => {
      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      await user.click(screen.getByRole('button', { name: /submit review/i }))

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Rating is required')).toBeInTheDocument()
        expect(screen.getByText('Review comment is required')).toBeInTheDocument()
      })
    })

    it('validates rating selection', async () => {
      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      // Fill other fields but not rating
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/review/i), 'This is a good business')

      await user.click(screen.getByRole('button', { name: /submit review/i }))

      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument()
      })
    })

    it('validates review comment length', async () => {
      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      const reviewInput = screen.getByLabelText(/review/i)
      
      // Test minimum length
      await user.type(reviewInput, 'Too short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument()
      })

      // Test maximum length
      await user.clear(reviewInput)
      await user.type(reviewInput, 'A'.repeat(1001))
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Review must be less than 1000 characters')).toBeInTheDocument()
      })
    })

    it('validates email format in review form', async () => {
      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('submits review with valid data', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true, reviewId: 'review-123' })

      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByLabelText(/5 stars/i))
      await user.type(screen.getByLabelText(/review/i), 'This is an excellent business with great service')

      await user.click(screen.getByRole('button', { name: /submit review/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/reviews', {
          businessId: 'test-business-id',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          rating: 5,
          comment: 'This is an excellent business with great service'
        })
      })
    })

    it('prevents duplicate reviews from same email', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('You have already reviewed this business'))

      renderWithQueryClient(<ReviewForm business={mockBusiness} />)

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByLabelText(/5 stars/i))
      await user.type(screen.getByLabelText(/review/i), 'This is an excellent business')

      await user.click(screen.getByRole('button', { name: /submit review/i }))

      await waitFor(() => {
        expect(screen.getByText('You have already reviewed this business')).toBeInTheDocument()
      })
    })
  })

  describe('Form Integration Testing', () => {
    it('validates form state persistence across navigation', async () => {
      renderWithQueryClient(<BusinessRegistrationForm />)

      // Fill some fields
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')

      // Simulate navigation away and back
      const { rerender } = renderWithQueryClient(<div>Other page</div>)
      rerender(<BusinessRegistrationForm />)

      // Check if form state is preserved (if implemented)
      expect(screen.getByLabelText(/business name/i)).toHaveValue('Test Business')
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')
    })

    it('handles concurrent form submissions', async () => {
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      renderWithQueryClient(<ReviewForm business={{ id: 'test', name: 'Test' }} />)

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByLabelText(/5 stars/i))
      await user.type(screen.getByLabelText(/review/i), 'Great business')

      // Submit multiple times rapidly
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only submit once
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledTimes(1)
      })
    })

    it('validates form accessibility with screen readers', async () => {
      renderWithQueryClient(<ClaimBusinessForm business={{ id: 'test', name: 'Test' }} />)

      // Check for proper ARIA attributes
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Business Claim Form')
      
      // Check for fieldset grouping
      expect(screen.getByRole('group', { name: /personal information/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /business relationship/i })).toBeInTheDocument()
    })
  })
})