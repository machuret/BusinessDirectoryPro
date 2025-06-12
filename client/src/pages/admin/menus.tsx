import { MenuManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminMenusPage() {
  return (
    <AdminPageLayout title="Menu Management" description="Manage navigation menus and menu items">
      <MenuManagement />
    </AdminPageLayout>
  );
}