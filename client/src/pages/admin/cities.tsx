import { CitiesManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminCitiesPage() {
  return (
    <AdminPageLayout title="City Management" description="Manage cities and location-based filtering">
      <CitiesManagement />
    </AdminPageLayout>
  );
}