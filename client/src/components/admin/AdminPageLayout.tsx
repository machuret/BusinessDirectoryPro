import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminPageLayout({ title, description, children }: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}