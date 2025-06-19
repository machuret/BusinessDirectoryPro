import React from 'react';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
  className?: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  className,
  children,
  isCollapsed = false,
  onToggle
}) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className={cn(
          "font-semibold text-lg transition-opacity duration-200",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          Menu
        </h2>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-sidebar-accent"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "transition-transform duration-200",
                isCollapsed ? "rotate-180" : "rotate-0"
              )}
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {children}
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  isCollapsed = false
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      title={isCollapsed ? label : undefined}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      {!isCollapsed && (
        <span className="truncate">{label}</span>
      )}
    </button>
  );
};

export default ModernSidebar;