import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { createMockBusiness } from '@/test/utils/test-utils'
import BusinessCard from '../business-card'

// Mock the router
vi.mock('wouter', () => ({
  useLocation: () => ['/'],
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

describe('BusinessCard Component', () => {
  const mockBusiness = createMockBusiness()

  it('renders business information correctly', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('A test business for unit testing')).toBeInTheDocument()
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
  })

  it('displays rating when available', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    // Should display rating stars and count
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument()
  })

  it('handles missing rating gracefully', () => {
    const businessWithoutRating = createMockBusiness({
      rating: null,
      reviewCount: 0
    })
    
    render(<BusinessCard business={businessWithoutRating} />)
    
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('displays phone number when available', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    expect(screen.getByText('555-0123')).toBeInTheDocument()
  })

  it('displays website link when available', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    const websiteLink = screen.getByText('Visit Website')
    expect(websiteLink).toBeInTheDocument()
    expect(websiteLink.closest('a')).toHaveAttribute('href', 'https://testbusiness.com')
  })

  it('creates correct business detail link', () => {
    const businessWithSlug = createMockBusiness({
      slug: 'test-business-slug'
    })
    
    render(<BusinessCard business={businessWithSlug} />)
    
    const businessLink = screen.getByRole('link', { name: /test business/i })
    expect(businessLink).toHaveAttribute('href', '/business/test-business-slug')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalBusiness = {
      placeid: 'minimal-business',
      title: 'Minimal Business',
      categoryname: 'Service'
    }
    
    render(<BusinessCard business={minimalBusiness} />)
    
    expect(screen.getByText('Minimal Business')).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.queryByText('Visit Website')).not.toBeInTheDocument()
  })

  it('applies hover effects correctly', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:shadow-lg')
  })
})