import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { ContactForm } from './ContactForm'

// Mock the validation schemas
vi.mock('@/lib/validation-schemas', () => ({
  contactFormSchema: {
    parse: vi.fn((data) => data),
  }
}))

describe('ContactForm Component', () => {
  const defaultProps = {
    businessId: 'test-business-1',
    businessName: 'Test Business'
  }

  it('renders form fields correctly', () => {
    render(<ContactForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ContactForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<ContactForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockSubmit = vi.fn()
    render(<ContactForm {...defaultProps} onSubmit={mockSubmit} />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/phone/i), { 
      target: { value: '555-0123' } 
    })
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: 'Hello, I would like more information.' } 
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
        message: 'Hello, I would like more information.',
        businessId: 'test-business-1'
      })
    })
  })

  it('shows loading state during submission', async () => {
    const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<ContactForm {...defaultProps} onSubmit={slowSubmit} />)
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    // Check loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText(/sending/i)).not.toBeInTheDocument()
    })
  })

  it('handles submission errors gracefully', async () => {
    const errorSubmit = vi.fn(() => Promise.reject(new Error('Network error')))
    render(<ContactForm {...defaultProps} onSubmit={errorSubmit} />)
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })

  it('displays success message after successful submission', async () => {
    const successSubmit = vi.fn(() => Promise.resolve())
    render(<ContactForm {...defaultProps} onSubmit={successSubmit} />)
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
    })
  })

  it('resets form after successful submission', async () => {
    const successSubmit = vi.fn(() => Promise.resolve())
    render(<ContactForm {...defaultProps} onSubmit={successSubmit} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const messageInput = screen.getByLabelText(/message/i)

    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
      expect(emailInput).toHaveValue('')
      expect(messageInput).toHaveValue('')
    })
  })
})