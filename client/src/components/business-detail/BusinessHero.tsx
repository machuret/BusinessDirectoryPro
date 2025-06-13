import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessHeroProps {
  business: BusinessWithCategory;
  heroImage: string;
}

export function BusinessHero({ business, heroImage }: BusinessHeroProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="relative h-64 md:h-96 overflow-hidden">
      <img
        src={heroImage}
        alt={business.title || "Business"}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format';
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white">{business.title}</h1>
          {business.subtitle && (
            <p className="text-lg md:text-xl text-gray-200">{business.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {business.categoryname && (
              <Badge variant="secondary">{business.categoryname}</Badge>
            )}
            {business.city && (
              <Link href={`/businesses?city=${encodeURIComponent(business.city)}`} className="flex items-center gap-1 text-gray-200 hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
                {business.city}
              </Link>
            )}
            {business.totalscore && typeof business.totalscore === 'number' && business.totalscore > 0 && (
              <div className="flex items-center gap-1">
                {renderStars(business.totalscore)}
                <span className="ml-1 text-gray-200">
                  {Number(business.totalscore).toFixed(1)}
                  {business.reviewscount && ` (${business.reviewscount} reviews)`}
                </span>
              </div>
            )}
            {business.featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}