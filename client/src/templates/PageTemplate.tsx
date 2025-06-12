import { ReactNode } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LoadingState } from "@/components/loading/LoadingState";
import { ErrorState } from "@/components/error/ErrorState";

// Standard page props interface
interface PageTemplateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

// Standard page layout component
export function PageTemplate({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  className = ""
}: PageTemplateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Header />
      <main className="container mx-auto p-6">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}
        
        {error ? (
          <ErrorState
            title="Error Loading Page"
            message={error.message}
            onRetry={onRetry}
            showHome={true}
            variant="page"
          />
        ) : isLoading ? (
          <LoadingState variant="spinner" size="lg" message="Loading page..." />
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}

// Admin page template
export function AdminPageTemplate({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  className = ""
}: PageTemplateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      
      {error ? (
        <ErrorState
          title="Error Loading Content"
          message={error.message}
          onRetry={onRetry}
          variant="card"
        />
      ) : isLoading ? (
        <LoadingState variant="spinner" size="md" message="Loading..." />
      ) : (
        children
      )}
    </div>
  );
}

export default PageTemplate;