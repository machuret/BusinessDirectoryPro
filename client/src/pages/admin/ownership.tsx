import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import OwnershipManagement from "@/components/admin/sections/OwnershipManagement";

export default function AdminOwnershipPage() {
  return (
    <AdminPageLayout 
      title="Business Ownership Claims" 
      description="Review and approve business ownership verification requests"
    >
      <OwnershipManagement />
    </AdminPageLayout>
  );
}