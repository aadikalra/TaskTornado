export type GoogleClassroomAttachmentType =
  | 'google-doc'
  | 'google-form'
  | 'google-slide'
  | 'google-sheet'
  | 'google-drive'
  | 'link'
  | 'file';

export interface GoogleClassroomAttachment {
  name: string;
  type: GoogleClassroomAttachmentType;
  url?: string;
}

export interface ParsedGoogleClassroomAssignment {
  title?: string;
  course?: string;
  section?: string;
  teacher?: string;
  dueDate?: Date;
  dueLabel?: string;
  points?: number;
  description?: string;
  status?: string;
  sourceUrl?: string;
  attachments: GoogleClassroomAttachment[];
  recognized: boolean;
}

interface ClipboardAnchor {
  href: string;
  text: string;
  textLines: string[];
}

const MAX_CLIPBOARD_LENGTH = 1_000_000;
const ASSIGNMENT_BOUNDARIES = /^(?:your work|class comments|private comments)$/i;
const ASSIGNMENT_MARKER = /^assignment details$/i;
const STATUS_LABELS = /^(?:assigned|missing|turned in|submitted|returned|graded|draft|late)$/i;
const POINTS_LINE = /^(\d+(?:,\d{3})*(?:\.\d+)?)\s+points?$/i;
const DUE_LINE = /^due(?:\s+(?:date|by))?\s*:?\s+(.+)$/i;
const POSTED_DATE_LINE = /^(?:(?:posted|edited)\s+)?(?:today|yesterday|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)$/i;
const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/gi;

const NAVIGATION_LABELS = new Set([
  'assignment',
  'assignment details',
  'calendar',
  'class comments',
  'classes',
  'classroom',
  'classwork',
  'grades',
  'help',
  'home',
  'menu',
  'people',
  'private comments',
  'settings',
  'skip to main content',
  'stream',
  'to-do',
  'your work',
]);

const DESCRIPTION_NOISE = /^(?:add (?:a )?comment|add or create|all topics|attach|edit|mark as done|open in new window|post|save|turn in|unsubmit|view assignment|view details|your work)$/i;

const ATTACHMENT_TYPE_LABELS: Array<{
  pattern: RegExp;
  type: GoogleClassroomAttachmentType;
  label: string;
}> = [
  { pattern: /^google docs?$/i, type: 'google-doc', label: 'Google Docs' },
  { pattern: /^google forms?$/i, type: 'google-form', label: 'Google Forms' },
  { pattern: /^google slides?$/i, type: 'google-slide', label: 'Google Slides' },
  { pattern: /^google sheets?$/i, type: 'google-sheet', label: 'Google Sheets' },
  { pattern: /^google drive$/i, type: 'google-drive', label: 'Google Drive' },
  { pattern: /^(?:pdf|pdf file)$/i, type: 'file', label: 'PDF' },
  { pattern: /^(?:file|attachment)$/i, type: 'file', label: 'Attachment' },
];

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const WEEKDAYS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const decodeHtmlEntities = (value: string) => value.replace(
  /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi,
  (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized === 'amp') return '&';
    if (normalized === 'apos') return "'";
    if (normalized === 'gt') return '>';
    if (normalized === 'lt') return '<';
    if (normalized === 'nbsp') return ' ';
    if (normalized === 'quot') return '"';

    const radix = normalized.startsWith('#x') ? 16 : 10;
    const numericValue = Number.parseInt(normalized.replace(/^#x?/, ''), radix);
    return Number.isFinite(numericValue) ? String.fromCodePoint(numericValue) : entity;
  },
);

const htmlFragmentToText = (html: string) => decodeHtmlEntities(
  html
    .replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi, '')
    .replace(/<(?:br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(?:div|p|li|h[1-6]|tr|td)>/gi, '\n')
    .replace(/<[^>]+>/g, ''),
)
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\s*\n\s*/g, '\n')
  .trim();

const toLines = (text: string) => text
  .slice(0, MAX_CLIPBOARD_LENGTH)
  // Some clipboard bridges serialize rich page content as Markdown. Keep the
  // visible link label and put adjacent links on separate lines so Classroom's
  // logo and course breadcrumb cannot collapse into one value.
  .replace(/\[([^\]]+)]\(https?:\/\/[^)\s]+\)/gi, '\n$1\n')
  .replace(/\r\n?/g, '\n')
  .split(/\n|\t/)
  .map(line => line
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(?:\*\*|__)(.+)(?:\*\*|__)$/, '$1')
    .replace(/^\*(.+)\*$/, '$1')
    .trim())
  .filter(Boolean);

const normalizeForComparison = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const getAttribute = (attributes: string, attributeName: string) => {
  const match = attributes.match(new RegExp(`\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtmlEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
};

const normalizeClipboardUrl = (rawUrl: string) => {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl, 'https://classroom.google.com');
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;

    if ((url.hostname === 'www.google.com' || url.hostname === 'google.com') && url.pathname === '/url') {
      const redirectedUrl = url.searchParams.get('q') || url.searchParams.get('url');
      if (redirectedUrl) return normalizeClipboardUrl(redirectedUrl);
    }

    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
};

const extractAnchors = (html: string): ClipboardAnchor[] => {
  if (!html) return [];

  const anchors: ClipboardAnchor[] = [];
  const safeHtml = html.slice(0, MAX_CLIPBOARD_LENGTH);
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of safeHtml.matchAll(anchorPattern)) {
    const href = normalizeClipboardUrl(getAttribute(match[1], 'href'));
    if (!href) continue;

    const text = htmlFragmentToText(match[2]);
    anchors.push({
      href,
      text: text.replace(/\n+/g, ' ').trim(),
      textLines: toLines(text),
    });
  }

  return anchors;
};

const extractMarkdownAnchors = (text: string): ClipboardAnchor[] => {
  const anchors: ClipboardAnchor[] = [];
  const markdownLinkPattern = /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/gi;

  for (const match of text.slice(0, MAX_CLIPBOARD_LENGTH).matchAll(markdownLinkPattern)) {
    const href = normalizeClipboardUrl(match[2]);
    if (!href) continue;

    const textLines = toLines(match[1]);
    anchors.push({
      href,
      text: textLines.join(' '),
      textLines,
    });
  }

  return anchors;
};

const getAttachmentTypeFromLabel = (label: string) => ATTACHMENT_TYPE_LABELS.find(({ pattern }) => pattern.test(label));

const classifyUrl = (
  rawUrl: string,
): GoogleClassroomAttachmentType | 'classroom-assignment' | 'classroom-course' | undefined => {
  const normalizedUrl = normalizeClipboardUrl(rawUrl);
  if (!normalizedUrl) return undefined;

  const url = new URL(normalizedUrl);
  const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
  const pathname = url.pathname.toLowerCase();

  if (hostname === 'docs.google.com' && pathname.startsWith('/document/')) return 'google-doc';
  if ((hostname === 'docs.google.com' && pathname.startsWith('/forms/')) || hostname === 'forms.gle') return 'google-form';
  if (hostname === 'docs.google.com' && pathname.startsWith('/presentation/')) return 'google-slide';
  if (hostname === 'docs.google.com' && pathname.startsWith('/spreadsheets/')) return 'google-sheet';
  if (hostname === 'drive.google.com' && /^\/(?:file|open|drive\/folders)\b/.test(pathname)) return 'google-drive';
  if (hostname === 'classroom.google.com' && /\/(?:u\/\d+\/)?c\/[^/]+\/a\/[^/]+/.test(pathname)) return 'classroom-assignment';
  if (hostname === 'classroom.google.com' && /\/(?:u\/\d+\/)?c\/[^/]+/.test(pathname)) return 'classroom-course';
  return 'link';
};

const defaultAttachmentName = (type: GoogleClassroomAttachmentType) => {
  switch (type) {
    case 'google-doc': return 'Google Docs';
    case 'google-form': return 'Google Forms';
    case 'google-slide': return 'Google Slides';
    case 'google-sheet': return 'Google Sheets';
    case 'google-drive': return 'Google Drive';
    case 'file': return 'Attachment';
    default: return 'Assignment link';
  }
};

const cleanAttachmentName = (anchor: ClipboardAnchor, type: GoogleClassroomAttachmentType) => {
  const meaningfulLines = anchor.textLines.filter(line => (
    !getAttachmentTypeFromLabel(line)
    && !/^(?:open|preview|view)$/i.test(line)
  ));
  const rawName = meaningfulLines[0] || anchor.text;
  const cleanedName = rawName
    .replace(/\s+(?:Google Docs?|Google Forms?|Google Slides?|Google Sheets?|Google Drive)$/i, '')
    .trim();
  return cleanedName || defaultAttachmentName(type);
};

const createLocalDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return undefined;
  return date;
};

/** Resolves the relative and short dates Google Classroom uses in assignment cards. */
export const parseGoogleClassroomDueDate = (rawLabel: string, referenceDate = new Date()) => {
  const label = rawLabel
    .replace(DUE_LINE, '$1')
    .replace(/,?\s+(?:at\s+)?\d{1,2}:\d{2}\s*(?:am|pm)?$/i, '')
    .trim();
  const normalizedLabel = label.toLowerCase();
  const reference = createLocalDate(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  if (!reference) return undefined;

  if (normalizedLabel === 'today') return reference;
  if (normalizedLabel === 'tomorrow') {
    const tomorrow = new Date(reference);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const weekday = WEEKDAYS[normalizedLabel];
  if (weekday !== undefined) {
    const daysAhead = (weekday - reference.getDay() + 7) % 7 || 7;
    const dueDate = new Date(reference);
    dueDate.setDate(dueDate.getDate() + daysAhead);
    return dueDate;
  }

  const monthDateMatch = label.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?$/i);
  if (monthDateMatch) {
    const month = MONTHS[monthDateMatch[1].toLowerCase()];
    const day = Number(monthDateMatch[2]);
    if (month === undefined) return undefined;

    if (monthDateMatch[3]) return createLocalDate(Number(monthDateMatch[3]), month, day);

    const candidates = [reference.getFullYear() - 1, reference.getFullYear(), reference.getFullYear() + 1]
      .map(year => createLocalDate(year, month, day))
      .filter((date): date is Date => Boolean(date));
    return candidates.sort((a, b) => Math.abs(a.getTime() - reference.getTime()) - Math.abs(b.getTime() - reference.getTime()))[0];
  }

  const numericDateMatch = label.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/);
  if (numericDateMatch) {
    let year = numericDateMatch[3] ? Number(numericDateMatch[3]) : reference.getFullYear();
    if (year < 100) year += 2000;
    if (numericDateMatch[3]) return createLocalDate(year, Number(numericDateMatch[1]) - 1, Number(numericDateMatch[2]));

    const month = Number(numericDateMatch[1]) - 1;
    const day = Number(numericDateMatch[2]);
    const candidates = [year - 1, year, year + 1]
      .map(candidateYear => createLocalDate(candidateYear, month, day))
      .filter((date): date is Date => Boolean(date));
    return candidates.sort((a, b) => Math.abs(a.getTime() - reference.getTime()) - Math.abs(b.getTime() - reference.getTime()))[0];
  }

  return undefined;
};

const isMetadataOrNoise = (line: string) => (
  NAVIGATION_LABELS.has(normalizeForComparison(line))
  || POINTS_LINE.test(line)
  || DUE_LINE.test(line)
  || POSTED_DATE_LINE.test(line)
  || STATUS_LABELS.test(line)
  || DESCRIPTION_NOISE.test(line)
  || /^https?:\/\//i.test(line)
);

const isPlausibleName = (line: string) => (
  line.length >= 2
  && line.length <= 160
  && !isMetadataOrNoise(line)
);

const extractExplicitValue = (lines: string[], label: 'class' | 'course' | 'section' | 'teacher') => {
  const pattern = new RegExp(`^${label}\\s*:\\s*(.+)$`, 'i');
  return lines.map(line => line.match(pattern)?.[1]?.trim()).find(Boolean);
};

const extractCourseId = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== 'classroom.google.com') return undefined;
    return url.pathname.match(/\/(?:u\/\d+\/)?c\/([^/]+)/)?.[1];
  } catch {
    return undefined;
  }
};

const findCourseDetails = (
  lines: string[],
  anchors: ClipboardAnchor[],
  sourceUrl: string | undefined,
  markerIndex: number,
) => {
  const explicitCourse = extractExplicitValue(lines, 'course') || extractExplicitValue(lines, 'class');
  const explicitSection = extractExplicitValue(lines, 'section');
  if (explicitCourse || explicitSection) return { course: explicitCourse, section: explicitSection };

  const sourceCourseId = sourceUrl ? extractCourseId(sourceUrl) : undefined;
  if (sourceCourseId) {
    const matchingCourseAnchor = anchors.find(anchor => {
      try {
        const url = new URL(anchor.href);
        const anchorCourseId = extractCourseId(anchor.href);
        return anchorCourseId === sourceCourseId && !/\/a\//.test(url.pathname);
      } catch {
        return false;
      }
    });
    if (matchingCourseAnchor?.textLines.length) {
      return {
        course: matchingCourseAnchor.textLines[0],
        section: matchingCourseAnchor.textLines[1],
      };
    }
  }

  const courseAnchors = anchors.filter(anchor => classifyUrl(anchor.href) === 'classroom-course');
  const uniqueCourseIds = [...new Set(courseAnchors.map(anchor => extractCourseId(anchor.href)).filter(Boolean))];
  if (uniqueCourseIds.length === 1) {
    const courseAnchor = courseAnchors.find(anchor => extractCourseId(anchor.href) === uniqueCourseIds[0]);
    const courseLines = courseAnchor?.textLines.filter(isPlausibleName) ?? [];
    if (courseLines.length > 0) {
      return {
        course: courseLines[0],
        section: courseLines[1],
      };
    }
  }

  const streamIndex = lines.findIndex((line, index) => index < markerIndex && /^stream$/i.test(line));
  if (streamIndex > 0) {
    const candidates = lines
      .slice(Math.max(0, streamIndex - 4), streamIndex)
      .filter(isPlausibleName)
      .slice(-2);
    if (candidates.length === 2) return { course: candidates[0], section: candidates[1] };
    if (candidates.length === 1) return { course: candidates[0], section: undefined };
  }

  return { course: undefined, section: undefined };
};

const selectSourceUrl = (anchors: ClipboardAnchor[], title: string | undefined) => {
  const assignmentAnchors = anchors.filter(anchor => classifyUrl(anchor.href) === 'classroom-assignment');
  if (title) {
    const normalizedTitle = normalizeForComparison(title);
    const titleMatch = assignmentAnchors.find(anchor => normalizeForComparison(anchor.text) === normalizedTitle);
    if (titleMatch) return titleMatch.href;
  }

  const uniqueUrls = [...new Set(assignmentAnchors.map(anchor => anchor.href))];
  return uniqueUrls.length === 1 ? uniqueUrls[0] : undefined;
};

const extractPlainTextUrls = (lines: string[]) => lines.flatMap(line => (
  [...line.matchAll(URL_IN_TEXT)]
    .map(match => normalizeClipboardUrl(match[0].replace(/[),.;]+$/, '')))
    .filter((url): url is string => Boolean(url))
));

const extractAttachments = (
  lines: string[],
  relevantStart: number,
  relevantEnd: number,
  anchors: ClipboardAnchor[],
  sourceUrl: string | undefined,
) => {
  const attachments: GoogleClassroomAttachment[] = [];
  const excludedLineIndices = new Set<number>();
  const relevantLineKeys = new Set(lines.slice(relevantStart, relevantEnd).map(normalizeForComparison));

  const addAttachment = (attachment: GoogleClassroomAttachment) => {
    if (attachment.url) {
      const duplicate = attachments.some(existing => existing.url === attachment.url);
      if (duplicate || attachment.url === sourceUrl) return;
    } else if (attachments.some(existing => (
      normalizeForComparison(existing.name) === normalizeForComparison(attachment.name)
      && existing.type === attachment.type
    ))) {
      return;
    }
    attachments.push(attachment);
  };

  for (const anchor of anchors) {
    const type = classifyUrl(anchor.href);
    if (!type || type === 'classroom-assignment' || type === 'classroom-course') continue;

    const knownGoogleAttachment = type !== 'link';
    const anchorLabelAppearsInAssignment = anchor.textLines.some(line => relevantLineKeys.has(normalizeForComparison(line)));
    if (!knownGoogleAttachment && !anchorLabelAppearsInAssignment) continue;

    addAttachment({
      name: cleanAttachmentName(anchor, type),
      type,
      url: anchor.href,
    });
  }

  for (let index = relevantStart; index < relevantEnd; index += 1) {
    const typeLabel = getAttachmentTypeFromLabel(lines[index]);
    if (!typeLabel) continue;

    const previousIndex = index - 1;
    const name = previousIndex >= relevantStart && isPlausibleName(lines[previousIndex])
      ? lines[previousIndex]
      : typeLabel.label;
    const matchingAttachment = attachments.find(attachment => (
      attachment.type === typeLabel.type
      && (
        normalizeForComparison(attachment.name) === normalizeForComparison(name)
        || attachment.name === defaultAttachmentName(typeLabel.type)
      )
    ));

    if (matchingAttachment && matchingAttachment.name === defaultAttachmentName(typeLabel.type)) {
      matchingAttachment.name = name;
    } else if (!matchingAttachment) {
      addAttachment({ name, type: typeLabel.type });
    }

    excludedLineIndices.add(index);
    if (name === lines[previousIndex]) excludedLineIndices.add(previousIndex);
  }

  for (let index = relevantStart; index < relevantEnd; index += 1) {
    const urls = extractPlainTextUrls([lines[index]]);
    for (const url of urls) {
      const type = classifyUrl(url);
      if (!type || type === 'classroom-assignment' || type === 'classroom-course') continue;
      const previousLine = lines[index - 1];
      addAttachment({
        name: previousLine && isPlausibleName(previousLine) ? previousLine : defaultAttachmentName(type),
        type,
        url,
      });
      excludedLineIndices.add(index);
    }
  }

  for (const attachment of attachments) {
    const attachmentName = normalizeForComparison(attachment.name);
    for (let index = relevantStart; index < relevantEnd; index += 1) {
      if (normalizeForComparison(lines[index]) === attachmentName) excludedLineIndices.add(index);
    }
  }

  return { attachments, excludedLineIndices };
};

/**
 * Parses one manually copied Google Classroom assignment. Clipboard HTML is
 * inspected only for inert anchor data and is never returned as renderable HTML.
 */
export const parseGoogleClassroomAssignment = (
  plainText: string,
  html = '',
  referenceDate = new Date(),
): ParsedGoogleClassroomAssignment => {
  const safeHtml = html.slice(0, MAX_CLIPBOARD_LENGTH);
  const anchors = [...extractAnchors(safeHtml), ...extractMarkdownAnchors(plainText)];
  const fallbackText = plainText.trim() ? plainText : htmlFragmentToText(safeHtml);
  const lines = toLines(fallbackText);
  const markerIndex = lines.findIndex(line => ASSIGNMENT_MARKER.test(line));
  const firstBoundaryAfter = (startIndex: number) => lines.findIndex(
    (line, index) => index > startIndex && ASSIGNMENT_BOUNDARIES.test(line),
  );
  const postMarkerBoundaryIndex = markerIndex >= 0 ? firstBoundaryAfter(markerIndex) : -1;
  const postMarkerEnd = postMarkerBoundaryIndex >= 0 ? postMarkerBoundaryIndex : lines.length;
  const hasPostMarkerMetadata = markerIndex >= 0 && lines.some((line, index) => (
    index > markerIndex
    && index < postMarkerEnd
    && (POINTS_LINE.test(line) || DUE_LINE.test(line))
  ));
  const hasPreMarkerMetadata = markerIndex > 0 && lines.some((line, index) => (
    index < markerIndex && (POINTS_LINE.test(line) || DUE_LINE.test(line))
  ));
  // Classroom currently has two clipboard orders in the wild. In one,
  // "Assignment details" precedes the assignment. In the other it is exposed
  // by accessibility markup after the entire assignment card.
  const markerIsTrailing = markerIndex >= 0 && !hasPostMarkerMetadata && hasPreMarkerMetadata;
  const metadataSearchStart = markerIndex >= 0 && !markerIsTrailing ? markerIndex + 1 : 0;
  const metadataSearchEnd = markerIsTrailing ? markerIndex : postMarkerEnd;

  const pointsIndex = lines.findIndex((line, index) => index >= metadataSearchStart && index < metadataSearchEnd && POINTS_LINE.test(line));
  const dueIndex = lines.findIndex((line, index) => index >= metadataSearchStart && index < metadataSearchEnd && DUE_LINE.test(line));
  const metadataAnchorIndex = [pointsIndex, dueIndex].filter(index => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  const trailingBoundaryIndex = markerIsTrailing && metadataAnchorIndex >= 0
    ? firstBoundaryAfter(metadataAnchorIndex)
    : -1;
  const relevantEnd = markerIsTrailing
    ? (trailingBoundaryIndex >= 0 ? trailingBoundaryIndex : markerIndex)
    : postMarkerEnd;

  let titleIndex = -1;
  if (markerIndex >= 0 && !markerIsTrailing) {
    titleIndex = lines.findIndex((line, index) => index > markerIndex && index < relevantEnd && isPlausibleName(line));
  }

  if (titleIndex < 0 && metadataAnchorIndex >= 0) {
    const postedDateIndex = lines.findLastIndex((line, index) => (
      index < metadataAnchorIndex
      && index >= Math.max(metadataSearchStart, metadataAnchorIndex - 6)
      && POSTED_DATE_LINE.test(line)
    ));

    if (postedDateIndex >= 0) {
      const precedingNames: number[] = [];
      for (let index = postedDateIndex - 1; index >= Math.max(metadataSearchStart, postedDateIndex - 5); index -= 1) {
        if (isPlausibleName(lines[index])) precedingNames.unshift(index);
      }
      // The closest name is the teacher; the one before it is the title.
      titleIndex = precedingNames.length >= 2 ? precedingNames.at(-2)! : precedingNames[0] ?? -1;
    } else {
      const candidates: number[] = [];
      for (let index = metadataAnchorIndex - 1; index >= Math.max(metadataSearchStart, metadataAnchorIndex - 5); index -= 1) {
        if (isPlausibleName(lines[index])) candidates.unshift(index);
      }
      titleIndex = candidates[0] ?? -1;
    }
  }

  const title = titleIndex >= 0 ? lines[titleIndex] : undefined;
  const relevantStart = markerIndex >= 0 && !markerIsTrailing
    ? markerIndex + 1
    : Math.max(0, titleIndex >= 0 ? titleIndex : metadataAnchorIndex - 3);
  const sourceUrlFromPlainText = extractPlainTextUrls(lines.slice(relevantStart, relevantEnd))
    .find(url => classifyUrl(url) === 'classroom-assignment');
  const sourceUrl = selectSourceUrl(anchors, title) || sourceUrlFromPlainText;
  const { course, section } = findCourseDetails(
    lines,
    anchors,
    sourceUrl,
    markerIndex >= 0 ? markerIndex : (titleIndex >= 0 ? titleIndex : lines.length),
  );

  let teacher = extractExplicitValue(lines, 'teacher');
  if (!teacher && titleIndex >= 0) {
    const postedDateIndex = lines.findIndex((line, index) => index > titleIndex && index < relevantEnd && POSTED_DATE_LINE.test(line));
    const teacherBoundary = [postedDateIndex, pointsIndex, dueIndex]
      .filter(index => index > titleIndex)
      .sort((a, b) => a - b)[0];
    const teacherCandidate = lines
      .slice(titleIndex + 1, Math.min(relevantEnd, titleIndex + 5, teacherBoundary ?? titleIndex + 1))
      .find(line => isPlausibleName(line) && line !== course && line !== section);
    teacher = teacherCandidate;
  }

  const pointsMatch = pointsIndex >= 0 ? lines[pointsIndex].match(POINTS_LINE) : undefined;
  const points = pointsMatch ? Number(pointsMatch[1].replaceAll(',', '')) : undefined;
  const dueMatch = dueIndex >= 0 ? lines[dueIndex].match(DUE_LINE) : undefined;
  const dueLabel = dueMatch?.[1]?.trim();
  const dueDate = dueLabel ? parseGoogleClassroomDueDate(dueLabel, referenceDate) : undefined;
  const status = lines.find(line => STATUS_LABELS.test(line));

  const { attachments, excludedLineIndices } = extractAttachments(lines, relevantStart, relevantEnd, anchors, sourceUrl);

  const descriptionStart = Math.max(titleIndex, pointsIndex, dueIndex) + 1;
  const descriptionLines = lines.slice(Math.max(descriptionStart, relevantStart), relevantEnd).filter((line, offset) => {
    const absoluteIndex = Math.max(descriptionStart, relevantStart) + offset;
    if (excludedLineIndices.has(absoluteIndex)) return false;
    if (line === title || line === teacher || line === course || line === section) return false;
    return !isMetadataOrNoise(line) && !getAttachmentTypeFromLabel(line);
  });
  const description = descriptionLines.length > 0 ? descriptionLines.join('\n') : undefined;

  const recognized = markerIndex >= 0 || Boolean(title && (dueLabel || points !== undefined || teacher));

  return {
    title,
    course,
    section,
    teacher,
    dueDate,
    dueLabel,
    points,
    description,
    status,
    sourceUrl,
    attachments,
    recognized,
  };
};

/** Finds a confident match between a parsed Classroom course and an existing class. */
export const matchGoogleClassroomCourse = <T extends { name: string }>(
  assignment: Pick<ParsedGoogleClassroomAssignment, 'course' | 'section'>,
  classes: T[],
) => {
  const candidates = [
    assignment.course && assignment.section ? `${assignment.course} ${assignment.section}` : undefined,
    assignment.course,
    assignment.section,
  ]
    .filter((candidate): candidate is string => Boolean(candidate))
    .map(normalizeForComparison);

  for (const candidate of candidates) {
    const exactMatch = classes.find(classItem => normalizeForComparison(classItem.name) === candidate);
    if (exactMatch) return exactMatch;
  }

  if (assignment.course) {
    const normalizedCourse = normalizeForComparison(assignment.course);
    if (normalizedCourse.length >= 4) {
      const containingMatches = classes.filter(classItem => {
        const normalizedClass = normalizeForComparison(classItem.name);
        return normalizedClass.includes(normalizedCourse) || normalizedCourse.includes(normalizedClass);
      });
      if (containingMatches.length === 1) return containingMatches[0];
    }
  }

  return undefined;
};
