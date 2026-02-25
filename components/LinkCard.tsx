'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GoogleDocsIcon, GoogleSheetsIcon, GoogleSlidesIcon, GoogleDriveIcon, GoogleClassroomIcon, GoogleFormsIcon } from './BrandIcons';

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

  // Create favicon URL using a more robust service
  const faviconUrl = useMemo(() => {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      // unavatar.io is great at finding high-quality icons, using google as fallback provider
      return `https://unavatar.io/${hostname}?fallback=https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return null;
    }
  }, [url]);

  // Hardcoded special resources mapping
  const specialResource = useMemo(() => {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('docs.google.com/document')) {
      return {
        label: 'Google Docs',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-blue-500/10 group-hover:dark:bg-blue-400/10 group-hover:ring-1 group-hover:ring-blue-500/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-blue-700 group-hover:dark:text-blue-300',
        Icon: GoogleDocsIcon
      };
    }
    if (urlLower.includes('docs.google.com/spreadsheets')) {
      return {
        label: 'Google Sheets',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-emerald-500/10 group-hover:dark:bg-emerald-400/10 group-hover:ring-1 group-hover:ring-emerald-500/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-700 group-hover:dark:text-emerald-300',
        Icon: GoogleSheetsIcon
      };
    }
    if (urlLower.includes('docs.google.com/presentation')) {
      return {
        label: 'Google Slides',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-amber-500/10 group-hover:dark:bg-amber-400/10 group-hover:ring-1 group-hover:ring-amber-500/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-amber-700 group-hover:dark:text-amber-300',
        Icon: GoogleSlidesIcon
      };
    }
    if (urlLower.includes('drive.google.com')) {
      return {
        label: 'Google Drive',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-blue-500/5 group-hover:dark:bg-blue-400/10 group-hover:ring-1 group-hover:ring-blue-400/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 group-hover:dark:text-blue-400',
        Icon: GoogleDriveIcon
      };
    }
    if (urlLower.includes('classroom.google.com')) {
      return {
        label: 'Google Classroom',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-green-600/10 group-hover:dark:bg-green-500/10 group-hover:ring-1 group-hover:ring-green-600/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-green-700 group-hover:dark:text-green-300',
        Icon: GoogleClassroomIcon
      };
    }
    if (urlLower.includes('docs.google.com/forms')) {
      return {
        label: 'Google Forms',
        color: 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-purple-500/10 group-hover:dark:bg-purple-400/10 group-hover:ring-1 group-hover:ring-purple-500/20',
        textColor: 'text-gray-500 dark:text-gray-400 group-hover:text-purple-700 group-hover:dark:text-purple-300',
        Icon: GoogleFormsIcon
      };
    }

    return null;
  }, [url]);

  // Get initials from title or domain
  const initials = useMemo(() => {
    if (specialResource) return specialResource.label.split(' ').map(w => w === 'Google' ? '' : w[0]).join('');
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
  }, [title, domain, specialResource]);

  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all",
        specialResource ? specialResource.color : "bg-gray-100 dark:bg-zinc-800 group-hover:bg-[#264f84]/5 group-hover:dark:bg-blue-500/10 group-hover:hover:bg-[#264f84]/10 group-hover:dark:hover:bg-blue-500/20",
        specialResource ? specialResource.textColor : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 group-hover:dark:text-gray-300",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="shrink-0 h-3.5 w-3.5 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
        {specialResource?.Icon ? (
          <specialResource.Icon className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="w-full h-full object-contain rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
              target.nextElementSibling?.classList.add('flex');
            }}
          />
        ) : null}
        <div className="hidden items-center justify-center h-full w-full opacity-50 font-bold text-[8px] rounded-full">
          {initials}
        </div>
      </div>
      <span className="text-[10px] font-medium truncate max-w-[120px]">
        {title || (specialResource ? specialResource.label : domain)}
      </span>
    </a>
  );
}
