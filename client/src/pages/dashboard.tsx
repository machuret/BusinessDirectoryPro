import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/contexts/ContentContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Star } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessesSection from "@/components/dashboard/BusinessesSection";
import ClaimsSection from "@/components/dashboard/ClaimsSection";
import { FeaturedRequestsSection } from "@/components/dashboard/FeaturedRequestsSection";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useContent();
  const [activeTab, setActiveTab] = useState("businesses");

  // Data queries
  const { data: ownedBusinesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!user,
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: [`/api/ownership-claims/user/${user?.id}`],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span>{t("dashboard.access.denied.title", "Access Denied")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("dashboard.access.denied.message", "Please log in to access your dashboard.")}</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("dashboard.page.title", "Business Dashboard")}</h1>
          <p className="text-muted-foreground mt-2">{t("dashboard.page.subtitle", "Manage your businesses and ownership claims")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="businesses" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>My Businesses</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Ownership Claims</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Featured Requests</span>
            </TabsTrigger>
          </TabsList>

          {/* My Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            <BusinessesSection 
              businesses={ownedBusinesses || []} 
              isLoading={businessesLoading} 
            />
          </TabsContent>

          {/* Ownership Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <ClaimsSection 
              claims={ownershipClaims || []} 
              isLoading={claimsLoading} 
            />
          </TabsContent>

          {/* Featured Requests Tab */}
          <TabsContent value="featured" className="space-y-6">
            <FeaturedRequestsSection 
              userId={user.id} 
              userBusinesses={ownedBusinesses || []} 
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}