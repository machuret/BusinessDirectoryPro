import { BusinessManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminBusinessesPage() {
  return (
    <AdminPageLayout title="Business Management" description="Manage business listings and information">
      <BusinessManagement />
    </AdminPageLayout>
  );
}