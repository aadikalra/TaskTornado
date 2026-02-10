'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type DockItemData = {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  type?: 'item' | 'divider';
  dataTour?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  isActive?: boolean;
  dataTour?: string;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive,
  dataTour
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={cn(
        "rounded-[1.25rem] backdrop-blur-xl border cursor-pointer outline-none box-border hover:bg-white/95 dark:hover:bg-slate-800/95", // Squircle shape
        !isActive && "bg-white/90 dark:bg-slate-800/90 border-white/50 dark:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
        className
      )}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      data-tour={dataTour}
    >
      {isActive && (
        <motion.div
          layoutId="dock-item-active-bg"
          className="absolute inset-0 bg-[#264f84]/15 dark:bg-blue-50/20 border-2 border-[#264f84]/30 dark:border-blue-400/30 rounded-[1.25rem] shadow-[0_4px_12px_rgba(38,79,132,0.1)]"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30
          }}
        />
      )}
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
      {isActive && (
        <motion.div
          layoutId="dock-active-dot"
          className="absolute -bottom-1.5 w-1 h-1 bg-[#264f84] dark:bg-blue-400 rounded-full"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
            layout: { duration: 0.2 }
          }}
        />
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-xs text-gray-800 dark:text-gray-100 shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const height = useMemo(() => panelHeight, [panelHeight]);

  // Responsive values
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const responsiveBaseSize = isMobile ? baseItemSize * 1.2 : baseItemSize;
  const responsiveMagnification = isMobile ? magnification * 1.2 : magnification;
  const responsiveDistance = isMobile ? distance * 0.8 : distance;
  const responsiveGap = isMobile ? '0.5rem' : '1rem';
  const responsivePadding = isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem';
  const responsiveHeight = isMobile ? 72 : 68;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 flex justify-center z-50 px-2 sm:px-4 fixed-padding-adjust"
      style={{ pointerEvents: 'none' }}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} flex items-end w-fit mb-2 sm:mb-4 rounded-[1.75rem] bg-white/25 dark:bg-slate-900/25 backdrop-blur-3xl border border-white/40 dark:border-white/15 box-border pointer-events-auto shadow-[0_12px_48px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.7),0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.2)] overflow-visible max-w-full`}
        style={{
          height: `${responsiveHeight}px`,
          display: 'flex',
          alignItems: 'flex-end',
          width: 'fit-content',
          gap: responsiveGap,
          padding: responsivePadding,
        }}
        role="toolbar"
        aria-label="Application dock"
        data-tour="dock"
      >
        {items.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div
                key={`divider-${index}`}
                className="w-[1px] bg-slate-400/30 dark:bg-slate-500/30 self-center"
                style={{ height: `${responsiveBaseSize * 0.6}px`, margin: '0 4px' }}
              />
            );
          }

          return (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={responsiveDistance}
              magnification={responsiveMagnification}
              baseItemSize={responsiveBaseSize}
              isActive={item.isActive}
              dataTour={item.dataTour}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          );
        })}
      </motion.div>
    </motion.div>
  );
}