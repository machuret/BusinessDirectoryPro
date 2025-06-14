import { FeaturedManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminFeaturedPage() {
  return (
    <AdminPageLayout title="Featured Listings" description="Manage featured business listings and promotions">
      <FeaturedManagement />
    </AdminPageLayout>
  );
}