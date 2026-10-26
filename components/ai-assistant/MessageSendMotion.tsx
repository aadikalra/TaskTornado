'use client';

import { useLayoutEffect, type RefObject } from 'react';

export interface MessageSendTransfer {
  messageId: number;
  text: string;
  composerTop: number;
  scrollTop: number;
  origin: { left: number; top: number; width: number; height: number };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    color: string;
  };
}

export function captureMessageSend(
  messageId: number,
  text: string,
  input: HTMLTextAreaElement | null,
): MessageSendTransfer | null {
  if (!input?.isConnected || input.value.trim() !== text ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const rect = input.getBoundingClientRect();
  const style = getComputedStyle(input);
  const left = parseFloat(style.paddingLeft) || 0;
  const right = parseFloat(style.paddingRight) || 0;
  const top = parseFloat(style.paddingTop) || 0;
  const bottom = parseFloat(style.paddingBottom) || 0;
  if (!rect.width || !rect.height) return null;

  return {
    messageId,
    text: input.value,
    composerTop: input.closest('form')?.getBoundingClientRect().top ?? rect.top,
    scrollTop: input.scrollTop,
    origin: {
      left: rect.left + left,
      top: rect.top + top,
      width: Math.max(1, input.clientWidth - left - right),
      height: Math.max(1, input.clientHeight - top - bottom),
    },
    typography: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: style.color,
    },
  };
}

export function MessageSendMotion({
  transfer,
  scrollRef,
  onComplete,
}: {
  transfer: MessageSendTransfer | null;
  scrollRef: RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}) {
  useLayoutEffect(() => {
    if (!transfer) return;
    const scroll = scrollRef.current;
    const bubble = scroll?.querySelector<HTMLElement>(
      `[data-aurora-user-message="${transfer.messageId}"]`,
    );
    if (!scroll || !bubble || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Position the real bubble first; streaming cannot move it during the flight.
    const originalScrollBehavior = scroll.style.scrollBehavior;
    scroll.style.scrollBehavior = 'auto';
    const viewport = scroll.getBoundingClientRect();
    const visibleBottom = Math.min(viewport.bottom, transfer.composerTop - 16);
    const beforeScroll = bubble.getBoundingClientRect();
    if (beforeScroll.bottom > visibleBottom) {
      scroll.scrollTop += beforeScroll.bottom - visibleBottom;
    }
    const destination = bubble.getBoundingClientRect();
    if (destination.top < viewport.top + 72) {
      scroll.scrollTop += destination.top - viewport.top - 72;
    }
    const target = bubble.getBoundingClientRect();
    const targetStyle = getComputedStyle(bubble);

    const ghost = document.createElement('div');
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, {
      position: 'fixed', zIndex: '10000', pointerEvents: 'none',
      left: `${transfer.origin.left}px`, top: `${transfer.origin.top}px`,
      width: `${transfer.origin.width}px`, height: `${transfer.origin.height}px`,
      borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box',
      transformOrigin: 'top left',
    });

    const material = document.createElement('div');
    Object.assign(material.style, {
      position: 'absolute', inset: '0', borderRadius: 'inherit',
      background: targetStyle.background, opacity: '0',
    });
    const words = document.createElement('div');
    words.textContent = transfer.text;
    Object.assign(words.style, transfer.typography, {
      position: 'absolute', inset: '0', boxSizing: 'border-box',
      whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', overflow: 'hidden',
    });
    const landing = bubble.cloneNode(true) as HTMLElement;
    landing.removeAttribute('data-aurora-user-message');
    Object.assign(landing.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      maxWidth: 'none', margin: '0', boxSizing: 'border-box',
      transition: 'none', animation: 'none', opacity: '0', visibility: 'visible',
    });
    ghost.append(material, words, landing);
    document.body.append(ghost);

    const timing: KeyframeAnimationOptions = {
      duration: 620, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards',
    };
    const animations = [
      ghost.animate([
        { left: `${transfer.origin.left}px`, top: `${transfer.origin.top}px`,
          width: `${transfer.origin.width}px`, height: `${transfer.origin.height}px`, borderRadius: '8px' },
        { left: `${target.left}px`, top: `${target.top}px`,
          width: `${target.width}px`, height: `${target.height}px`, borderRadius: targetStyle.borderRadius },
      ], timing),
      material.animate([{ opacity: 0 }, { opacity: 1 }], timing),
      words.animate([
        { padding: '0px', color: transfer.typography.color, fontSize: transfer.typography.fontSize,
          lineHeight: transfer.typography.lineHeight, transform: `translateY(-${transfer.scrollTop}px)` },
        { padding: targetStyle.padding, color: targetStyle.color, fontSize: targetStyle.fontSize,
          lineHeight: targetStyle.lineHeight, transform: 'translateY(0px)' },
      ], timing),
      words.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.7 }, { opacity: 0, offset: 1 }],
        { duration: 620, fill: 'forwards' }),
      landing.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1, offset: 1 }],
        { duration: 620, fill: 'forwards' }),
    ];

    let disposed = false;
    const finish = () => {
      if (disposed) return;
      disposed = true;
      // React reveals the real bubble and removes this overlay in the same commit.
      onComplete();
    };
    void animations[0].finished.then(finish, finish);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => { if (reducedMotion.matches) finish(); };
    window.addEventListener('resize', finish, { once: true });
    window.visualViewport?.addEventListener('resize', finish, { once: true });
    scroll.addEventListener('wheel', finish, { once: true, passive: true });
    scroll.addEventListener('touchstart', finish, { once: true, passive: true });
    reducedMotion.addEventListener('change', handleMotionChange);
    return () => {
      disposed = true;
      scroll.style.scrollBehavior = originalScrollBehavior;
      ghost.remove();
      animations.forEach(animation => animation.cancel());
      window.removeEventListener('resize', finish);
      window.visualViewport?.removeEventListener('resize', finish);
      scroll.removeEventListener('wheel', finish);
      scroll.removeEventListener('touchstart', finish);
      reducedMotion.removeEventListener('change', handleMotionChange);
    };
  }, [transfer, scrollRef, onComplete]);

  return null;
}
