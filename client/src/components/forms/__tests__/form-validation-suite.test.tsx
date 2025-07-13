import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Import form components
import { ContactFormStandardized } from '../ContactFormStandardized'
import { BusinessContactFormStandardized } from '../BusinessContactFormStandardized'
import { InputField } from '../InputField'
import { TextareaField } from '../TextareaField'
import { SelectDropdown } from '../SelectDropdown'
import { CheckboxField } from '../CheckboxField'
import { FormButton } from '../FormButton'

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

describe('Form Validation Suite - Priority 2', () => {
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

  describe('ContactFormStandardized Validation', () => {
    it('validates required fields', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      // Submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('validates name length constraints', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      const nameInput = screen.getByLabelText(/name/i)
      
      // Test minimum length
      await user.type(nameInput, 'A')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      })

      // Test maximum length
      await user.clear(nameInput)
      await user.type(nameInput, 'A'.repeat(101))
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Name must be less than 100 characters')).toBeInTheDocument()
      })
    })

    it('validates message length constraints', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      const messageInput = screen.getByLabelText(/message/i)
      
      // Test minimum length
      await user.type(messageInput, 'Hi')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()
      })

      // Test maximum length
      await user.clear(messageInput)
      await user.type(messageInput, 'A'.repeat(1001))
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Message must be less than 1000 characters')).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true })

      renderWithQueryClient(<ContactFormStandardized />)

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/contact', {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'This is a test message that is long enough to pass validation'
        })
      })
    })

    it('handles form submission errors', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

      renderWithQueryClient(<ContactFormStandardized />)

      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithQueryClient(<ContactFormStandardized />)

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Check loading state
      expect(screen.getByText('Sending...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    })
  })

  describe('BusinessContactFormStandardized Validation', () => {
    const mockBusiness = {
      id: 'test-business-id',
      name: 'Test Business',
      email: 'business@test.com'
    }

    it('validates business contact form fields', async () => {
      renderWithQueryClient(<BusinessContactFormStandardized business={mockBusiness} />)

      // Submit without filling fields
      await user.click(screen.getByRole('button', { name: /send inquiry/i }))

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Phone is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })

    it('validates phone number format', async () => {
      renderWithQueryClient(<BusinessContactFormStandardized business={mockBusiness} />)

      const phoneInput = screen.getByLabelText(/phone/i)
      
      // Test invalid phone formats
      await user.type(phoneInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      })

      // Test valid phone format
      await user.clear(phoneInput)
      await user.type(phoneInput, '(555) 123-4567')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument()
      })
    })

    it('validates inquiry type selection', async () => {
      renderWithQueryClient(<BusinessContactFormStandardized business={mockBusiness} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '(555) 123-4567')
      await user.type(screen.getByLabelText(/message/i), 'Test inquiry message')

      // Submit without selecting inquiry type
      await user.click(screen.getByRole('button', { name: /send inquiry/i }))

      await waitFor(() => {
        expect(screen.getByText('Please select an inquiry type')).toBeInTheDocument()
      })
    })

    it('submits business contact form successfully', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true })

      renderWithQueryClient(<BusinessContactFormStandardized business={mockBusiness} />)

      // Fill all fields
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '(555) 123-4567')
      await user.selectOptions(screen.getByLabelText(/inquiry type/i), 'general')
      await user.type(screen.getByLabelText(/message/i), 'Test inquiry message')

      await user.click(screen.getByRole('button', { name: /send inquiry/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/business-contact', {
          businessId: 'test-business-id',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          inquiryType: 'general',
          message: 'Test inquiry message'
        })
      })
    })
  })

  describe('Form Field Components Validation', () => {
    describe('InputField Component', () => {
      it('displays error message when validation fails', async () => {
        const mockOnChange = vi.fn()
        const mockOnBlur = vi.fn()

        render(
          <InputField
            name="testInput"
            label="Test Input"
            type="text"
            value=""
            onChange={mockOnChange}
            onBlur={mockOnBlur}
            error="This field is required"
            required
          />
        )

        expect(screen.getByText('This field is required')).toBeInTheDocument()
        expect(screen.getByLabelText(/test input/i)).toHaveAttribute('aria-invalid', 'true')
      })

      it('handles different input types correctly', async () => {
        const mockOnChange = vi.fn()

        const { rerender } = render(
          <InputField
            name="emailInput"
            label="Email"
            type="email"
            value=""
            onChange={mockOnChange}
            onBlur={vi.fn()}
          />
        )

        expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')

        rerender(
          <InputField
            name="passwordInput"
            label="Password"
            type="password"
            value=""
            onChange={mockOnChange}
            onBlur={vi.fn()}
          />
        )

        expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
      })

      it('applies proper accessibility attributes', () => {
        render(
          <InputField
            name="accessibleInput"
            label="Accessible Input"
            type="text"
            value=""
            onChange={vi.fn()}
            onBlur={vi.fn()}
            placeholder="Enter text here"
            required
            error="Error message"
          />
        )

        const input = screen.getByLabelText(/accessible input/i)
        expect(input).toHaveAttribute('aria-required', 'true')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAttribute('aria-describedby')
      })
    })

    describe('TextareaField Component', () => {
      it('validates textarea length constraints', async () => {
        const mockOnChange = vi.fn()

        render(
          <TextareaField
            name="testTextarea"
            label="Test Textarea"
            value=""
            onChange={mockOnChange}
            onBlur={vi.fn()}
            minLength={10}
            maxLength={100}
            error="Text must be between 10 and 100 characters"
          />
        )

        expect(screen.getByText('Text must be between 10 and 100 characters')).toBeInTheDocument()
      })

      it('shows character count when provided', () => {
        render(
          <TextareaField
            name="countedTextarea"
            label="Counted Textarea"
            value="Hello world"
            onChange={vi.fn()}
            onBlur={vi.fn()}
            maxLength={100}
            showCharCount
          />
        )

        expect(screen.getByText('11 / 100')).toBeInTheDocument()
      })
    })

    describe('SelectDropdown Component', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]

      it('displays options correctly', async () => {
        render(
          <SelectDropdown
            name="testSelect"
            label="Test Select"
            value=""
            onChange={vi.fn()}
            options={options}
          />
        )

        const select = screen.getByLabelText(/test select/i)
        await user.click(select)

        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
        expect(screen.getByText('Option 3')).toBeInTheDocument()
      })

      it('handles selection changes', async () => {
        const mockOnChange = vi.fn()

        render(
          <SelectDropdown
            name="testSelect"
            label="Test Select"
            value=""
            onChange={mockOnChange}
            options={options}
          />
        )

        await user.selectOptions(screen.getByLabelText(/test select/i), 'option2')

        expect(mockOnChange).toHaveBeenCalledWith('option2')
      })

      it('shows error state correctly', () => {
        render(
          <SelectDropdown
            name="errorSelect"
            label="Error Select"
            value=""
            onChange={vi.fn()}
            options={options}
            error="Please select an option"
          />
        )

        expect(screen.getByText('Please select an option')).toBeInTheDocument()
      })
    })

    describe('CheckboxField Component', () => {
      it('handles checkbox state changes', async () => {
        const mockOnChange = vi.fn()

        render(
          <CheckboxField
            name="testCheckbox"
            label="Test Checkbox"
            checked={false}
            onChange={mockOnChange}
          />
        )

        await user.click(screen.getByLabelText(/test checkbox/i))

        expect(mockOnChange).toHaveBeenCalledWith(true)
      })

      it('displays error message for checkbox validation', () => {
        render(
          <CheckboxField
            name="errorCheckbox"
            label="Error Checkbox"
            checked={false}
            onChange={vi.fn()}
            error="You must accept the terms"
          />
        )

        expect(screen.getByText('You must accept the terms')).toBeInTheDocument()
      })

      it('supports required checkbox validation', () => {
        render(
          <CheckboxField
            name="requiredCheckbox"
            label="Required Checkbox"
            checked={false}
            onChange={vi.fn()}
            required
          />
        )

        expect(screen.getByLabelText(/required checkbox/i)).toHaveAttribute('aria-required', 'true')
      })
    })

    describe('FormButton Component', () => {
      it('displays loading state correctly', () => {
        render(
          <FormButton
            type="submit"
            variant="default"
            isLoading={true}
            loadingText="Saving..."
          >
            Save
          </FormButton>
        )

        expect(screen.getByText('Saving...')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeDisabled()
      })

      it('handles different button variants', () => {
        const { rerender } = render(
          <FormButton type="button" variant="primary">
            Primary Button
          </FormButton>
        )

        expect(screen.getByRole('button')).toHaveClass('btn-primary')

        rerender(
          <FormButton type="button" variant="secondary">
            Secondary Button
          </FormButton>
        )

        expect(screen.getByRole('button')).toHaveClass('btn-secondary')
      })

      it('prevents submission when disabled', async () => {
        const mockOnClick = vi.fn()

        render(
          <FormButton
            type="submit"
            variant="default"
            disabled={true}
            onClick={mockOnClick}
          >
            Disabled Button
          </FormButton>
        )

        await user.click(screen.getByRole('button'))

        expect(mockOnClick).not.toHaveBeenCalled()
      })
    })
  })

  describe('Form Accessibility', () => {
    it('supports keyboard navigation', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      // Tab through form fields
      await user.tab()
      expect(screen.getByLabelText(/name/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/message/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /send message/i })).toHaveFocus()
    })

    it('announces form errors to screen readers', async () => {
      renderWithQueryClient(<ContactFormStandardized />)

      // Submit form to trigger validation
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required')
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })

    it('provides proper form labels and descriptions', () => {
      renderWithQueryClient(<ContactFormStandardized />)

      // Check that all inputs have proper labels
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()

      // Check for form description
      expect(screen.getByText(/we'll get back to you soon/i)).toBeInTheDocument()
    })
  })

  describe('Form Performance', () => {
    it('debounces validation to prevent excessive API calls', async () => {
      const mockValidation = vi.fn()
      vi.useFakeTimers()

      renderWithQueryClient(<ContactFormStandardized />)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Type rapidly
      await user.type(emailInput, 'test@')
      await user.type(emailInput, 'example.')
      await user.type(emailInput, 'com')

      // Fast-forward time
      vi.advanceTimersByTime(500)

      // Validation should be debounced
      expect(mockValidation).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('handles large form data efficiently', async () => {
      const largeMessage = 'A'.repeat(10000)
      
      renderWithQueryClient(<ContactFormStandardized />)

      const messageInput = screen.getByLabelText(/message/i)
      
      const startTime = performance.now()
      await user.type(messageInput, largeMessage)
      const endTime = performance.now()

      // Should handle large input efficiently (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
})