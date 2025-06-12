import { ImportManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminImportPage() {
  return (
    <AdminPageLayout title="Import & Export Management" description="Import businesses via CSV and export data">
      <ImportManagement />
    </AdminPageLayout>
  );
}