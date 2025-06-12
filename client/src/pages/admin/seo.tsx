import { SEOManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminSEOPage() {
  return (
    <AdminPageLayout title="SEO Management" description="Manage SEO settings and site optimization">
      <SEOManagement />
    </AdminPageLayout>
  );
}