import { BusinessManagement } from "@/components/admin/sections";

export default function AdminBusinessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
        <p className="text-gray-600 mt-2">Manage business listings and information</p>
      </div>
      <BusinessManagement />
    </div>
  );
}