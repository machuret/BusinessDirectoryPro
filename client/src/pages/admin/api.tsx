import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAPIPage() {
  return (
    <AdminPageLayout title="API Management" description="Manage API keys and external service settings">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Manage external service API keys and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">API key management will be available here.</p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}