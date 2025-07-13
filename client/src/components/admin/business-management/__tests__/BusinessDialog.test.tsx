import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import BusinessDialog from '../components/BusinessDialog'

describe('BusinessDialog', () => {
  const mockCategories = [
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 2, name: 'Cafe', slug: 'cafe' },
  ]

  const mockBusiness = {
    id: '1',
    name: 'Test Restaurant',
    category: 'Restaurant',
    description: 'A test restaurant',
    address: '123 Test St',
    phone: '555-0123',
    website: 'https://test.com',
    isApproved: true,
    isFeatured: false,
  }

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    mode: 'create' as const,
    business: null,
    categories: mockCategories,
  }

  it('renders create business dialog', () => {
    render(<BusinessDialog {...defaultProps} />)

    expect(screen.getByText('Create Business')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
  })

  it('renders edit business dialog with existing data', () => {
    render(<BusinessDialog {...defaultProps} mode="edit" business={mockBusiness} />)

    expect(screen.getByText('Edit Business')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Restaurant')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A test restaurant')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument()
    expect(screen.getByDisplayValue('555-0123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
  })

  it('handles form submission for create mode', async () => {
    const onSave = vi.fn()
    render(<BusinessDialog {...defaultProps} onSave={onSave} />)

    // Fill out form
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'New Restaurant' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new restaurant' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '789 New St' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '555-0789' } })
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://new.com' } })

    // Select category
    fireEvent.click(screen.getByLabelText('Category'))
    fireEvent.click(screen.getByText('Restaurant'))

    // Submit form
    fireEvent.click(screen.getByText('Create Business'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: 'New Restaurant',
        description: 'A new restaurant',
        address: '789 New St',
        phone: '555-0789',
        website: 'https://new.com',
        category: 'Restaurant',
        isApproved: false,
        isFeatured: false,
      })
    })
  })

  it('handles form submission for edit mode', async () => {
    const onSave = vi.fn()
    render(<BusinessDialog {...defaultProps} mode="edit" business={mockBusiness} onSave={onSave} />)

    // Update business name
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Updated Restaurant' } })

    // Submit form
    fireEvent.click(screen.getByText('Update Business'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...mockBusiness,
        name: 'Updated Restaurant',
      })
    })
  })

  it('validates required fields', async () => {
    render(<BusinessDialog {...defaultProps} />)

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Business'))

    await waitFor(() => {
      expect(screen.getByText('Business name is required')).toBeInTheDocument()
      expect(screen.getByText('Category is required')).toBeInTheDocument()
    })
  })

  it('handles dialog close', () => {
    const onClose = vi.fn()
    render(<BusinessDialog {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(onClose).toHaveBeenCalled()
  })

  it('handles approval status toggle', () => {
    render(<BusinessDialog {...defaultProps} mode="edit" business={mockBusiness} />)

    const approvedCheckbox = screen.getByLabelText('Approved')
    expect(approvedCheckbox).toBeChecked()

    fireEvent.click(approvedCheckbox)
    expect(approvedCheckbox).not.toBeChecked()
  })

  it('handles featured status toggle', () => {
    render(<BusinessDialog {...defaultProps} mode="edit" business={mockBusiness} />)

    const featuredCheckbox = screen.getByLabelText('Featured')
    expect(featuredCheckbox).not.toBeChecked()

    fireEvent.click(featuredCheckbox)
    expect(featuredCheckbox).toBeChecked()
  })

  it('shows loading state during submission', async () => {
    const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<BusinessDialog {...defaultProps} onSave={onSave} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByLabelText('Category'))
    fireEvent.click(screen.getByText('Restaurant'))

    // Submit form
    fireEvent.click(screen.getByText('Create Business'))

    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })

  it('validates phone number format', async () => {
    render(<BusinessDialog {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: 'invalid-phone' } })
    fireEvent.blur(screen.getByLabelText('Phone'))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
    })
  })

  it('validates website URL format', async () => {
    render(<BusinessDialog {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'invalid-url' } })
    fireEvent.blur(screen.getByLabelText('Website'))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid website URL')).toBeInTheDocument()
    })
  })

  it('does not render when closed', () => {
    render(<BusinessDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Create Business')).not.toBeInTheDocument()
  })
})