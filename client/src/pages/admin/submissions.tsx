import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubmissionsPage() {
  return (
    <AdminPageLayout title="Business Submissions" description="Review and approve new business submissions">
      <Card>
        <CardHeader>
          <CardTitle>Pending Business Submissions</CardTitle>
          <CardDescription>Review and approve new business listings submitted by users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Business submission management will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}