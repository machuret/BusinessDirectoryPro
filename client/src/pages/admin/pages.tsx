import { CMSManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminPagesPage() {
  return (
    <AdminPageLayout title="Page Management" description="Create and manage CMS pages">
      <CMSManagement />
    </AdminPageLayout>
  );
}