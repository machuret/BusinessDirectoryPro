/**
 * Business Listing Page Integration Test
 * Tests business data display and CMS content integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { ContentProvider } from '@/contexts/ContentContext';
import BusinessListingPage from '@/pages/business-listing';

// Mock the useParams hook from wouter
const mockUseParams = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// Mock the fetch function for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Business Listing Page Integration', () => {
  let queryClient: QueryClient;
  let testBusinessData: InsertBusiness;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Create unique test business data
    testBusinessData = {
      title: 'Unique Test Coffee Shop Integration',
      slug: 'unique-test-coffee-shop-integration',
      address: '123 Test Integration Street, Test City, TC 12345',
      phone: '+1-555-TEST-INT',
      website: 'https://test-integration-coffee.com',
      description: 'A unique test coffee shop for integration testing with specialty roasts',
      categoryname: 'Coffee Shop',
      placeid: 'test-place-id-integration-' + Date.now(),
      featured: false,
    };

    // Mock useParams to return our test business slug
    mockUseParams.mockReturnValue({ slug: testBusinessData.slug });

    // Mock API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/content/strings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'business.content.hoursLabel': 'Hours of Operation',
            'business.content.aboutBusiness': 'About This Business',
            'business.content.contactInformation': 'Contact Information',
            'business.contact.title': 'Contact Information',
            'business.contact.phone': 'Phone',
            'business.contact.address': 'Address',
            'business.contact.website': 'Website',
            'business.contact.call': 'Call',
            'business.contact.visitWebsite': 'Visit Website',
            'business.contact.category': 'Category',
            'business.interactions.customerReviews': 'Customer Reviews',
          }),
        });
      }
      
      if (url.includes(`/api/businesses/${testBusinessData.slug}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...testBusinessData,
            category: {
              id: 1,
              name: 'Coffee Shop',
              slug: 'coffee-shop',
            },
            reviews: [],
          }),
        });
      }

      if (url.includes('/api/reviews')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderBusinessListingPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ContentProvider>
          <Router>
            <BusinessListingPage />
          </Router>
        </ContentProvider>
      </QueryClientProvider>
    );
  };

  it('displays unique business name in header', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const businessName = screen.getByRole('heading', { 
        name: testBusinessData.title!,
        level: 1 
      });
      expect(businessName).toBeInTheDocument();
    });
  });

  it('displays unique business address', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const address = screen.getByText(testBusinessData.address!);
      expect(address).toBeInTheDocument();
    });
  });

  it('displays unique business phone number', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const phoneNumber = screen.getByText(testBusinessData.phone!);
      expect(phoneNumber).toBeInTheDocument();
    });
  });

  it('displays CMS-driven Hours of Operation label', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const hoursLabel = screen.getByText('Hours of Operation');
      expect(hoursLabel).toBeInTheDocument();
    });
  });

  it('displays CMS-driven Contact Information title', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const contactTitle = screen.getByText('Contact Information');
      expect(contactTitle).toBeInTheDocument();
    });
  });

  it('displays business description in About section', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const description = screen.getByText(testBusinessData.description!);
      expect(description).toBeInTheDocument();
    });
  });

  it('displays business website with CMS label', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const websiteLabel = screen.getByText('Website');
      expect(websiteLabel).toBeInTheDocument();
      
      const websiteLink = screen.getByText('Visit Website');
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink.closest('a')).toHaveAttribute('href', testBusinessData.website);
    });
  });

  it('displays phone call button with CMS label', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const phoneLabel = screen.getByText('Phone');
      expect(phoneLabel).toBeInTheDocument();
      
      const callButton = screen.getByText('Call');
      expect(callButton).toBeInTheDocument();
    });
  });

  it('displays Customer Reviews section with CMS title', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const reviewsTitle = screen.getByText('Customer Reviews');
      expect(reviewsTitle).toBeInTheDocument();
    });
  });

  it('displays business category with proper formatting', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      const categoryLabel = screen.getByText('Category');
      expect(categoryLabel).toBeInTheDocument();
      
      const categoryValue = screen.getByText(testBusinessData.categoryname!);
      expect(categoryValue).toBeInTheDocument();
    });
  });

  it('renders all CMS content without hardcoded text', async () => {
    renderBusinessListingPage();

    await waitFor(() => {
      // Verify key CMS strings are present
      expect(screen.getByText('About This Business')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Hours of Operation')).toBeInTheDocument();
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    });

    // Verify no hardcoded fallback text is present
    expect(screen.queryByText('Contact Info')).not.toBeInTheDocument();
    expect(screen.queryByText('About Us')).not.toBeInTheDocument();
    expect(screen.queryByText('Reviews')).not.toBeInTheDocument();
  });
});