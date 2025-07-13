/**
 * Form Validation Test Runner - Priority 2
 * Comprehensive test suite for form validation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Form validation test utilities
export const formValidationTestUtils = {
  // Create test query client
  createTestQueryClient: () => {
    return new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          refetchOnWindowFocus: false,
          staleTime: 0,
          gcTime: 0,
        },
        mutations: { 
          retry: false,
        },
      },
    })
  },

  // Mock API responses
  mockSuccessfulSubmission: (data: any) => {
    const mockApiRequest = vi.fn()
    mockApiRequest.mockResolvedValueOnce(data)
    return mockApiRequest
  },

  mockFailedSubmission: (error: string) => {
    const mockApiRequest = vi.fn()
    mockApiRequest.mockRejectedValueOnce(new Error(error))
    return mockApiRequest
  },

  // Test field validation
  testFieldValidation: async (fieldLabel: string, validValue: string, invalidValue: string, expectedError: string) => {
    const user = userEvent.setup()
    const field = screen.getByLabelText(new RegExp(fieldLabel, 'i'))
    
    // Test invalid value
    await user.clear(field)
    await user.type(field, invalidValue)
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument()
    })
    
    // Test valid value
    await user.clear(field)
    await user.type(field, validValue)
    await user.tab()
    
    await waitFor(() => {
      expect(screen.queryByText(expectedError)).not.toBeInTheDocument()
    })
  },

  // Test form submission
  testFormSubmission: async (formData: Record<string, any>, expectedApiCall: any) => {
    const user = userEvent.setup()
    
    // Fill form fields
    for (const [fieldName, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
        await user.clear(field)
        await user.type(field, value)
      } else if (typeof value === 'boolean') {
        const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
        if (value) {
          await user.click(field)
        }
      }
    }
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit|send|create|register/i })
    await user.click(submitButton)
    
    // Verify API call
    await waitFor(() => {
      expect(expectedApiCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining(formData)
      )
    })
  },

  // Test loading states
  testLoadingStates: async (buttonText: string, loadingText: string) => {
    const user = userEvent.setup()
    const submitButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
    
    await user.click(submitButton)
    
    expect(screen.getByText(loadingText)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  },

  // Test error handling
  testErrorHandling: async (expectedError: string) => {
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument()
    })
  },

  // Test accessibility
  testAccessibility: (formTitle: string) => {
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', formTitle)
    
    // Check all inputs have proper labels
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label')
    })
    
    // Check error messages have proper ARIA attributes
    const errorMessages = screen.getAllByRole('alert')
    errorMessages.forEach(error => {
      expect(error).toHaveAttribute('aria-live', 'polite')
    })
  },

  // Test keyboard navigation
  testKeyboardNavigation: async (expectedFocusOrder: string[]) => {
    const user = userEvent.setup()
    
    for (const fieldName of expectedFocusOrder) {
      await user.tab()
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
      expect(field).toHaveFocus()
    }
  }
}

// Validation test patterns
export const validationTestPatterns = {
  email: {
    valid: ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'],
    invalid: ['invalid-email', 'test@', '@example.com', 'test..email@example.com'],
    errorMessage: 'Please enter a valid email address'
  },
  
  phone: {
    valid: ['(555) 123-4567', '555-123-4567', '555.123.4567', '5551234567'],
    invalid: ['123', 'abc-def-ghij', '123-456-78901', '555-123-456'],
    errorMessage: 'Please enter a valid phone number'
  },
  
  password: {
    valid: ['Password123!', 'MySecure@Pass2023', 'ComplexP@ssw0rd'],
    invalid: ['123456', 'password', 'PASSWORD123', 'Password123'],
    errorMessage: 'Password must meet security requirements'
  },
  
  url: {
    valid: ['https://example.com', 'http://test.org', 'https://www.google.com'],
    invalid: ['not-a-url', 'ftp://example.com', 'https://', 'http://localhost'],
    errorMessage: 'Please enter a valid URL'
  },
  
  required: {
    valid: ['Any non-empty value', 'test', '123'],
    invalid: ['', '   ', null, undefined],
    errorMessage: 'This field is required'
  },
  
  minLength: {
    valid: ['Long enough text', 'This meets minimum length'],
    invalid: ['Short', 'Too small'],
    errorMessage: 'Must be at least {min} characters'
  },
  
  maxLength: {
    valid: ['Valid length', 'Within limits'],
    invalid: ['This text is way too long and exceeds the maximum allowed length'],
    errorMessage: 'Must be less than {max} characters'
  }
}

// Performance test utilities
export const formPerformanceTestUtils = {
  // Test form rendering performance
  testRenderingPerformance: (component: React.ReactElement, threshold: number = 1000) => {
    const startTime = performance.now()
    render(component)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(threshold)
  },

  // Test form validation performance
  testValidationPerformance: async (fieldCount: number, threshold: number = 500) => {
    const user = userEvent.setup()
    const startTime = performance.now()
    
    // Simulate typing in multiple fields
    for (let i = 0; i < fieldCount; i++) {
      const field = screen.getByTestId(`field-${i}`)
      await user.type(field, 'test value')
    }
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(threshold)
  },

  // Test memory usage
  testMemoryUsage: (component: React.ReactElement) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    const { unmount } = render(component)
    
    unmount()
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    expect(finalMemory).toBeLessThanOrEqual(initialMemory * 1.1) // Allow 10% increase
  }
}

// Security test utilities
export const formSecurityTestUtils = {
  // Test XSS prevention
  testXSSPrevention: async (fieldName: string) => {
    const user = userEvent.setup()
    const maliciousInput = '<script>alert("XSS")</script>'
    
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    await user.type(field, maliciousInput)
    
    // Field should sanitize or escape the input
    expect(field).not.toHaveValue(maliciousInput)
  },

  // Test CSRF protection
  testCSRFProtection: () => {
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('data-csrf-token')
  },

  // Test input sanitization
  testInputSanitization: async (fieldName: string, dangerousInput: string) => {
    const user = userEvent.setup()
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    
    await user.type(field, dangerousInput)
    
    // Input should be sanitized
    expect(field.value).not.toContain('<script>')
    expect(field.value).not.toContain('javascript:')
  }
}

// Test data generators for forms
export const formTestDataGenerators = {
  // Generate contact form data
  contactForm: (overrides = {}) => ({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'This is a test message for the contact form',
    ...overrides
  }),

  // Generate business contact form data
  businessContactForm: (overrides = {}) => ({
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(555) 123-4567',
    inquiryType: 'general',
    message: 'I would like to inquire about your services',
    ...overrides
  }),

  // Generate business registration data
  businessRegistration: (overrides = {}) => ({
    businessName: 'Test Business',
    category: 'restaurant',
    address: '123 Test Street, Test City, TS 12345',
    phone: '(555) 987-6543',
    email: 'business@test.com',
    website: 'https://testbusiness.com',
    description: 'This is a test business description that meets minimum length requirements',
    ...overrides
  }),

  // Generate review form data
  reviewForm: (overrides = {}) => ({
    customerName: 'Customer Name',
    customerEmail: 'customer@example.com',
    rating: 5,
    comment: 'This is an excellent business with great service and quality products',
    ...overrides
  }),

  // Generate claim form data
  claimForm: (overrides = {}) => ({
    fullName: 'Business Owner',
    email: 'owner@business.com',
    phone: '(555) 444-3333',
    relationship: 'owner',
    additionalInfo: 'I am the owner of this business and can provide verification documents',
    ...overrides
  }),

  // Generate login form data
  loginForm: (overrides = {}) => ({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    rememberMe: false,
    ...overrides
  }),

  // Generate registration form data
  registrationForm: (overrides = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    acceptTerms: true,
    ageVerified: true,
    ...overrides
  })
}

// Test configuration
export const formTestConfig = {
  testTimeout: 15000,
  
  setupGlobalMocks: () => {
    // Mock API request
    vi.mock('@/lib/queryClient', () => ({
      apiRequest: vi.fn(),
    }))
    
    // Mock toast
    vi.mock('@/hooks/use-toast', () => ({
      useToast: () => ({
        toast: vi.fn(),
      }),
    }))
    
    // Mock file upload
    vi.mock('@/lib/upload', () => ({
      uploadFile: vi.fn(),
    }))
  },

  setupTestEnvironment: () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
    
    afterEach(() => {
      vi.restoreAllMocks()
    })
  },

  // Common test patterns
  commonPatterns: {
    requiredField: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsNoMatch: 'Passwords do not match',
    invalidUrl: 'Please enter a valid URL',
    fileTooLarge: 'File size must be less than {size}MB',
    invalidFileType: 'Only {types} files are allowed',
    submitSuccess: 'Form submitted successfully',
    submitError: 'Failed to submit form. Please try again.',
    loadingState: 'Loading...',
    savingState: 'Saving...',
    submittingState: 'Submitting...'
  }
}

// Export comprehensive test utilities
export const formValidationTestSuite = {
  utils: formValidationTestUtils,
  patterns: validationTestPatterns,
  performance: formPerformanceTestUtils,
  security: formSecurityTestUtils,
  data: formTestDataGenerators,
  config: formTestConfig
}