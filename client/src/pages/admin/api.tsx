import { APIManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminAPIPage() {
  return (
    <AdminPageLayout title="API Management" description="Manage API keys and external service settings">
      <APIManagement />
    </AdminPageLayout>
  );
}