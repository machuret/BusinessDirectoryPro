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
  
  // Handle different route parameters: city, cityName, or citySlug
  const currentCity = city || cityName || citySlug;

  // If no city specified, show all cities
  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    enabled: !currentCity,
  });

  // If city specified, show businesses in that city
  // Convert slug back to city name if needed (e.g., "nundah" -> "Nundah")
  const cityForAPI = currentCity ? currentCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  
  const { data: businesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: [`/api/cities/${cityForAPI}/businesses`],
    enabled: !!currentCity,
  });

  const displayCity = currentCity ? cityForAPI : 'Unknown City';

  if (citiesLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{t('cities.loading')}</p>
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
        {!currentCity ? (
          // Cities overview page
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('cities.browsing.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('cities.browsing.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cities?.map((cityData) => (
                <Link key={cityData.city} href={`/location/${encodeURIComponent(cityData.city.toLowerCase())}`}>
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
                          <span>{cityData.count} {cityData.count === 1 ? t('cities.businesses.singular') : t('cities.businesses.plural')}</span>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('cities.empty.title')}</h3>
                <p className="text-gray-600">{t('cities.empty.description')}</p>
              </div>
            )}
          </>
        ) : (
          // Specific city page
          <>
            <div className="mb-8">
              <nav className="text-sm breadcrumbs mb-4">
                <ol className="flex items-center space-x-2 text-gray-600">
                  <li><Link href="/" className="hover:text-primary">{t('cities.breadcrumbs.home')}</Link></li>
                  <li>/</li>
                  <li><Link href="/cities" className="hover:text-primary">{t('cities.breadcrumbs.cities')}</Link></li>
                  <li>/</li>
                  <li className="text-gray-900 font-medium">{displayCity}</li>
                </ol>
              </nav>
              
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('cities.cityPage.title', { cityName: displayCity })}
                </h1>
              </div>
              
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