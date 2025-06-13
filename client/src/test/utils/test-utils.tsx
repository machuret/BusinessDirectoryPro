import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { UIProvider } from '@/contexts/UIContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </UIProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockBusiness = (overrides = {}) => ({
  placeid: 'test-business-1',
  title: 'Test Business',
  subtitle: null,
  description: 'A test business for unit testing',
  categoryname: 'Restaurant',
  categories: null,
  price: null,
  website: 'https://testbusiness.com',
  phone: '555-0123',
  phoneunformatted: null,
  menu: null,
  address: '123 Test St',
  neighborhood: null,
  city: 'Test City',
  state: null,
  country: null,
  zip: null,
  latitude: null,
  longitude: null,
  hours: null,
  slug: 'test-business',
  rating: 4.5,
  reviewCount: 10,
  googleRating: null,
  googleReviewCount: null,
  googleReviews: null,
  photos: null,
  priceLevel: null,
  popularTimes: null,
  currentPopularity: null,
  averageTimeSpent: null,
  types: null,
  plus_code: null,
  place_id: null,
  compound_code: null,
  global_code: null,
  utc_offset: null,
  website_domain: null,
  claimed: false,
  claimedBy: null,
  claimedAt: null,
  verificationStatus: null,
  featured: false,
  featuredUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  businessHours: null,
  amenities: null,
  attributes: null,
  emails: null,
  fax: null,
  logoUrl: null,
  coverImageUrl: null,
  galleryImages: null,
  socialMedia: null,
  paymentMethods: null,
  languages: null,
  certifications: null,
  awards: null,
  yearEstablished: null,
  numberOfEmployees: null,
  serviceArea: null,
  specialties: null,
  brands: null,
  temporarilyClosed: false,
  permanentlyClosed: false,
  suspendedBusiness: false,
  editorialSummary: null,
  reservable: false,
  servesBreakfast: false,
  servesLunch: false,
  servesDinner: false,
  servesBeer: false,
  servesWine: false,
  servesBrunch: false,
  servesVegetarianFood: false,
  wheelchair_accessible_entrance: null,
  wheelchair_accessible_parking: null,
  wheelchair_accessible_restroom: null,
  wheelchair_accessible_seating: null,
  outdoor_seating: null,
  live_music: null,
  takeout: null,
  delivery: null,
  dine_in: null,
  curbside_pickup: null,
  reservations: null,
  good_for_children: null,
  good_for_groups: null,
  lgbtq_friendly: null,
  transgender_safe_space: null,
  reviews: null,
  faq: null,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  ...overrides
})

export const createMockCategory = (overrides = {}) => ({
  id: 1,
  name: 'Restaurant',
  slug: 'restaurant',
  icon: 'utensils',
  color: '#ef4444',
  ...overrides
})