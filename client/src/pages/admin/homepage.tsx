import { HomepageManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminHomepagePage() {
  return (
    <AdminPageLayout title="Homepage Management" description="Customize homepage content and layout">
      <HomepageManagement />
    </AdminPageLayout>
  );
}