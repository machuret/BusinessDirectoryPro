import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import SubmissionsManagement from "@/components/admin/sections/SubmissionsManagement";

export default function AdminSubmissionsPage() {
  return (
    <AdminPageLayout 
      title="Business Submissions" 
      description="Review and approve new business listings submitted by users"
    >
      <SubmissionsManagement />
    </AdminPageLayout>
  );
}