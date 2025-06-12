import { BusinessSubmissions } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminSubmissionsPage() {
  return (
    <AdminPageLayout title="Business Submissions" description="Review and approve new business submissions">
      <BusinessSubmissions />
    </AdminPageLayout>
  );
}