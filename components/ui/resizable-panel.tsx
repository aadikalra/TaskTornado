'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Direction = 'top' | 'right' | 'bottom' | 'left';

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  children: React.ReactNode;
  className?: string;
  onResize?: (size: number) => void;
}

export function ResizablePanel({
  direction = 'right',
  minSize = 200,
  maxSize = 1200,
  defaultSize = 384, // 96rem = 384px (w-96)
  children,
  className,
  onResize,
  ...props
}: ResizablePanelProps) {
  const [size, setSize] = React.useState(defaultSize);
  const isResizing = React.useRef(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const startPos = React.useRef(0);
  const startSize = React.useRef(0);

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    isResizing.current = true;
    startPos.current = direction === 'right' ? e.clientX : e.clientY;
    startSize.current = size;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = direction === 'right' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const delta = direction === 'right' 
      ? startPos.current - e.clientX 
      : startPos.current - e.clientY;
    
    let newSize = startSize.current + (direction === 'right' ? -delta : delta);
    newSize = Math.max(minSize, Math.min(maxSize, newSize));
    
    setSize(newSize);
    if (onResize) onResize(newSize);
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Memoize the cleanup function to prevent unnecessary effect re-runs
  const cleanup = React.useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  }, [handleMouseMove, stopResize]);

  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const style = {
    [direction === 'right' ? 'width' : 'height']: `${size}px`,
    minWidth: direction === 'right' ? `${minSize}px` : undefined,
    maxWidth: direction === 'right' ? `${maxSize}px` : undefined,
    minHeight: direction === 'bottom' ? `${minSize}px` : undefined,
    maxHeight: direction === 'bottom' ? `${maxSize}px` : undefined,
  };

  return (
    <div 
      ref={panelRef}
      className={cn(
        'relative',
        direction === 'right' && 'flex flex-col',
        className
      )}
      style={style}
      {...props}
    >
      {children}
      <div
        className={cn(
          'absolute z-10 bg-transparent hover:bg-primary/20 transition-colors',
          direction === 'right' ? 'w-2 -right-1 top-0 bottom-0 cursor-col-resize' : 'h-2 left-0 right-0 -bottom-1 cursor-row-resize',
          'flex items-center justify-center'
        )}
        onMouseDown={startResize}
      >
        <div className={cn(
          'bg-gray-300 dark:bg-gray-600 rounded-full',
          direction === 'right' ? 'w-1 h-12' : 'h-1 w-12'
        )} />
      </div>
    </div>
  );
}
