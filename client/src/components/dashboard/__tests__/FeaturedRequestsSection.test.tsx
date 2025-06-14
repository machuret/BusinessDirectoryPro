import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeaturedRequestsSection } from '../FeaturedRequestsSection';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM d, yyyy') {
      return 'Jun 14, 2025';
    }
    return date.toISOString();
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn()
  }
}));

// Test data
const mockUserBusinesses = [
  {
    placeid: 'test-business-1',
    title: 'Test Restaurant',
    city: 'New York',
    featured: false
  },
  {
    placeid: 'test-business-2', 
    title: 'Test Cafe',
    city: 'Brooklyn',
    featured: false
  }
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('FeaturedRequestsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pending Status', () => {
    it('displays pending status message and badge correctly', async () => {
      // Mock API response for pending request
      const pendingRequest = {
        id: 1,
        businessId: 'test-business-1',
        status: 'pending',
        message: 'Please feature our restaurant for better visibility',
        businessTitle: 'Test Restaurant',
        businessCity: 'New York',
        createdAt: new Date('2025-06-14T10:00:00Z'),
        adminMessage: null,
        reviewedAt: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [pendingRequest]
      });

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      // Wait for the API call to complete and component to render
      await waitFor(() => {
        expect(screen.getByText('Your Featured Requests')).toBeInTheDocument();
      });

      // Check for pending badge
      expect(screen.getByText('Pending')).toBeInTheDocument();

      // Check business title and user message are displayed
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText(/Your message:/)).toBeInTheDocument();
      expect(screen.getByText('Please feature our restaurant for better visibility')).toBeInTheDocument();

      // Check submission date
      expect(screen.getByText('Submitted Jun 14, 2025')).toBeInTheDocument();

      // Verify no admin message is shown for pending requests
      expect(screen.queryByText(/Admin response:/)).not.toBeInTheDocument();
    });
  });

  describe('Approved Status', () => {
    it('displays approval success message and badge correctly', async () => {
      // Mock API response for approved request
      const approvedRequest = {
        id: 2,
        businessId: 'test-business-1',
        status: 'approved',
        message: 'We provide excellent service and have great reviews',
        businessTitle: 'Test Restaurant',
        businessCity: 'New York',
        createdAt: new Date('2025-06-14T10:00:00Z'),
        adminMessage: 'Congratulations! Your business is now featured.',
        reviewedAt: new Date('2025-06-14T15:30:00Z'),
        reviewedBy: 'admin-user-1'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [approvedRequest]
      });

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      // Wait for the API call to complete and component to render
      await waitFor(() => {
        expect(screen.getByText('Your Featured Requests')).toBeInTheDocument();
      });

      // Check for approved badge with green styling
      expect(screen.getByText('Approved')).toBeInTheDocument();

      // Check business title and user message
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText(/Your message:/)).toBeInTheDocument();
      expect(screen.getByText('We provide excellent service and have great reviews')).toBeInTheDocument();

      // Check admin success message
      expect(screen.getByText(/Admin response:/)).toBeInTheDocument();
      expect(screen.getByText('Congratulations! Your business is now featured.')).toBeInTheDocument();

      // Check both submission and review dates
      expect(screen.getByText('Submitted Jun 14, 2025')).toBeInTheDocument();
      expect(screen.getByText('Reviewed Jun 14, 2025')).toBeInTheDocument();
    });
  });

  describe('Rejected Status', () => {
    it('displays rejection message and admin reason correctly', async () => {
      // Mock API response for rejected request
      const rejectedRequest = {
        id: 3,
        businessId: 'test-business-2',
        status: 'rejected',
        message: 'This cafe has been serving the community for 10 years',
        businessTitle: 'Test Cafe',
        businessCity: 'Brooklyn', 
        createdAt: new Date('2025-06-14T10:00:00Z'),
        adminMessage: 'Thank you for your interest, but we cannot feature this business at this time due to insufficient reviews.',
        reviewedAt: new Date('2025-06-14T16:45:00Z'),
        reviewedBy: 'admin-user-1'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [rejectedRequest]
      });

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      // Wait for the API call to complete and component to render
      await waitFor(() => {
        expect(screen.getByText('Your Featured Requests')).toBeInTheDocument();
      });

      // Check for rejected badge
      expect(screen.getByText('Rejected')).toBeInTheDocument();

      // Check business title and user message
      expect(screen.getByText('Test Cafe')).toBeInTheDocument();
      expect(screen.getByText(/Your message:/)).toBeInTheDocument();
      expect(screen.getByText('This cafe has been serving the community for 10 years')).toBeInTheDocument();

      // Check admin rejection message with specific reason
      expect(screen.getByText(/Admin response:/)).toBeInTheDocument();
      expect(screen.getByText('Thank you for your interest, but we cannot feature this business at this time due to insufficient reviews.')).toBeInTheDocument();

      // Check both submission and review dates
      expect(screen.getByText('Submitted Jun 14, 2025')).toBeInTheDocument(); 
      expect(screen.getByText('Reviewed Jun 14, 2025')).toBeInTheDocument();

      // Check business city is displayed
      expect(screen.getByText('Brooklyn')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading skeleton while fetching requests', async () => {
      // Mock a delayed response to test loading state
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => []
          }), 100);
        })
      );

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      // Check loading skeleton is displayed
      expect(screen.getByText('Featured Requests')).toBeInTheDocument();
      
      // Look for loading animation elements
      const loadingElements = screen.container.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty States', () => {
    it('displays no requests message when user has eligible businesses but no requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('No Featured Requests')).toBeInTheDocument();
      });

      expect(screen.getByText("You haven't submitted any featured requests yet.")).toBeInTheDocument();
      expect(screen.getByText('New Request')).toBeInTheDocument();
    });

    it('displays no businesses message when user has no businesses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={[]}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('No Businesses Found')).toBeInTheDocument();
      });

      expect(screen.getByText('You need to own businesses before you can request featured status.')).toBeInTheDocument();
    });
  });

  describe('API Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch featured requests'));

      render(
        <FeaturedRequestsSection 
          userId="test-user-1" 
          userBusinesses={mockUserBusinesses}
        />,
        { wrapper: createWrapper() }
      );

      // Component should still render the basic structure even with API errors
      expect(screen.getByText('Featured Requests')).toBeInTheDocument();
      expect(screen.getByText('Request to have your businesses featured in our directory for increased visibility.')).toBeInTheDocument();
    });
  });
});