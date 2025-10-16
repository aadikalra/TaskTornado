'use client';

import { useMemo } from 'react';
import Image from 'next/image';

export function FaviconLink({ url, className = '' }: { url: string; className?: string }) {
  // Function to extract domain from URL
  const domain = useMemo(() => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
      return domain.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }, [url]);

  // Create favicon URL
  const faviconUrl = useMemo(() => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
      return `https://www.google.com/s2/favicons?domain=${domain.hostname}&sz=32`;
    } catch {
      return null;
    }
  }, [url]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {faviconUrl ? (
        <div className="relative h-3 w-3">
          <Image 
            src={faviconUrl}
            alt=""
            fill
            className="rounded-sm object-contain"
            onError={(e) => {
              // Fallback to external link icon
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0NjZBRUEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1leHRlcm5hbC1saW5rIj48cGF0aCBkPSJNMTggMTN2NmEyIDIgMCAwIDEtMiAySDUgYTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDYiLz48cG9seWxpbmUgcG9pbnRzPSIxNSA5IDE4IDkgMTggNiIvPjxwYXRoIGQ9Ik0yMSAzbC02IDYiLz48L3N2Zz4=';
            }}
            unoptimized={true} // Favicon URLs might not be optimized by Next.js
          />
        </div>
      ) : (
        <span className="h-3 w-3 rounded bg-gray-200 flex items-center justify-center">
          <span className="text-[8px] text-gray-400">🌐</span>
        </span>
      )}
      <span className="truncate">{domain}</span>
    </span>
  );
}
