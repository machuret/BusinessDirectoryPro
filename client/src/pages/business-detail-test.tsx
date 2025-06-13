import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessDetailProps {
  preloadedBusiness?: BusinessWithCategory;
}

export default function BusinessDetailTest({ preloadedBusiness }: BusinessDetailProps = {}) {
  const { slug } = useParams();
  
  const { data: fetchedBusiness, isLoading, error } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug && !preloadedBusiness,
  });
  
  const business = preloadedBusiness || fetchedBusiness;
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading business...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {(error as Error).message}</div>;
  }
  
  if (!business) {
    return <div className="p-8 text-center">Business not found</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{business.title}</h1>
      <p className="text-gray-600 mb-4">{business.subtitle}</p>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <p>Slug: {slug}</p>
        <p>Place ID: {business.placeid}</p>
        <p>Has preloaded: {preloadedBusiness ? 'Yes' : 'No'}</p>
        <p>Category: {business.categoryname}</p>
      </div>
    </div>
  );
}