/**
 * BACKUP COPY of cities.tsx - WORKING PERFECTLY
 * Created: 2025-06-17
 * Status: Production Ready
 * 
 * This is a backup copy of the working cities functionality.
 * If the main file gets corrupted, restore from this backup.
 */

/**
 * 🔒 PROTECTED FILE - DO NOT EDIT
 * 
 * This cities functionality is working perfectly and has been bulletproofed.
 * User explicitly requested protection from accidental modifications.
 * 
 * ✅ STATUS: PRODUCTION READY - WORKING PERFECTLY
 * ❌ EDITING: FORBIDDEN WITHOUT USER PERMISSION
 * 
 * If changes are needed, create new files instead of modifying this one.
 */

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

  // If we have a city parameter, show businesses for that city
  if (city || cityName || citySlug) {
    const cityParam = city || cityName || citySlug;
    
    const { data: businesses = [], isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
      queryKey: ['/api/cities', cityParam, 'businesses'],
      enabled: !!cityParam,
    });

    const { data: cityInfo } = useQuery<{ city: string; count: number }>({
      queryKey: ['/api/cities', cityParam, 'info'],
      enabled: !!cityParam,
    });

    const displayCityName = cityInfo?.city || 
      cityParam?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
      cityParam;

    if (businessesLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/cities">
                <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                  ← {t('cities.backToAll', 'Back to all cities')}
                </Badge>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {t('cities.businessesIn', 'Businesses in')} {displayCityName}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {businesses.length} {t('cities.businessesFound', 'businesses found')}
            </p>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('cities.noBusinesses', 'No businesses found')}
                </h3>
                <p className="text-muted-foreground text-center">
                  {t('cities.noBusinessesDesc', 'There are no businesses listed for this city yet.')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard 
                  key={business.placeid} 
                  business={business}
                />
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Default: show all cities
  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ['/api/cities'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {t('cities.title', 'Cities')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('cities.description', 'Browse businesses by city location')}
          </p>
        </div>

        {cities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('cities.noCities', 'No cities found')}
              </h3>
              <p className="text-muted-foreground text-center">
                {t('cities.noCitiesDesc', 'There are no cities with businesses listed yet.')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cities.map((cityData) => {
              const citySlug = cityData.city.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Link 
                  key={cityData.city} 
                  href={`/location/${citySlug}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {cityData.city}
                        <Badge variant="secondary" className="ml-2">
                          {cityData.count}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {cityData.count} {cityData.count === 1 ? t('cities.business', 'business') : t('cities.businesses', 'businesses')}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}