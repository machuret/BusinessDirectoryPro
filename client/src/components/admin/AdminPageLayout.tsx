interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminPageLayout({ title, description, children }: AdminPageLayoutProps) {
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