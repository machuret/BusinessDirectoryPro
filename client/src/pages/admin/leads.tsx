import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLeadsPage() {
  return (
    <AdminPageLayout title="Leads Management" description="Manage customer inquiries and business leads">
      <Card>
        <CardHeader>
          <CardTitle>Customer Leads</CardTitle>
          <CardDescription>View and manage customer inquiries and business leads</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Lead management functionality will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}