import { APIManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminAPIPage() {
  return (
    <AdminPageLayout title="API & Optimization Management" description="Manage AI optimization and API settings">
      <APIManagement />
    </AdminPageLayout>
  );
}