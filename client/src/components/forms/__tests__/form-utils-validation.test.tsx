import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'

// Import validation utilities and form components
import { validateEmail, validatePhone, validatePassword, validateURL } from '@/lib/validation'
import { FormButton } from '../FormButton'
import { InputField } from '../InputField'
import { TextareaField } from '../TextareaField'
import { SelectDropdown } from '../SelectDropdown'
import { CheckboxField } from '../CheckboxField'
import { StandardizedForm } from '../StandardizedForm'

describe('Form Validation Utilities', () => {
  describe('Email Validation', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
      expect(validateEmail('user123@test-domain.com')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..email@example.com')).toBe(false)
      expect(validateEmail('test@example')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateEmail('a@b.co')).toBe(true) // Minimum valid format
      expect(validateEmail('very.long.email.address@very.long.domain.name.com')).toBe(true)
      expect(validateEmail('test@localhost')).toBe(false) // No TLD
      expect(validateEmail('test@127.0.0.1')).toBe(false) // IP addresses not allowed
    })
  })

  describe('Phone Validation', () => {
    it('validates common US phone formats', () => {
      expect(validatePhone('(555) 123-4567')).toBe(true)
      expect(validatePhone('555-123-4567')).toBe(true)
      expect(validatePhone('555.123.4567')).toBe(true)
      expect(validatePhone('5551234567')).toBe(true)
      expect(validatePhone('+1 555 123 4567')).toBe(true)
    })

    it('validates international phone formats', () => {
      expect(validatePhone('+44 20 7123 4567')).toBe(true)
      expect(validatePhone('+33 1 23 45 67 89')).toBe(true)
      expect(validatePhone('+61 2 1234 5678')).toBe(true)
    })

    it('rejects invalid phone formats', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc-def-ghij')).toBe(false)
      expect(validatePhone('123-456-78901')).toBe(false) // Too many digits
      expect(validatePhone('')).toBe(false)
      expect(validatePhone('555-123-456')).toBe(false) // Too few digits
    })
  })

  describe('Password Validation', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('Password123!')).toEqual({
        isValid: true,
        strength: 'strong',
        errors: []
      })
      expect(validatePassword('MySecure@Pass2023')).toEqual({
        isValid: true,
        strength: 'strong',
        errors: []
      })
    })

    it('validates medium strength passwords', () => {
      const result = validatePassword('Password123')
      expect(result.strength).toBe('medium')
      expect(result.isValid).toBe(true)
    })

    it('identifies weak passwords', () => {
      const result = validatePassword('password')
      expect(result.strength).toBe('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('validates password requirements', () => {
      const result = validatePassword('abc123')
      expect(result.errors).toContain('Password must be at least 8 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('checks for common weak patterns', () => {
      expect(validatePassword('password123').errors).toContain('Password is too common')
      expect(validatePassword('123456789').errors).toContain('Password is too common')
      expect(validatePassword('qwerty123').errors).toContain('Password is too common')
    })
  })

  describe('URL Validation', () => {
    it('validates correct URL formats', () => {
      expect(validateURL('https://example.com')).toBe(true)
      expect(validateURL('http://test.org')).toBe(true)
      expect(validateURL('https://www.google.com')).toBe(true)
      expect(validateURL('https://sub.domain.co.uk')).toBe(true)
      expect(validateURL('https://example.com/path/to/page')).toBe(true)
    })

    it('rejects invalid URL formats', () => {
      expect(validateURL('not-a-url')).toBe(false)
      expect(validateURL('ftp://example.com')).toBe(false) // FTP not allowed
      expect(validateURL('https://')).toBe(false)
      expect(validateURL('http://localhost')).toBe(false) // Localhost not allowed
      expect(validateURL('')).toBe(false)
    })

    it('handles URL with query parameters', () => {
      expect(validateURL('https://example.com?param=value')).toBe(true)
      expect(validateURL('https://example.com#section')).toBe(true)
      expect(validateURL('https://example.com/page?q=search&filter=all')).toBe(true)
    })
  })
})

describe('Form Component Integration', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('InputField Component', () => {
    it('integrates with validation utilities', async () => {
      const mockOnChange = vi.fn()
      const mockOnBlur = vi.fn()

      render(
        <InputField
          name="email"
          label="Email"
          type="email"
          value="invalid-email"
          onChange={mockOnChange}
          onBlur={mockOnBlur}
          validate={validateEmail}
        />
      )

      const input = screen.getByLabelText(/email/i)
      await user.clear(input)
      await user.type(input, 'test@example.com')

      expect(mockOnChange).toHaveBeenCalledWith('test@example.com')
    })

    it('shows real-time validation feedback', async () => {
      const mockOnChange = vi.fn()

      render(
        <InputField
          name="email"
          label="Email"
          type="email"
          value=""
          onChange={mockOnChange}
          onBlur={vi.fn()}
          validate={validateEmail}
          showValidationOnChange={true}
        />
      )

      const input = screen.getByLabelText(/email/i)
      await user.type(input, 'invalid')

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('handles async validation', async () => {
      const asyncValidate = vi.fn().mockResolvedValue({ 
        isValid: false, 
        error: 'Email already exists' 
      })

      render(
        <InputField
          name="email"
          label="Email"
          type="email"
          value="test@example.com"
          onChange={vi.fn()}
          onBlur={vi.fn()}
          asyncValidate={asyncValidate}
        />
      )

      const input = screen.getByLabelText(/email/i)
      await user.clear(input)
      await user.type(input, 'existing@example.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })
  })

  describe('TextareaField Component', () => {
    it('validates text length in real-time', async () => {
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={vi.fn()}
          onBlur={vi.fn()}
          minLength={10}
          maxLength={100}
          showCharCount={true}
        />
      )

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'Short')

      expect(screen.getByText('5 / 100')).toBeInTheDocument()
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument()
    })

    it('prevents input beyond max length', async () => {
      const mockOnChange = vi.fn()

      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={mockOnChange}
          onBlur={vi.fn()}
          maxLength={10}
          enforceMaxLength={true}
        />
      )

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'This is way too long text')

      // Should only allow 10 characters
      expect(mockOnChange).toHaveBeenLastCalledWith('This is wa')
    })
  })

  describe('SelectDropdown Component', () => {
    const options = [
      { value: '', label: 'Select an option' },
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ]

    it('validates required selection', async () => {
      render(
        <SelectDropdown
          name="category"
          label="Category"
          value=""
          onChange={vi.fn()}
          options={options}
          required={true}
          error="Please select a category"
        />
      )

      expect(screen.getByText('Please select a category')).toBeInTheDocument()
    })

    it('supports custom option validation', async () => {
      const validateOption = (value: string) => {
        if (value === 'option2') {
          return { isValid: false, error: 'Option 2 is not available' }
        }
        return { isValid: true }
      }

      render(
        <SelectDropdown
          name="category"
          label="Category"
          value="option2"
          onChange={vi.fn()}
          options={options}
          validate={validateOption}
        />
      )

      expect(screen.getByText('Option 2 is not available')).toBeInTheDocument()
    })
  })

  describe('CheckboxField Component', () => {
    it('validates required checkbox acceptance', async () => {
      render(
        <CheckboxField
          name="terms"
          label="I accept the terms and conditions"
          checked={false}
          onChange={vi.fn()}
          required={true}
          error="You must accept the terms"
        />
      )

      expect(screen.getByText('You must accept the terms')).toBeInTheDocument()
    })

    it('supports custom checkbox validation', async () => {
      const validateAge = (checked: boolean) => {
        if (!checked) {
          return { isValid: false, error: 'You must be at least 18 years old' }
        }
        return { isValid: true }
      }

      render(
        <CheckboxField
          name="age"
          label="I am at least 18 years old"
          checked={false}
          onChange={vi.fn()}
          validate={validateAge}
        />
      )

      expect(screen.getByText('You must be at least 18 years old')).toBeInTheDocument()
    })
  })

  describe('FormButton Component', () => {
    it('prevents submission when form is invalid', async () => {
      const mockOnClick = vi.fn()

      render(
        <FormButton
          type="submit"
          variant="primary"
          onClick={mockOnClick}
          disabled={true}
          disabledReason="Please fill all required fields"
        >
          Submit
        </FormButton>
      )

      await user.click(screen.getByRole('button'))

      expect(mockOnClick).not.toHaveBeenCalled()
      expect(screen.getByText('Please fill all required fields')).toBeInTheDocument()
    })

    it('handles form submission states', async () => {
      const mockOnClick = vi.fn()

      const { rerender } = render(
        <FormButton
          type="submit"
          variant="primary"
          onClick={mockOnClick}
          isLoading={false}
        >
          Submit
        </FormButton>
      )

      // Click submit
      await user.click(screen.getByRole('button'))
      expect(mockOnClick).toHaveBeenCalled()

      // Show loading state
      rerender(
        <FormButton
          type="submit"
          variant="primary"
          onClick={mockOnClick}
          isLoading={true}
          loadingText="Submitting..."
        >
          Submit
        </FormButton>
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('StandardizedForm Component', () => {
    it('validates entire form before submission', async () => {
      const mockOnSubmit = vi.fn()

      render(
        <StandardizedForm
          onSubmit={mockOnSubmit}
          validateOnSubmit={true}
        >
          <InputField
            name="email"
            label="Email"
            type="email"
            value=""
            onChange={vi.fn()}
            onBlur={vi.fn()}
            required={true}
          />
          <FormButton type="submit" variant="primary">
            Submit
          </FormButton>
        </StandardizedForm>
      )

      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Should not submit if validation fails
      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('submits form when all validation passes', async () => {
      const mockOnSubmit = vi.fn()

      render(
        <StandardizedForm
          onSubmit={mockOnSubmit}
          validateOnSubmit={true}
        >
          <InputField
            name="email"
            label="Email"
            type="email"
            value="test@example.com"
            onChange={vi.fn()}
            onBlur={vi.fn()}
            required={true}
          />
          <FormButton type="submit" variant="primary">
            Submit
          </FormButton>
        </StandardizedForm>
      )

      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com'
      })
    })

    it('handles form reset after successful submission', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })

      render(
        <StandardizedForm
          onSubmit={mockOnSubmit}
          resetOnSuccess={true}
        >
          <InputField
            name="message"
            label="Message"
            type="text"
            value="Test message"
            onChange={vi.fn()}
            onBlur={vi.fn()}
          />
          <FormButton type="submit" variant="primary">
            Submit
          </FormButton>
        </StandardizedForm>
      )

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toHaveValue('')
      })
    })
  })
})