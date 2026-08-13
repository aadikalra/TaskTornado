'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/context/SearchContext';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useAuth } from '@/context/AuthContext';
import { useWebSaves } from '@/context/WebSavesContext';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { flashcardService } from '@/lib/supabase/flashcards';
import { HugeIcon } from '@/lib/huge-icon-map';
import {
  rankSearchItems,
  SITE_SEARCH_ROUTES,
  siteRouteToSearchItem,
  type RankedSearchItem,
  type SearchMatchReason,
  type SearchItem,
  type SearchSection,
} from '@/lib/search/site-search';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { parseCalendarDate } from '@/lib/dateUtils';

interface FlashcardDeckSearchItem {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
}

interface SavedQuizSearchItem {
  title: string;
  questions: { id: string; question: string; topic: string }[];
  createdAt: string;
}

const ROUTE_ITEMS = SITE_SEARCH_ROUTES.map(siteRouteToSearchItem);
const QUICK_ROUTE_HREFS = [
  '/dashboard',
  '/calendar',
  '/grade-calculator',
  '/flashcards',
  '/tests',
  '/settings',
];
const QUICK_ROUTE_ITEMS = QUICK_ROUTE_HREFS
  .map(href => ROUTE_ITEMS.find(item => item.href === href))
  .filter((item): item is SearchItem => Boolean(item));

const flashcardDeckCache = new Map<string, FlashcardDeckSearchItem[]>();

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

const safeExternalUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const sectionIcon: Record<SearchSection, string> = {
  Pages: 'LayoutGrid',
  Classes: 'Course',
  Assignments: 'GoogleDoc',
  'Tests & exams': 'GraduationCap',
  'Flashcard decks': 'Cards01',
  Quizzes: 'Quiz04',
  'Web saves': 'Bookmark03',
  'Study groups': 'UserGroup03',
};

const addHighlightMatches = (value: string, term: string, ranges: Array<[number, number]>) => {
  const normalizedTerm = term.toLocaleLowerCase();
  if (!normalizedTerm) return;

  const normalizedValue = value.toLocaleLowerCase();
  let start = 0;
  const maxMatches = normalizedTerm.length === 1 ? 8 : Number.POSITIVE_INFINITY;
  let matchCount = 0;

  while (matchCount < maxMatches) {
    const index = normalizedValue.indexOf(normalizedTerm, start);
    if (index < 0) break;
    ranges.push([index, index + normalizedTerm.length]);
    matchCount += 1;
    start = index + normalizedTerm.length;
  }
};

const getHighlightRanges = (value: string, rawQuery: string): Array<[number, number]> => {
  const query = rawQuery.trim();
  if (!query) return [];

  const terms = Array.from(new Set([query, ...query.split(/\s+/)]))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  const ranges: Array<[number, number]> = [];

  terms.forEach(term => addHighlightMatches(value, term, ranges));

  // Very short searches often rank an item because its individual characters
  // are useful evidence (for example, “AI” in a class or description).
  if (!ranges.length && query.replace(/\s/g, '').length <= 3) {
    const characters = Array.from(new Set(query.toLocaleLowerCase().replace(/[^a-z0-9]/g, '').split('')));
    characters.forEach(character => addHighlightMatches(value, character, ranges));
  }

  return ranges
    .sort((left, right) => left[0] - right[0] || right[1] - left[1])
    .reduce<Array<[number, number]>>((merged, range) => {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) {
        previous[1] = Math.max(previous[1], range[1]);
      } else {
        merged.push([...range]);
      }
      return merged;
    }, []);
};

function HighlightText({
  value,
  query,
  className,
}: {
  value: string;
  query: string;
  className: string;
}) {
  const ranges = getHighlightRanges(value, query);
  if (!ranges.length) return <span className={className}>{value}</span>;

  const pieces: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], index) => {
    if (start > cursor) pieces.push(value.slice(cursor, start));
    pieces.push(
      <mark
        key={`${start}-${end}-${index}`}
        className="rounded-md bg-[#f5e98d] px-0.5 text-sky-950 shadow-[0_1px_0_rgba(217,177,27,0.35)] dark:bg-[#f5e98d] dark:text-sky-950"
      >
        {value.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < value.length) pieces.push(value.slice(cursor));

  return <span className={className}>{pieces}</span>;
}

const matchReasonLabel: Record<SearchMatchReason, string> = {
  title: 'Title match',
  description: 'Description match',
  keyword: 'Keyword match',
  link: 'Page match',
  similar: 'Similar wording',
};

export function SearchResults() {
  const { query, setQuery, closeSearch } = useSearch();
  const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  const { tests } = useTestContext();
  const { saves, folders } = useWebSaves();
  const { groups } = useStudyGroups();
  const { user } = useAuth();
  const router = useRouter();
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeckSearchItem[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizSearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      setFlashcardDecks([]);
      return;
    }

    const cachedDecks = flashcardDeckCache.get(user.id);
    if (cachedDecks) {
      setFlashcardDecks(cachedDecks);
      return;
    }

    let cancelled = false;
    flashcardService.getDecks(user.id)
      .then(decks => {
        if (cancelled) return;
        flashcardDeckCache.set(user.id, decks);
        setFlashcardDecks(decks);
      })
      .catch(error => {
        console.error('Error fetching flashcard decks for search:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const quizzes: SavedQuizSearchItem[] = [];

    try {
      const saved = localStorage.getItem('savedQuizzes');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) quizzes.push(...parsed);
    } catch { }

    try {
      const current = localStorage.getItem('currentQuiz');
      const questions = current ? JSON.parse(current) : [];
      if (Array.isArray(questions) && questions.length > 0) {
        const topic = questions[0]?.topic || 'Recent Quiz';
        const alreadySaved = quizzes.some(quiz =>
          quiz.title === topic && quiz.questions.length === questions.length,
        );
        if (!alreadySaved) {
          quizzes.unshift({
            title: topic,
            questions,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch { }

    setSavedQuizzes(quizzes);
  }, []);

  const classById = useMemo(
    () => new Map(classes.map(classItem => [classItem.id, classItem])),
    [classes],
  );

  const allItems = useMemo<SearchItem[]>(() => {
    const classItems: SearchItem[] = classes.map(classItem => ({
      id: `class:${classItem.id}`,
      title: classItem.name,
      subtitle: 'Open class settings and details',
      href: `/classes/edit/${classItem.id}`,
      icon: classItem.icon || 'Course',
      section: 'Classes',
      keywords: ['class', 'course', 'subject', classItem.target_grade || ''],
      badge: 'Class',
      priority: 85,
    }));

    const homeworkItems: SearchItem[] = homeworks.map(homework => {
      const classItem = classById.get(homework.classId);
      const dueDate = formatDate(homework.dueDate);
      return {
        id: `homework:${homework.id}`,
        title: homework.title,
        subtitle: [
          classItem?.name,
          dueDate ? `Due ${dueDate}` : '',
          homework.description,
        ].filter(Boolean).join(' · '),
        href: `/homework/${homework.id}`,
        icon: homework.completed ? 'CheckmarkCircle02' : 'GoogleDoc',
        section: 'Assignments',
        keywords: [
          'assignment',
          'homework',
          homework.completed ? 'completed done finished' : 'incomplete upcoming',
          homework.priority || '',
          classItem?.name || '',
        ],
        badge: classItem?.name,
        priority: 100,
      };
    });

    const testItems: SearchItem[] = tests.map(testItem => {
      const classItem = classById.get(testItem.classId);
      const testDate = formatDate(parseCalendarDate(testItem.testDate));
      return {
        id: `test:${testItem.id}`,
        title: testItem.title,
        subtitle: [
          classItem?.name,
          testItem.testType,
          testDate,
          testItem.description,
        ].filter(Boolean).join(' · '),
        href: `/tests/${testItem.id}`,
        icon: 'GraduationCap',
        section: 'Tests & exams',
        keywords: [
          'test',
          'exam',
          'assessment',
          testItem.testType || '',
          testItem.status || '',
          classItem?.name || '',
        ],
        badge: classItem?.name,
        priority: 100,
      };
    });

    const deckItems: SearchItem[] = flashcardDecks.map(deck => ({
      id: `deck:${deck.id}`,
      title: deck.title,
      subtitle: [deck.description || 'Flashcard deck', formatDate(deck.created_at)].filter(Boolean).join(' · '),
      href: '/flashcards',
      icon: 'Cards01',
      section: 'Flashcard decks',
      keywords: ['flashcards', 'cards', 'deck', 'study', 'review'],
      badge: 'Deck',
      priority: 90,
    }));

    const quizItems: SearchItem[] = savedQuizzes.map((quiz, index) => ({
      id: `quiz:${quiz.createdAt || index}:${quiz.title}`,
      title: quiz.title,
      subtitle: `${quiz.questions.length} question${quiz.questions.length === 1 ? '' : 's'}${formatDate(quiz.createdAt) ? ` · ${formatDate(quiz.createdAt)}` : ''}`,
      href: '/quiz',
      icon: 'Quiz04',
      section: 'Quizzes',
      keywords: [
        'quiz',
        'questions',
        'practice',
        ...quiz.questions.flatMap(question => [question.question, question.topic]),
      ],
      badge: 'Quiz',
      priority: 90,
    }));

    const folderItems: SearchItem[] = folders.map(folder => ({
      id: `web-folder:${folder.id}`,
      title: folder.name,
      subtitle: 'Saved-link folder',
      href: '/web-saves',
      icon: 'Folder02',
      section: 'Web saves',
      keywords: ['folder', 'bookmarks', 'saved links'],
      badge: 'Folder',
      priority: 75,
    }));

    const saveItems: SearchItem[] = saves.map(save => {
      const externalHref = safeExternalUrl(save.url);
      const folder = folders.find(folderItem => folderItem.id === save.folder_id);
      let domain = '';
      try {
        domain = externalHref ? new URL(externalHref).hostname.replace(/^www\./, '') : '';
      } catch { }

      return {
        id: `web-save:${save.id}`,
        title: save.title?.trim() || domain || 'Saved link',
        subtitle: [domain, folder?.name].filter(Boolean).join(' · ') || save.url,
        href: externalHref || '/web-saves',
        external: Boolean(externalHref),
        icon: 'Bookmark03',
        section: 'Web saves',
        keywords: ['bookmark', 'saved link', 'website', save.url, folder?.name || ''],
        badge: folder?.name || 'Link',
        priority: 80,
      };
    });

    const groupItems: SearchItem[] = groups.map(group => ({
      id: `study-group:${group.id}`,
      title: group.name,
      subtitle: `${group.member_count || 0} member${group.member_count === 1 ? '' : 's'}`,
      href: `/groups/${group.id}`,
      icon: 'UserGroup03',
      section: 'Study groups',
      keywords: ['group', 'study group', 'classmates', 'collaboration', 'chat'],
      badge: 'Group',
      priority: 80,
    }));

    return [
      ...ROUTE_ITEMS,
      ...classItems,
      ...homeworkItems,
      ...testItems,
      ...deckItems,
      ...quizItems,
      ...folderItems,
      ...saveItems,
      ...groupItems,
    ];
  }, [
    classes,
    homeworks,
    tests,
    flashcardDecks,
    savedQuizzes,
    folders,
    saves,
    groups,
    classById,
  ]);

  const rankedResults = useMemo(
    () => query.trim() ? rankSearchItems(allItems, query, 64) : [],
    [allItems, query],
  );

  const groupedResults = useMemo(() => {
    const limited: RankedSearchItem[] = [];
    const sectionCounts = new Map<SearchSection, number>();

    for (const result of rankedResults) {
      const count = sectionCounts.get(result.section) || 0;
      if (count >= 8) continue;
      sectionCounts.set(result.section, count + 1);
      limited.push(result);
      if (limited.length >= 40) break;
    }

    const groupsBySection = new Map<SearchSection, RankedSearchItem[]>();
    for (const result of limited) {
      const existing = groupsBySection.get(result.section) || [];
      existing.push(result);
      groupsBySection.set(result.section, existing);
    }

    return Array.from(groupsBySection.entries());
  }, [rankedResults]);

  const orderedResults = useMemo(
    () => groupedResults.flatMap(([, items]) => items),
    [groupedResults],
  );
  const displayedItems: Array<SearchItem | RankedSearchItem> = query.trim() ? orderedResults : QUICK_ROUTE_ITEMS;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= displayedItems.length) {
      setActiveIndex(Math.max(0, displayedItems.length - 1));
    }
  }, [activeIndex, displayedItems.length]);

  useEffect(() => {
    const activeItem = displayedItems[activeIndex];
    if (!activeItem) return;
    document.getElementById(`search-result-${activeItem.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, displayedItems]);

  const openItem = useCallback((item: SearchItem) => {
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
    }
    closeSearch();
  }, [closeSearch, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!displayedItems.length || event.isComposing) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(current => (current + 1) % displayedItems.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(current => (current - 1 + displayedItems.length) % displayedItems.length);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveIndex(displayedItems.length - 1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        openItem(displayedItems[activeIndex] || displayedItems[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, displayedItems, openItem]);

  const renderItem = (item: SearchItem | RankedSearchItem, itemIndex: number) => {
    const isActive = activeIndex === itemIndex;
    const resultId = `search-result-${item.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const matchReason = 'matchReason' in item ? item.matchReason : undefined;
    const hasSearchEvidence = Boolean(query.trim() && matchReason);
    const highlightQuery = hasSearchEvidence ? query : '';

    return (
      <button
        id={resultId}
        key={item.id}
        type="button"
        role="option"
        aria-selected={isActive}
        onMouseMove={() => setActiveIndex(itemIndex)}
        onClick={() => openItem(item)}
        className={`group w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
          isActive
            ? 'bg-sky-50 dark:bg-sky-500/15'
            : 'hover:bg-sky-50/70 dark:hover:bg-sky-500/10'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
          isActive
            ? 'bg-white border-sky-200 dark:bg-zinc-800 dark:border-sky-700/60'
            : 'bg-white/70 border-sky-100/70 dark:bg-zinc-800/70 dark:border-zinc-700/70'
        }`}>
          <HugeIcon name={item.icon} size={18} className="text-sky-500 dark:text-sky-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <HighlightText
              value={item.title}
              query={highlightQuery}
              className="min-w-0 flex-1 truncate font-semibold text-sm text-sky-950 dark:text-sky-50"
            />
            {item.badge && (
              <span className="hidden sm:inline-flex max-w-[8rem] shrink-0 truncate rounded-md bg-sky-500/[0.07] px-1.5 py-0.5 text-[9px] font-semibold text-sky-600/70 dark:bg-sky-400/10 dark:text-sky-300/70">
                <HighlightText value={item.badge} query={highlightQuery} className="truncate" />
              </span>
            )}
            {matchReason && query.trim() && (
              <span className="inline-flex max-w-[7.5rem] shrink-0 truncate rounded-full bg-[#f5e98d]/85 px-2 py-0.5 text-[9px] font-semibold text-amber-950 shadow-[0_1px_0_rgba(217,177,27,0.2)]">
                {matchReasonLabel[matchReason]}
              </span>
            )}
          </div>
          <HighlightText
            value={item.subtitle}
            query={highlightQuery}
            className="mt-0.5 block truncate text-xs text-sky-700/55 dark:text-sky-300/50"
          />
        </div>

        <div className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <HugeIcon
            name={item.external ? 'Link01' : 'ArrowRight01'}
            size={14}
            className="text-sky-500 dark:text-sky-400"
          />
        </div>
      </button>
    );
  };

  if (!query.trim()) {
    return (
      <div className="pb-2" role="listbox" aria-label="Quick access">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50/70 dark:bg-sky-500/[0.08] border border-sky-100/70 dark:border-sky-500/10 px-4 py-3">
            <HugeIcon name="Search01" size={20} className="mt-0.5 text-sky-500 dark:text-sky-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
                Search across all of TaskTornado
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-sky-700/55 dark:text-sky-300/50">
                Find pages, classes, assignments, tests, decks, quizzes, saved links, folders, and study groups.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-sky-600/55 dark:text-sky-400/55">
          <HugeIcon name="Zap" size={12} />
          Quick access
        </div>
        {QUICK_ROUTE_ITEMS.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  if (!orderedResults.length) {
    return (
      <div className="py-14 px-6 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-3">
          <HugeIcon name="Search01" size={22} className="text-sky-400 dark:text-sky-500" />
        </div>
        <h3 className="text-sky-950 dark:text-sky-100 font-semibold text-base">
          No matches for “{query}”
        </h3>
        <p className="mt-1 mb-5 text-sm text-sky-700/55 dark:text-sky-300/50 max-w-sm">
          Try a page name, class, assignment, test, topic, or a shorter phrase.
        </p>
        <Button variant="outline" size="sm" onClick={() => setQuery('')}>
          Clear search
        </Button>
      </div>
    );
  }

  let renderedIndex = 0;

  return (
    <div className="pb-2" role="listbox" aria-label="Search results">
      <div className="px-5 py-2.5 text-[11px] text-sky-700/55 dark:text-sky-300/50 border-b border-sky-100/60 dark:border-sky-800/30">
        {rankedResults.length} result{rankedResults.length === 1 ? '' : 's'} for “{query}”
      </div>

      {groupedResults.map(([section, items]) => (
        <div key={section} className="py-1.5">
          <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-sky-600/55 dark:text-sky-400/55">
            <HugeIcon name={sectionIcon[section]} size={12} />
            <span>{section}</span>
            <span className="ml-auto tabular-nums">{items.length}</span>
          </div>
          {items.map(item => {
            const currentIndex = renderedIndex;
            renderedIndex += 1;
            return renderItem(item, currentIndex);
          })}
        </div>
      ))}
    </div>
  );
}
