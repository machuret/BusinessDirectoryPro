import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right';
}

export function Sidebar({ 
  children, 
  className, 
  width = 'md',
  position = 'left' 
}: SidebarProps) {
  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };

  const positionClasses = {
    left: 'border-r',
    right: 'border-l'
  };

  return (
    <aside className={cn(
      'flex-shrink-0 bg-background',
      widthClasses[width],
      positionClasses[position],
      className
    )}>
      <ScrollArea className="h-full">
        <div className="p-6">
          {children}
        </div>
      </ScrollArea>
    </aside>
  );
}

export default Sidebar;