import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import type { BusinessWithCategory } from "@shared/schema";

interface City {
  city: string;
  count: number;
}

export default function Cities() {
  const { city } = useParams();

  // If no city specified, show all cities
  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    enabled: !city,
  });

  // If city specified, show businesses in that city
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/cities/${city}/businesses`],
    enabled: !!city,
  });

  const decodedCity = city ? decodeURIComponent(city) : null;

  if (citiesLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {!city ? (
          // Cities overview page
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by City
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover local businesses in cities across our directory
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cities?.map((cityData) => (
                <Link key={cityData.city} href={`/cities/${encodeURIComponent(cityData.city)}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{cityData.city}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>{cityData.count} businesses</span>
                        </div>
                        <Badge variant="outline">
                          {cityData.count}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {cities?.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
                <p className="text-gray-600">No businesses with city information are available.</p>
              </div>
            )}
          </>
        ) : (
          // Specific city page
          <>
            <div className="mb-8">
              <nav className="text-sm breadcrumbs mb-4">
                <ol className="flex items-center space-x-2 text-gray-600">
                  <li><Link href="/" className="hover:text-primary">Home</Link></li>
                  <li>/</li>
                  <li><Link href="/cities" className="hover:text-primary">Cities</Link></li>
                  <li>/</li>
                  <li className="text-gray-900 font-medium">{decodedCity}</li>
                </ol>
              </nav>
              
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Businesses in {decodedCity}
                </h1>
              </div>
              
              <p className="text-lg text-gray-600">
                Discover local businesses and services in {decodedCity}
              </p>
            </div>

            {businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard
                    key={business.placeid}
                    business={business}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No businesses found in {decodedCity}
                </h3>
                <p className="text-gray-600">
                  We don't have any businesses listed for this city yet.
                </p>
                <Link href="/cities" className="inline-block mt-4 text-primary hover:underline">
                  Browse other cities
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}