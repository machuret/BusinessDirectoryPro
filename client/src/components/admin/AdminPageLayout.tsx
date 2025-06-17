import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "./AdminLogin";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminPageLayout({ title, description, children }: AdminPageLayoutProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login interface if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Show admin content if authenticated
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}