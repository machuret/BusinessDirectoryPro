import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminImportPage() {
  return (
    <AdminPageLayout title="Import Tool" description="Import business data from CSV files">
      <Card>
        <CardHeader>
          <CardTitle>CSV Data Import</CardTitle>
          <CardDescription>Import business listings and data from CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">CSV import functionality will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}