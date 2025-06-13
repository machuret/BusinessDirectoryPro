import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDetailProps {
  preloadedBusiness?: BusinessWithCategory;
}

export default function BusinessDetail(props: BusinessDetailProps = {}) {
  const { preloadedBusiness } = props;
  const { slug } = useParams();
  
  // Use preloaded business if available, otherwise fetch from API
  const { data: fetchedBusiness, isLoading: businessLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug && !preloadedBusiness,
  });
  
  const business = preloadedBusiness || fetchedBusiness;

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The business you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {business.title || business.placeid}
            </h1>
            
            {business.subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{business.subtitle}</p>
            )}
            
            {business.description && (
              <div className="text-gray-700 dark:text-gray-300 mb-4">
                <p>{business.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-800 dark:text-gray-200">
              {business.phone && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Phone:</strong>
                  <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                    {business.phone}
                  </a>
                </div>
              )}
              
              {business.website && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Website:</strong>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline break-all">
                    {business.website}
                  </a>
                </div>
              )}
              
              {(business.address || business.city || business.state) && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Address:</strong>
                  <div>
                    {business.address && <div>{business.address}</div>}
                    {(business.city || business.state) && (
                      <div>
                        {business.city}{business.city && business.state && ', '}{business.state}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {business.categoryname && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Category:</strong>
                  <span>{business.categoryname}</span>
                </div>
              )}
              
              {business.totalscore && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Rating:</strong>
                  <span>{business.totalscore}/5</span>
                </div>
              )}
              
              {business.totalreviews && (
                <div className="flex flex-col">
                  <strong className="text-gray-900 dark:text-white">Reviews:</strong>
                  <span>{business.totalreviews} reviews</span>
                </div>
              )}
            </div>

            {/* Show main image if available */}
            {business.imageurl && (
              <div className="mt-6">
                <img 
                  src={business.imageurl} 
                  alt={business.title || 'Business image'}
                  className="w-full max-w-md rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Debug Info:</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p><strong>Slug:</strong> {slug}</p>
                <p><strong>Place ID:</strong> {business.placeid}</p>
                <p><strong>Data source:</strong> {preloadedBusiness ? 'Preloaded' : 'API Fetch'}</p>
                <p><strong>Has title:</strong> {business.title ? 'Yes' : 'No'}</p>
                <p><strong>Has description:</strong> {business.description ? 'Yes' : 'No'}</p>
                <p><strong>Has phone:</strong> {business.phone ? 'Yes' : 'No'}</p>
                <p><strong>Has website:</strong> {business.website ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}