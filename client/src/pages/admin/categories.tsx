import { CategoryManagement } from "@/components/admin/sections";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminCategoriesPage() {
  return (
    <AdminPageLayout title="Category Management" description="Manage business categories and subcategories">
      <CategoryManagement />
    </AdminPageLayout>
  );
}