import React from 'react';
import { cn } from '@/lib/utils';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

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
      <Header variant={headerVariant} />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar className="hidden lg:block">
            {sidebarContent}
          </Sidebar>
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
      <Footer variant={footerVariant} />
    </div>
  );
}

export default PageWrapper;