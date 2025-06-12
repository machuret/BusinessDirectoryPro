import { ReviewManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminReviewsPage() {
  return (
    <AdminPageLayout title="Review Management" description="Manage and moderate business reviews">
      <ReviewManagement />
    </AdminPageLayout>
  );
}