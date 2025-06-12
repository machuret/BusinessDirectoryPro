import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOwnershipPage() {
  return (
    <AdminPageLayout title="Ownership Requests" description="Manage business ownership claims and verification">
      <Card>
        <CardHeader>
          <CardTitle>Business Ownership Claims</CardTitle>
          <CardDescription>Review and approve business ownership verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Ownership request management will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}