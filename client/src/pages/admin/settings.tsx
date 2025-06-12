import { SettingsManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminSettingsPage() {
  return (
    <AdminPageLayout title="System Settings" description="Manage system configuration and global settings">
      <SettingsManagement />
    </AdminPageLayout>
  );
}