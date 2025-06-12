import { OwnershipManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminOwnershipPage() {
  return (
    <AdminPageLayout title="Ownership Requests" description="Manage business ownership claims and verification">
      <OwnershipManagement />
    </AdminPageLayout>
  );
}