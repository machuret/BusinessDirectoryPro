import { ExportManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminExportPage() {
  return (
    <AdminPageLayout title="Export Tool" description="Export business data and generate reports">
      <ExportManagement />
    </AdminPageLayout>
  );
}