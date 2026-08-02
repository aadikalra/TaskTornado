'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  GoogleDocsIcon,
  GoogleSheetsIcon,
  GoogleSlidesIcon,
  GoogleDriveIcon,
  GoogleClassroomIcon,
  GoogleFormsIcon,
  GmailIcon,
  GoogleTasksIcon,
  GoogleMeetIcon,
  GoogleCalendarIcon,
  YouTubeIcon,
} from './BrandIcons';

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
      return { label: 'Google Docs', Icon: GoogleDocsIcon };
    }
    if (urlLower.includes('docs.google.com/spreadsheets')) {
      return { label: 'Google Sheets', Icon: GoogleSheetsIcon };
    }
    if (urlLower.includes('docs.google.com/presentation')) {
      return { label: 'Google Slides', Icon: GoogleSlidesIcon };
    }
    if (urlLower.includes('docs.google.com/forms')) {
      return { label: 'Google Forms', Icon: GoogleFormsIcon };
    }
    if (urlLower.includes('drive.google.com')) {
      return { label: 'Google Drive', Icon: GoogleDriveIcon };
    }
    if (urlLower.includes('classroom.google.com')) {
      return { label: 'Google Classroom', Icon: GoogleClassroomIcon };
    }
    if (urlLower.includes('mail.google.com') || urlLower.includes('gmail.com')) {
      return { label: 'Gmail', Icon: GmailIcon };
    }
    if (urlLower.includes('tasks.google.com')) {
      return { label: 'Google Tasks', Icon: GoogleTasksIcon };
    }
    if (urlLower.includes('meet.google.com')) {
      return { label: 'Google Meet', Icon: GoogleMeetIcon };
    }
    if (urlLower.includes('calendar.google.com')) {
      return { label: 'Google Calendar', Icon: GoogleCalendarIcon };
    }
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return { label: 'YouTube', Icon: YouTubeIcon };
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
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer bg-sky-500/8 dark:bg-sky-400/10 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-500/20 hover:bg-sky-500/15 dark:hover:bg-sky-400/20 hover:border-sky-300 dark:hover:border-sky-400/40",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="shrink-0 h-3 w-3 flex items-center justify-center overflow-hidden">
        {specialResource?.Icon ? (
          <specialResource.Icon className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
        ) : faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="w-full h-full object-contain rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
              target.nextElementSibling?.classList.add('flex');
            }}
          />
        ) : null}
        <div className="hidden items-center justify-center h-full w-full opacity-60 font-bold text-[8px] rounded-full">
          {initials}
        </div>
      </div>
      <span className="text-[10px] font-medium truncate max-w-[100px]">
        {title || (specialResource ? specialResource.label : domain)}
      </span>
    </a>
  );
}
