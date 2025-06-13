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
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-2">{business.title}</h1>
            {business.subtitle && (
              <p className="text-xl text-gray-600 mb-4">{business.subtitle}</p>
            )}
            {business.description && (
              <p className="text-gray-700 mb-4">{business.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {business.phone && (
                <div>
                  <strong>Phone:</strong> {business.phone}
                </div>
              )}
              {business.website && (
                <div>
                  <strong>Website:</strong> 
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    Visit Website
                  </a>
                </div>
              )}
              {business.address && (
                <div>
                  <strong>Address:</strong> {business.address}
                  {business.city && `, ${business.city}`}
                  {business.state && `, ${business.state}`}
                </div>
              )}
              {business.categoryname && (
                <div>
                  <strong>Category:</strong> {business.categoryname}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold">Debug Info:</h3>
              <p>Slug: {slug}</p>
              <p>Place ID: {business.placeid}</p>
              <p>Data source: {preloadedBusiness ? 'Preloaded' : 'API Fetch'}</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}