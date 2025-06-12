import { UserManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminUsersPage() {
  return (
    <AdminPageLayout title="User Management" description="Manage user accounts and permissions">
      <UserManagement />
    </AdminPageLayout>
  );
}