import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Import auth components
import LoginForm from '../../admin/AdminLogin'
import RegisterForm from '../../business/BusinessRegistrationForm'

// Mock API request function
const mockApiRequest = vi.fn()
vi.mock('@/lib/queryClient', () => ({
  apiRequest: mockApiRequest,
}))

// Mock router
const mockNavigate = vi.fn()
vi.mock('wouter', () => ({
  useLocation: () => ['/login', mockNavigate],
  useRoute: () => [false, {}],
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock auth context
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}))

describe('Authentication Forms Validation Suite', () => {
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

  describe('Login Form Validation', () => {
    it('validates required login fields', async () => {
      renderWithQueryClient(<LoginForm />)

      // Submit without filling fields
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })

    it('validates email format in login', async () => {
      renderWithQueryClient(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email-format')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('validates password minimum length', async () => {
      renderWithQueryClient(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('handles successful login', async () => {
      mockApiRequest.mockResolvedValueOnce({ 
        success: true, 
        user: { id: 'user-1', email: 'admin@test.com', role: 'admin' }
      })

      renderWithQueryClient(<LoginForm />)

      // Fill valid credentials
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
          email: 'admin@test.com',
          password: 'password123'
        })
      })
    })

    it('handles login errors', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Invalid credentials'))

      renderWithQueryClient(<LoginForm />)

      // Fill credentials
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })

    it('shows loading state during login', async () => {
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithQueryClient(<LoginForm />)

      // Fill and submit
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Check loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })

    it('prevents multiple login attempts', async () => {
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      renderWithQueryClient(<LoginForm />)

      // Fill form
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit multiple times
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only call API once
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledTimes(1)
      })
    })

    it('toggles password visibility', async () => {
      renderWithQueryClient(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click toggle to show password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click toggle to hide password again
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('handles remember me functionality', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true })

      renderWithQueryClient(<LoginForm />)

      // Check remember me checkbox
      const rememberCheckbox = screen.getByLabelText(/remember me/i)
      await user.click(rememberCheckbox)

      // Fill and submit
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
          email: 'admin@test.com',
          password: 'password123',
          rememberMe: true
        })
      })
    })
  })

  describe('Password Strength Validation', () => {
    it('validates password strength requirements', async () => {
      renderWithQueryClient(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/password/i)

      // Test weak password
      await user.type(passwordInput, '123456')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument()
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument()
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument()
        expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument()
      })
    })

    it('shows password strength indicator', async () => {
      renderWithQueryClient(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/password/i)

      // Test weak password
      await user.type(passwordInput, '123456')
      expect(screen.getByText('Weak')).toBeInTheDocument()

      // Test medium password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'Password123')
      expect(screen.getByText('Medium')).toBeInTheDocument()

      // Test strong password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'Password123!')
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    it('validates password confirmation match', async () => {
      renderWithQueryClient(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })
  })

  describe('Registration Form Validation', () => {
    it('validates required registration fields', async () => {
      renderWithQueryClient(<RegisterForm />)

      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
      })
    })

    it('validates email uniqueness', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Email already exists'))

      renderWithQueryClient(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'existing@example.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('This email is already registered')).toBeInTheDocument()
      })
    })

    it('validates terms and conditions acceptance', async () => {
      renderWithQueryClient(<RegisterForm />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!')

      // Don't accept terms
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('You must accept the terms and conditions')).toBeInTheDocument()
      })
    })

    it('validates age verification', async () => {
      renderWithQueryClient(<RegisterForm />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!')

      // Accept terms but don't verify age
      await user.click(screen.getByLabelText(/i accept the terms/i))
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('You must be at least 18 years old')).toBeInTheDocument()
      })
    })

    it('submits registration with valid data', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true, userId: 'user-123' })

      renderWithQueryClient(<RegisterForm />)

      // Fill all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!')

      // Accept terms and verify age
      await user.click(screen.getByLabelText(/i accept the terms/i))
      await user.click(screen.getByLabelText(/i am at least 18/i))

      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/auth/register', {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          acceptTerms: true,
          ageVerified: true
        })
      })
    })
  })

  describe('Form Security Features', () => {
    it('prevents CSRF attacks', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true })

      renderWithQueryClient(<LoginForm />)

      // Form should include CSRF token
      expect(screen.getByRole('form')).toHaveAttribute('data-csrf-token')

      // Fill and submit
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
          email: 'admin@test.com',
          password: 'password123',
          _csrf: expect.any(String)
        })
      })
    })

    it('handles rate limiting', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Too many attempts'))

      renderWithQueryClient(<LoginForm />)

      // Fill and submit
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Too many login attempts. Please try again later.')).toBeInTheDocument()
      })
    })

    it('clears sensitive data on component unmount', async () => {
      const { unmount } = renderWithQueryClient(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'password123')

      // Unmount component
      unmount()

      // Password should be cleared from memory
      expect(passwordInput).not.toHaveValue('password123')
    })
  })

  describe('Form Accessibility', () => {
    it('supports screen reader navigation', async () => {
      renderWithQueryClient(<LoginForm />)

      // Check for proper form structure
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Login Form')
      
      // Check for proper field labels
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-describedby')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-describedby')
    })

    it('announces form validation errors', async () => {
      renderWithQueryClient(<LoginForm />)

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        const errorMessage = screen.getByText('Email is required')
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      })
    })

    it('provides proper focus management', async () => {
      renderWithQueryClient(<LoginForm />)

      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/password/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus()
    })

    it('supports keyboard shortcuts', async () => {
      renderWithQueryClient(<LoginForm />)

      // Fill form
      await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit with Enter key
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
          email: 'admin@test.com',
          password: 'password123'
        })
      })
    })
  })
})