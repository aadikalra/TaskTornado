'use client';

import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface LinkCardProps {
  url: string;
  title?: string;
  className?: string;
}

export function LinkCard({ url, title, className = '' }: LinkCardProps) {
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
      return `https://www.google.com/s2/favicons?domain=${domain.hostname}&sz=64`;
    } catch {
      return null;
    }
  }, [url]);

  // Get a color based on the domain for the fallback
  const bgColor = useMemo(() => {
    const colors = [
      'bg-blue-50 dark:bg-blue-900/30', 'bg-green-50 dark:bg-green-900/30', 'bg-yellow-50 dark:bg-yellow-900/30', 'bg-purple-50 dark:bg-purple-900/30', 
      'bg-pink-50 dark:bg-pink-900/30', 'bg-indigo-50 dark:bg-indigo-900/30', 'bg-cyan-50 dark:bg-cyan-900/30', 'bg-amber-50 dark:bg-amber-900/30'
    ];
    const hash = Array.from(domain).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [domain]);

  // Get initials from title or domain
  const initials = useMemo(() => {
    if (title) {
      return title
        .split(' ')
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase() || '')
        .join('');
    }
    return domain
      .split('.')
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase() || '')
      .join('');
  }, [title, domain]);

  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors text-sm ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`flex-shrink-0 h-5 w-5 rounded ${bgColor} dark:bg-opacity-20 flex items-center justify-center overflow-hidden`}>
        {faviconUrl ? (
          <div className="relative h-full w-full">
            <Image 
              src={faviconUrl}
              alt=""
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
              unoptimized={true} // Favicon URLs might not be optimized by Next.js
            />
          </div>
        ) : null}
        <div className="hidden items-center justify-center h-full w-full text-gray-600 dark:text-gray-300 font-medium text-[10px]">
          {initials}
        </div>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[160px] sm:max-w-[200px]">
        {title || domain}
      </span>
      <ExternalLink className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-0.5" />
    </a>
  );
}
