'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AnimationType =
  | 'bounce'
  | 'pulse'
  | 'spin'
  | 'ping'
  | 'out-bounce'
  | 'out-slide-left'
  | 'out-slide-right'
  | 'out-slide-up'
  | 'out-slide-down'
  | 'out-fade'
  | 'out-scale';

type AnimateIconProps = {
  children: React.ReactNode;
  animateOnHover?: boolean;
  animation?: AnimationType;
  className?: string;
};

const animationClasses: Record<AnimationType, string> = {
  bounce: 'hover:animate-bounce',
  pulse: 'hover:animate-pulse',
  spin: 'hover:animate-spin',
  ping: 'hover:animate-ping',
  'out-bounce': 'hover:animate-bounce focus:animate-bounce',
  'out-slide-left': 'hover:-translate-x-1 transition-transform duration-200',
  'out-slide-right': 'hover:translate-x-1 transition-transform duration-200',
  'out-slide-up': 'hover:-translate-y-1 transition-transform duration-200',
  'out-slide-down': 'hover:translate-y-1 transition-transform duration-200',
  'out-fade': 'hover:opacity-75 transition-opacity duration-200',
  'out-scale': 'hover:scale-110 transition-transform duration-200',
};

export function AnimateIcon({
  children,
  animateOnHover = false,
  animation = 'bounce',
  className,
  ...props
}: AnimateIconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        animateOnHover || animation !== 'bounce' ? animationClasses[animation] : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
