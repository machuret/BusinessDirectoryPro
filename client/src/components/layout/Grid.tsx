import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'responsive-sm' | 'responsive-md' | 'responsive-lg';
  colsResponsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

export function Grid({
  children,
  className,
  cols = 'auto',
  gap = 'md',
  colsResponsive,
  alignItems,
  justifyItems
}: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-10',
    '3xl': 'gap-12',
    'responsive-sm': 'gap-responsive-sm',
    'responsive-md': 'gap-responsive-md',
    'responsive-lg': 'gap-responsive-lg'
  };

  const alignItemsClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyItemsClasses = {
    start: 'justify-items-start',
    center: 'justify-items-center',
    end: 'justify-items-end',
    stretch: 'justify-items-stretch'
  };

  const responsiveClasses = colsResponsive ? [
    colsResponsive.sm && `sm:grid-cols-${colsResponsive.sm}`,
    colsResponsive.md && `md:grid-cols-${colsResponsive.md}`,
    colsResponsive.lg && `lg:grid-cols-${colsResponsive.lg}`,
    colsResponsive.xl && `xl:grid-cols-${colsResponsive.xl}`
  ].filter(Boolean) : [];

  return (
    <div className={cn(
      'grid',
      cols !== 'auto' && colsClasses[cols],
      cols === 'auto' && colsClasses.auto,
      gapClasses[gap],
      alignItems && alignItemsClasses[alignItems],
      justifyItems && justifyItemsClasses[justifyItems],
      ...responsiveClasses,
      className
    )}>
      {children}
    </div>
  );
}

export default Grid;