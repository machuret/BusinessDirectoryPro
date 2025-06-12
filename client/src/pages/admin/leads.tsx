import { LeadsManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminLeadsPage() {
  return (
    <AdminPageLayout title="Leads Management" description="Manage customer inquiries and business leads">
      <LeadsManagement />
    </AdminPageLayout>
  );
}