import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Types for our content management system
type ContentStrings = Record<string, string>;

interface ContentContextType {
  t: (key: string) => string;
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

// Create the context with undefined as default (will be provided by provider)
const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

/**
 * ContentProvider component that manages all website text content
 * Fetches content strings from the backend API and provides translation function
 */
export function ContentProvider({ children }: ContentProviderProps) {
  const [contentStrings, setContentStrings] = useState<ContentStrings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch content strings from the backend API
   */
  const fetchContentStrings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/content/strings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content strings: ${response.status} ${response.statusText}`);
      }

      const strings: ContentStrings = await response.json();
      setContentStrings(strings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching content strings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Translation function that looks up content strings by key
   * Returns fallback text if key is not found to help identify missing strings
   */
  const t = (key: string): string => {
    const value = contentStrings[key];
    
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }

    // Return visible fallback for missing keys to aid development
    return `[${key}]`;
  };

  // Fetch content strings when the component mounts
  useEffect(() => {
    fetchContentStrings();
  }, []);

  // Create the context value
  const contextValue: ContentContextType = {
    t,
    isLoading,
    error,
    refreshContent: fetchContentStrings,
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * Custom hook to access content management functionality
 * Provides the translation function and loading/error states
 */
export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  
  return context;
}

/**
 * Higher-order component to wrap components that need content access
 * Useful for components that need translation functionality
 */
export function withContent<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ContentProvider>
        <Component {...props} />
      </ContentProvider>
    );
  };
}