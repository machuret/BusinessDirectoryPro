import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { BusinessWithCategory } from "@shared/schema";

export default function BusinessDebug() {
  const { slug } = useParams();
  
  const { data: business, isLoading, error } = useQuery<BusinessWithCategory>({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1>Loading business data...</h1>
        <p>Slug: {slug}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100">
        <h1>Error loading business</h1>
        <p>Error: {(error as Error).message}</p>
        <p>Slug: {slug}</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8 bg-yellow-100">
        <h1>No business found</h1>
        <p>Slug: {slug}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Business Debug Page</h1>
      
      <div className="bg-green-100 p-4 rounded mb-4">
        <h2 className="text-xl font-bold">✅ Business Found!</h2>
        <p><strong>Title:</strong> {business.title || 'No title'}</p>
        <p><strong>Slug:</strong> {business.slug}</p>
        <p><strong>Place ID:</strong> {business.placeid}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">Contact Information:</h3>
        <p><strong>Phone:</strong> {business.phone || 'No phone'}</p>
        <p><strong>Website:</strong> {business.website || 'No website'}</p>
        <p><strong>Address:</strong> {business.address || 'No address'}</p>
        <p><strong>City:</strong> {business.city || 'No city'}</p>
        <p><strong>State:</strong> {business.state || 'No state'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">Business Details:</h3>
        <p><strong>Description:</strong> {business.description || 'No description'}</p>
        <p><strong>Category:</strong> {business.categoryname || 'No category'}</p>
        <p><strong>Rating:</strong> {business.totalscore || 'No rating'}</p>
        <p><strong>Reviews:</strong> {business.reviewscount || 'No reviews'}</p>
      </div>

      <div className="bg-gray-200 p-4 rounded">
        <h3 className="font-bold mb-2">Raw Data:</h3>
        <pre className="text-xs overflow-auto max-h-40">
          {JSON.stringify(business, null, 2)}
        </pre>
      </div>
    </div>
  );
}