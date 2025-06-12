import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import ServicesManagement from "@/components/admin/sections/ServicesManagement";

export default function AdminServicesPage() {
  return (
    <AdminPageLayout 
      title="Services Management" 
      description="Manage generic services that can be linked to businesses"
    >
      <ServicesManagement />
    </AdminPageLayout>
  );
}