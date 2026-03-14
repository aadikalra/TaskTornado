'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
import { LinkCard } from './LinkCard';

interface StudyMaterial {
  url: string;
  title?: string;
}
import { getClassIcon } from '@/lib/icon-map';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  BookOpen,
  GraduationCap,
  FileText,
  Presentation,
  AlertTriangle,
  Target,
  X,
  ChevronRight,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestDetailModal } from './TestDetailModal';

type StatusGroupedTestListProps = {
  tests: Test[];
  classes: Class[];
  onDeleteTest: (id: string) => Promise<void>;
};

type FilterOption = 'all' | 'upcoming' | 'taken' | 'alpha' | 'beta' | 'exam' | 'quiz';

// Class color palette (same order as MainApp)
const CLASS_COLORS = [
  { bg: '#F9A8A8', header: '#DC2626' },
  { bg: '#93C5FD', header: '#2563EB' },
  { bg: '#FCD39D', header: '#D97706' },
  { bg: '#86EFAC', header: '#16A34A' },
  { bg: '#C4B5FD', header: '#7C3AED' },
  { bg: '#F9A8D4', header: '#DB2777' },
  { bg: '#99F6E4', header: '#0D9488' },
  { bg: '#CBD5E1', header: '#475569' },
];

const StatusGroupedTestList = ({
  tests,
  classes,
  onDeleteTest,
}: StatusGroupedTestListProps) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTaken, setShowTaken] = useState(false);

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const classesById = useMemo(() => {
    const map = new Map<string, Class>();
    classes?.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const classIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    classes.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [classes]);

  const getColorForClass = useCallback((classId: string) => {
    const idx = classIndexMap.get(classId) ?? 0;
    return CLASS_COLORS[idx % CLASS_COLORS.length];
  }, [classIndexMap]);

  const filteredAndSortedTests = useMemo(() => {
    let filtered = tests.filter(test => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          test.title.toLowerCase().includes(query) ||
          test.testType?.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query) ||
          classesById.get(test.classId)?.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'upcoming':
          if (new Date(test.testDate) < now) return false;
          break;
        case 'taken':
          if (new Date(test.testDate) >= now) return false;
          break;
        case 'alpha':
          if (test.testType?.toLowerCase() !== 'alpha') return false;
          break;
        case 'beta':
          if (test.testType?.toLowerCase() !== 'beta') return false;
          break;
        case 'exam':
          if (!['exam', 'final', 'midterm'].includes(test.testType?.toLowerCase() || '')) return false;
          break;
        case 'quiz':
          if (test.testType?.toLowerCase() !== 'quiz') return false;
          break;
      }
      return true;
    });

    filtered.sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
    return filtered;
  }, [tests, classesById, filter, searchQuery]);

  const groupedTests = useMemo(() => {
    const groups: Record<'upcoming' | 'taken', Test[]> = { upcoming: [], taken: [] };
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    filteredAndSortedTests.forEach(test => {
      if (new Date(test.testDate) < now || test.status?.toLowerCase() === 'completed') {
        groups.taken.push(test);
      } else {
        groups.upcoming.push(test);
      }
    });
    return groups;
  }, [filteredAndSortedTests]);

  const getTestTypeIcon = useCallback((testType?: string) => {
    if (!testType) return BookOpen;
    switch (testType.toLowerCase()) {
      case 'exam': case 'final': case 'midterm': return GraduationCap;
      case 'quiz': return FileText;
      case 'project': return Presentation;
      case 'alpha': return Target;
      case 'beta': return Zap;
      default: return BookOpen;
    }
  }, []);

  const getTestTypeBadgeClasses = useCallback((testType?: string) => {
    const type = testType?.toLowerCase() || '';
    switch (type) {
      case 'alpha': return 'bg-sky-100/70 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
      case 'beta': return 'bg-[#ebf6b5]/70 text-sky-800 dark:bg-[#ebf6b5]/15 dark:text-sky-200';
      case 'exam': case 'final': case 'midterm': return 'bg-sky-200/60 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200';
      case 'quiz': return 'bg-sky-100/50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300';
      case 'project': return 'bg-[#ebf6b5]/50 text-sky-700 dark:bg-[#ebf6b5]/10 dark:text-sky-200';
      default: return 'bg-sky-50 text-sky-500 dark:bg-sky-500/5 dark:text-sky-400';
    }
  }, []);

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const getDueDateLabel = useCallback((testDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const test = new Date(testDate);
    test.setHours(0, 0, 0, 0);
    const diffDays = Math.round((test.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    return test.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Render a single test as a compact horizontal row
  const renderTestRow = useCallback((test: Test, index: number) => {
    const classInfo = classesById.get(test.classId);
    const color = getColorForClass(test.classId);
    const TypeIcon = getTestTypeIcon(test.testType);
    const dueDate = new Date(test.testDate);
    const dueDateLabel = getDueDateLabel(dueDate);
    const badgeClasses = getTestTypeBadgeClasses(test.testType);

    const isToday = dueDateLabel === 'Today';
    const isTomorrow = dueDateLabel === 'Tomorrow';

    return (
      <motion.div
        key={test.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        onClick={() => handleTestClick(test)}
        className="group flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-sky-500/[0.04] dark:hover:bg-sky-500/[0.06] transition-colors duration-200"
      >
        {/* Left accent dot */}
        <div
          className="shrink-0 w-2 h-2 rounded-full transition-transform group-hover:scale-125 duration-300"
          style={{ backgroundColor: color.header }}
        />

        {/* Type icon */}
        <div
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-transform group-hover:scale-110 duration-300"
          style={{ backgroundColor: `${color.bg}35` }}
        >
          <TypeIcon className="w-3.5 h-3.5" style={{ color: color.header }} />
        </div>

        {/* Title + class name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-sky-900 dark:text-sky-100 truncate group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
              {test.title}
            </span>
          </div>
          {classInfo && (
            <span className="text-[11px] text-sky-600/40 dark:text-sky-400/35 font-medium">
              {classInfo.name}
            </span>
          )}
        </div>

        {/* Right side: badges + date */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Score for taken tests */}
          {(test.grade || (test.score !== null && test.score !== undefined)) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebf6b5]/50 dark:bg-[#ebf6b5]/10 text-sky-800 dark:text-sky-200 border border-[#d4e88e]/30 dark:border-[#d4e88e]/10 font-mono">
              {test.grade || `${test.score}/${test.maxScore}`}
            </span>
          )}

          {/* Type badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeClasses}`}>
            {test.testType || 'Test'}
          </span>

          {/* Date */}
          <span className={`text-[11px] tabular-nums whitespace-nowrap ${isToday
            ? 'text-sky-600 dark:text-sky-400 font-semibold'
            : isTomorrow
              ? 'text-sky-500 dark:text-sky-400 font-medium'
              : 'text-sky-600/35 dark:text-sky-400/30'
            }`}>
            {dueDateLabel}
          </span>

          {/* Chevron */}
          <ChevronRight className="w-3.5 h-3.5 text-sky-300 dark:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    );
  }, [classesById, getColorForClass, getTestTypeIcon, getTestTypeBadgeClasses, getDueDateLabel]);

  return (
    <div className="space-y-3">
      {/* Search & Filter — compact inline bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-sky-400 dark:text-sky-500" />
          <Input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400/60 dark:placeholder-sky-500/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-sky-400 hover:text-sky-600 dark:hover:text-sky-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:border-sky-500 rounded-xl">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
            <SelectItem value="all" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">All Tests</SelectItem>
            <SelectItem value="upcoming" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Upcoming</SelectItem>
            <SelectItem value="taken" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Taken</SelectItem>
            <SelectItem value="alpha" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">ALPHA</SelectItem>
            <SelectItem value="beta" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">BETA</SelectItem>
            <SelectItem value="exam" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Exams</SelectItem>
            <SelectItem value="quiz" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Quizzes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Tests — compact row list */}
      {groupedTests.upcoming.length > 0 && (
        <div className="bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-white/5 divide-y divide-sky-50 dark:divide-gray-800/50 overflow-hidden">
          {groupedTests.upcoming.map((test, index) => renderTestRow(test, index))}
        </div>
      )}

      {/* Past Tests — collapsible */}
      {groupedTests.taken.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
            <button
              onClick={() => setShowTaken(!showTaken)}
              className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
            >
              Past Tests ({groupedTests.taken.length})
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showTaken ? 'rotate-180' : ''}`} />
            </button>
            <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
          </div>

          <AnimatePresence>
            {showTaken && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-white/5 divide-y divide-sky-50 dark:divide-gray-800/50 overflow-hidden opacity-50">
                  {groupedTests.taken.map((test, index) => renderTestRow(test, index))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty State */}
      {filteredAndSortedTests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-950 rounded-2xl p-6 text-center border border-sky-100 dark:border-gray-800"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-50 dark:bg-gray-900 rounded-xl mb-4 border border-sky-100 dark:border-gray-800">
            <Calendar className="h-6 w-6 text-sky-400 dark:text-sky-500" />
          </div>
          <h3 className="text-xl font-light text-sky-900 dark:text-white mb-2 tracking-tight">
            {searchQuery || filter !== 'all' ? 'No tests match your filters' : 'No tests yet'}
          </h3>
          <p className="text-sky-600/60 dark:text-gray-400 max-w-xs mx-auto text-sm">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add your first test to keep track of your schedule and grades.'
            }
          </p>
          {(searchQuery || filter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setFilter('all'); }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </motion.div>
      )}

      <TestDetailModal
        test={selectedTest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={onDeleteTest}
        classInfo={selectedTest ? classesById.get(selectedTest.classId) : undefined}
        layoutId={selectedTest ? `test-card-${selectedTest.id}` : undefined}
      />
    </div>
  );
};

export default StatusGroupedTestList;