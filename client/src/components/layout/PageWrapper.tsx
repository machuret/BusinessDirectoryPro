import React from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  headerVariant?: 'default' | 'minimal' | 'admin';
  footerVariant?: 'default' | 'minimal';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function PageWrapper({
  children,
  title,
  description,
  className,
  showSidebar = false,
  sidebarContent,
  headerVariant = 'default',
  footerVariant = 'default',
  maxWidth = 'xl',
  padding = 'md'
}: PageWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="hidden lg:block w-64 bg-background border-r">
            <div className="p-6">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 w-full',
          paddingClasses[padding]
        )}>
          <div className={cn(
            'mx-auto',
            maxWidthClasses[maxWidth],
            className
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PageWrapper;