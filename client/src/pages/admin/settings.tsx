import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <AdminPageLayout title="Settings" description="Configure platform settings and preferences">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration options</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">General settings will be configured here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>External service API keys and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">API configuration options will be available here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure email notifications and SMTP settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Email configuration will be managed here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}