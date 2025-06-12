import { ImportManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminImportPage() {
  return (
    <AdminPageLayout title="Import Tool" description="Import business data from CSV files">
      <ImportManagement />
    </AdminPageLayout>
  );
}