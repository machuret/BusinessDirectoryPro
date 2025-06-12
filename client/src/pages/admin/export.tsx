import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminExportPage() {
  return (
    <AdminPageLayout title="Export Tool" description="Export business data and generate reports">
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export business data and generate comprehensive reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Data export functionality will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}