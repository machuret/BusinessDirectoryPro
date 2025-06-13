import React from 'react';
import { cn } from '@/lib/utils';

interface FlexContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'responsive-sm' | 'responsive-md' | 'responsive-lg';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  responsive?: {
    sm?: {
      direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
      justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
      align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    };
    md?: {
      direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
      justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
      align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    };
    lg?: {
      direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
      justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
      align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    };
  };
}

export function FlexContainer({
  children,
  className,
  direction = 'row',
  wrap = 'wrap',
  gap = 'md',
  justify = 'start',
  align = 'start',
  responsive
}: FlexContainerProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
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

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const responsiveClasses = responsive ? [
    responsive.sm?.direction && `sm:${directionClasses[responsive.sm.direction]}`,
    responsive.sm?.justify && `sm:${justifyClasses[responsive.sm.justify]}`,
    responsive.sm?.align && `sm:${alignClasses[responsive.sm.align]}`,
    responsive.md?.direction && `md:${directionClasses[responsive.md.direction]}`,
    responsive.md?.justify && `md:${justifyClasses[responsive.md.justify]}`,
    responsive.md?.align && `md:${alignClasses[responsive.md.align]}`,
    responsive.lg?.direction && `lg:${directionClasses[responsive.lg.direction]}`,
    responsive.lg?.justify && `lg:${justifyClasses[responsive.lg.justify]}`,
    responsive.lg?.align && `lg:${alignClasses[responsive.lg.align]}`
  ].filter(Boolean) : [];

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      wrapClasses[wrap],
      gapClasses[gap],
      justifyClasses[justify],
      alignClasses[align],
      ...responsiveClasses,
      className
    )}>
      {children}
    </div>
  );
}

export default FlexContainer;