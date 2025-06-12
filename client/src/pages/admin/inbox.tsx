import { InboxManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminInboxPage() {
  return (
    <AdminPageLayout title="Inbox Management" description="Manage contact form messages and leads">
      <InboxManagement />
    </AdminPageLayout>
  );
}