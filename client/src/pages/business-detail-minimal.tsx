import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDetailProps {
  preloadedBusiness?: BusinessWithCategory;
}

export default function BusinessDetailMinimal(props: BusinessDetailProps = {}) {
  const { preloadedBusiness } = props;
  const { slug } = useParams();
  
  const { data: fetchedBusiness, isLoading } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug && !preloadedBusiness,
  });
  
  const business = preloadedBusiness || fetchedBusiness;
  
  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="min-h-screen p-8">
        <div>Business not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{business.title || 'Business'}</h1>
      <p className="text-gray-600 mb-4">{business.subtitle}</p>
      <p className="mb-4">{business.description}</p>
      
      <div className="bg-gray-100 p-4 rounded mt-8">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>Slug: {slug}</p>
        <p>Place ID: {business.placeid}</p>
        <p>Category: {business.categoryname}</p>
        <p>Data source: {preloadedBusiness ? 'Preloaded' : 'API Fetch'}</p>
      </div>
    </div>
  );
}