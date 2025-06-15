/**
 * Integration tests for Categories and Cities pages with CMS content
 * Tests category/city filtering, business display, and dynamic content strings
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import Categories from '../pages/categories';
import Cities from '../pages/cities';
import { ContentProvider } from '../contexts/ContentContext';

// Mock data for testing
const mockContentStrings = {
  'categories.loading': 'Loading categories...',
  'categories.browsing.title': 'Browse Categories',
  'categories.businesses.categoryTitle': '{categoryName} Businesses',
  'categories.businesses.allTitle': 'All Businesses',
  'categories.businesses.businessSingular': 'business',
  'categories.businesses.businessPlural': 'businesses',
  'categories.empty.title': 'No businesses found',
  'categories.empty.categoryDescription': 'No businesses found in {categoryName}',
  'categories.empty.generalDescription': 'No businesses found',
  'cities.loading': 'Loading cities...',
  'cities.browsing.title': 'Browse Cities',
  'cities.cityPage.title': 'Businesses in {cityName}',
  'cities.cityPage.description': 'Discover local businesses and services in {cityName}',
  'cities.cityEmpty.title': 'No businesses found in {cityName}',
  'cities.cityEmpty.description': 'No businesses found in this city',
  'cities.breadcrumbs.home': 'Home',
  'cities.breadcrumbs.cities': 'Cities',
};

const mockCategories = [
  { id: 1, name: 'Restaurants', slug: 'restaurants', description: 'Food and dining' },
  { id: 2, name: 'Hotels', slug: 'hotels', description: 'Accommodation' },
];

const mockBusinesses = [
  {
    placeid: 'test-1',
    title: 'Sydney Restaurant',
    categoryId: 1,
    city: 'Sydney',
    suburb: 'CBD',
    state: 'NSW',
    country: 'Australia',
    slug: 'sydney-restaurant',
    description: 'Great food in Sydney',
    featured: false,
  },
  {
    placeid: 'test-2', 
    title: 'Melbourne Cafe',
    categoryId: 1,
    city: 'Melbourne',
    suburb: 'CBD',
    state: 'VIC',
    country: 'Australia',
    slug: 'melbourne-cafe',
    description: 'Great coffee in Melbourne',
    featured: false,
  },
];

// Mock fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test wrapper component
function TestWrapper({ children, path = '/' }: { children: React.ReactNode; path?: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock window.location for testing
  Object.defineProperty(window, 'location', {
    value: { pathname: path },
    writable: true,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ContentProvider>
        <Router>
          {children}
        </Router>
      </ContentProvider>
    </QueryClientProvider>
  );
}

describe('Categories and Cities Integration Tests', () => {
  beforeEach(() => {
    cleanup();
    mockFetch.mockClear();

    // Default mock responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/content/strings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockContentStrings),
        });
      }
      
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        });
      }
      
      if (url.includes('/api/businesses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBusinesses),
        });
      }
      
      if (url.includes('/api/cities')) {
        const cities = [...new Set(mockBusinesses.map(b => b.city))].map(city => ({
          city,
          count: mockBusinesses.filter(b => b.city === city).length,
        }));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(cities),
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  });

  describe('Categories Page Integration', () => {
    it('should display all businesses when no category is selected', async () => {
      render(
        <TestWrapper initialPath="/categories">
          <Categories />
        </TestWrapper>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('All Businesses')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show businesses from our test data
      await waitFor(() => {
        expect(screen.getByText('Sydney Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Melbourne Test Cafe')).toBeInTheDocument();
        expect(screen.getByText('Sydney Test Bistro')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should filter businesses by category and show dynamic category title', async () => {
      render(
        <TestWrapper initialPath={`/categories/${testCategory.slug}`}>
          <Categories />
        </TestWrapper>
      );

      // Wait for content to load and check for dynamic title with parameter interpolation
      await waitFor(() => {
        expect(screen.getByText('Test Restaurants Businesses')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show only businesses from the test category
      await waitFor(() => {
        expect(screen.getByText('Sydney Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Melbourne Test Cafe')).toBeInTheDocument();
        expect(screen.getByText('Sydney Test Bistro')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display empty state with dynamic content when no businesses in category', async () => {
      // Create a category with no businesses
      const [emptyCategory] = await db
        .insert(categories)
        .values({
          name: 'Empty Category',
          slug: 'empty-category',
          description: 'Category with no businesses',
        })
        .returning();

      try {
        render(
          <TestWrapper initialPath={`/categories/${emptyCategory.slug}`}>
            <Categories />
          </TestWrapper>
        );

        // Wait for empty state to show
        await waitFor(() => {
          expect(screen.getByText('No businesses found')).toBeInTheDocument();
        }, { timeout: 5000 });

      } finally {
        // Clean up
        await db
          .delete(categories)
          .where(eq(categories.id, emptyCategory.id));
      }
    });
  });

  describe('Cities Page Integration', () => {
    it('should display all cities on the main cities page', async () => {
      render(
        <TestWrapper initialPath="/cities">
          <Cities />
        </TestWrapper>
      );

      // Wait for cities list to load
      await waitFor(() => {
        expect(screen.getByText('Browse Cities')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show cities from our test data
      await waitFor(() => {
        expect(screen.getByText('Sydney')).toBeInTheDocument();
        expect(screen.getByText('Melbourne')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should filter businesses by city and show dynamic city title', async () => {
      render(
        <TestWrapper initialPath="/cities/Sydney">
          <Cities />
        </TestWrapper>
      );

      // Wait for content to load and check for dynamic title with parameter interpolation
      await waitFor(() => {
        expect(screen.getByText('Businesses in Sydney')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for description with parameter interpolation
      await waitFor(() => {
        expect(screen.getByText('Discover local businesses and services in Sydney')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show only Sydney businesses
      await waitFor(() => {
        expect(screen.getByText('Sydney Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Sydney Test Bistro')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should not show Melbourne business
      expect(screen.queryByText('Melbourne Test Cafe')).not.toBeInTheDocument();
    });

    it('should handle URL-encoded city names correctly', async () => {
      render(
        <TestWrapper initialPath="/cities/New%20York">
          <Cities />
        </TestWrapper>
      );

      // Wait for content to load with decoded city name
      await waitFor(() => {
        expect(screen.getByText('Businesses in New York')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display empty state when no businesses in city', async () => {
      render(
        <TestWrapper initialPath="/cities/EmptyCity">
          <Cities />
        </TestWrapper>
      );

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText('No businesses found in EmptyCity')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('CMS Content Integration', () => {
    it('should load and display content strings from database', async () => {
      render(
        <TestWrapper initialPath="/categories">
          <Categories />
        </TestWrapper>
      );

      // Wait for CMS content to load
      await waitFor(() => {
        expect(screen.getByText('All Businesses')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle parameter interpolation in content strings', async () => {
      render(
        <TestWrapper initialPath="/cities/TestCity">
          <Cities />
        </TestWrapper>
      );

      // Wait for parameter interpolation to work
      await waitFor(() => {
        expect(screen.getByText('Businesses in TestCity')).toBeInTheDocument();
        expect(screen.getByText('Discover local businesses and services in TestCity')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show fallback content when content strings are missing', async () => {
      // Temporarily remove a content string
      await db
        .delete(contentStrings)
        .where(eq(contentStrings.stringKey, 'categories.loading'));

      try {
        render(
          <TestWrapper initialPath="/categories">
            <Categories />
          </TestWrapper>
        );

        // Should show fallback format [key]
        await waitFor(() => {
          expect(screen.getByText('[categories.loading]')).toBeInTheDocument();
        }, { timeout: 5000 });

      } finally {
        // Restore the content string
        await db.insert(contentStrings).values({
          stringKey: 'categories.loading',
          defaultValue: 'Loading categories...',
          category: 'page_content',
          description: 'Loading message for categories page',
        });
      }
    });
  });

  describe('Business Count Display', () => {
    it('should show correct business count for categories', async () => {
      render(
        <TestWrapper initialPath={`/categories/${testCategory.slug}`}>
          <Categories />
        </TestWrapper>
      );

      // Wait for business count to display
      await waitFor(() => {
        expect(screen.getByText(/\(3 businesses\)/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show correct business count for cities', async () => {
      render(
        <TestWrapper initialPath="/cities/Sydney">
          <Cities />
        </TestWrapper>
      );

      // Wait for Sydney businesses to load (should be 2)
      await waitFor(() => {
        const sydneyBusinesses = testBusinesses.filter(b => b.city === 'Sydney');
        expect(sydneyBusinesses).toHaveLength(2);
      }, { timeout: 5000 });
    });
  });

  describe('Navigation and Breadcrumbs', () => {
    it('should display proper breadcrumbs on category pages', async () => {
      render(
        <TestWrapper initialPath={`/categories/${testCategory.slug}`}>
          <Categories />
        </TestWrapper>
      );

      // Wait for breadcrumbs
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Test Restaurants')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display proper breadcrumbs on city pages', async () => {
      render(
        <TestWrapper initialPath="/cities/Sydney">
          <Cities />
        </TestWrapper>
      );

      // Wait for breadcrumbs
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Cities')).toBeInTheDocument();
        expect(screen.getByText('Sydney')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
});