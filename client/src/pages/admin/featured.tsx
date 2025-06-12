import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFeaturedPage() {
  return (
    <AdminPageLayout title="Featured Listings" description="Manage featured business listings and promotions">
      <Card>
        <CardHeader>
          <CardTitle>Featured Business Listings</CardTitle>
          <CardDescription>Manage promoted and featured business listings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Featured listing management will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}