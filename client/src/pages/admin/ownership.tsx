import { OwnershipManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminOwnershipPage() {
  return (
    <AdminPageLayout title="Ownership Management" description="Manage business ownership claims and verifications">
      <OwnershipManagement />
    </AdminPageLayout>
  );
}