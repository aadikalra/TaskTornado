'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AnimateIconProps = {
  children: React.ReactNode;
  animateOnHover?: boolean;
  className?: string;
};

export function AnimateIcon({
  children,
  animateOnHover = false,
  className,
  ...props
}: AnimateIconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        {
          'hover:animate-bounce': animateOnHover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
