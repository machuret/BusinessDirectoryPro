import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import BusinessTable from '../components/BusinessTable'

describe('BusinessTable', () => {
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
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ]

  const defaultProps = {
    businesses: mockBusinesses,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    selectedBusinesses: [],
    onSelectionChange: vi.fn(),
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    onPageChange: vi.fn(),
  }

  it('renders business table with data', () => {
    render(<BusinessTable {...defaultProps} />)

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
    expect(screen.getByText('Test Cafe')).toBeInTheDocument()
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('Cafe')).toBeInTheDocument()
  })

  it('displays approval status correctly', () => {
    render(<BusinessTable {...defaultProps} />)

    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('displays featured status correctly', () => {
    render(<BusinessTable {...defaultProps} />)

    // Check for featured indicators
    const featuredBadges = screen.getAllByText('Featured')
    expect(featuredBadges).toHaveLength(1)
  })

  it('handles edit button clicks', () => {
    const onEdit = vi.fn()
    render(<BusinessTable {...defaultProps} onEdit={onEdit} />)

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(onEdit).toHaveBeenCalledWith(mockBusinesses[0])
  })

  it('handles delete button clicks', () => {
    const onDelete = vi.fn()
    render(<BusinessTable {...defaultProps} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('handles row selection', () => {
    const onSelectionChange = vi.fn()
    render(<BusinessTable {...defaultProps} onSelectionChange={onSelectionChange} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // First checkbox is "select all"

    expect(onSelectionChange).toHaveBeenCalled()
  })

  it('displays loading state', () => {
    render(<BusinessTable {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Loading businesses...')).toBeInTheDocument()
  })

  it('displays empty state when no businesses', () => {
    render(<BusinessTable {...defaultProps} businesses={[]} />)

    expect(screen.getByText('No businesses found')).toBeInTheDocument()
  })

  it('handles pagination', () => {
    const onPageChange = vi.fn()
    render(<BusinessTable {...defaultProps} totalPages={3} onPageChange={onPageChange} />)

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('displays business contact information', () => {
    render(<BusinessTable {...defaultProps} />)

    expect(screen.getByText('555-0123')).toBeInTheDocument()
    expect(screen.getByText('555-0456')).toBeInTheDocument()
  })

  it('handles select all functionality', () => {
    const onSelectionChange = vi.fn()
    render(<BusinessTable {...defaultProps} onSelectionChange={onSelectionChange} />)

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2'])
  })

  it('shows correct page information', () => {
    render(<BusinessTable {...defaultProps} currentPage={2} totalPages={5} />)

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })
})