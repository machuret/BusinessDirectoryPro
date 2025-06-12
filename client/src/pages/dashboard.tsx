import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BusinessesSection from "@/components/dashboard/BusinessesSection";
import ClaimsSection from "@/components/dashboard/ClaimsSection";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");

  // Data queries
  const { data: ownedBusinesses, isLoading: businessesLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!user,
  });

  const { data: ownershipClaims, isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: [`/api/ownership-claims/user/${user?.id}`],
    enabled: !!user,
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
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to access your dashboard.</p>
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
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your businesses and ownership claims</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="businesses" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>My Businesses</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Ownership Claims</span>
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
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}