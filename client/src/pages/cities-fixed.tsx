import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessCard from "@/components/business-card";
import BusinessCardSkeleton from "@/components/business-card-skeleton";
import { useContent } from "@/contexts/ContentContext";
import type { BusinessWithCategory } from "@shared/schema";

interface City {
  city: string;
  count: number;
}

export default function Cities() {
  const { city, cityName, citySlug } = useParams();
  const { t } = useContent();
  
  // Handle different route parameters
  const currentCity = city || cityName || citySlug;

  // If no city specified, show all cities
  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    enabled: !currentCity,
  });

  // If city specified, show businesses in that city
  const cityForAPI = currentCity ? currentCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/cities/${cityForAPI}/businesses`],
    enabled: !!currentCity,
  });

  const displayCity = cityForAPI || currentCity;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {!currentCity ? (
          <>
            {/* All Cities View */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t('cities.allCities.title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('cities.allCities.description')}
              </p>
            </div>

            {citiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : cities && cities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cities.map((cityData, index) => (
                  <Link
                    key={`city-${cityData.city}-${index}`}
                    href={`/cities/${cityData.city.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {cityData.city}
                        </CardTitle>
                        <CardDescription>
                          <Badge variant="secondary">
                            {cityData.count} {cityData.count === 1 ? 'business' : 'businesses'}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('cities.noCities.title')}
                </h3>
                <p className="text-gray-600">
                  {t('cities.noCities.description')}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Single City View */}
            <div className="mb-8">
              <nav className="text-sm breadcrumbs mb-4">
                <Link href="/cities" className="text-primary hover:underline">
                  {t('cities.breadcrumb.cities')}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-600">{displayCity}</span>
              </nav>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t('cities.cityPage.title', { cityName: displayCity })}
              </h1>
              
              <p className="text-lg text-gray-600">
                {t('cities.cityPage.description', { cityName: displayCity })}
              </p>
            </div>

            {businessesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BusinessCardSkeleton count={6} />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses
                  .filter((business, index, array) => 
                    array.findIndex(b => b.placeid === business.placeid) === index
                  )
                  .map((business, index) => (
                    <BusinessCard
                      key={`city-${business.placeid}-${index}`}
                      business={business}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('cities.cityEmpty.title', { cityName: displayCity })}
                </h3>
                <p className="text-gray-600">
                  {t('cities.cityEmpty.description')}
                </p>
                <Link href="/cities" className="inline-block mt-4 text-primary hover:underline">
                  {t('cities.cityEmpty.browseLink')}
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