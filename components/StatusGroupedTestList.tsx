'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
import { LinkCard } from './LinkCard';

interface StudyMaterial {
  url: string;
  title?: string;
}
import { getDueDateLabel, getDueDateIcon } from '@/lib/dateUtils';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  BookOpen,
  Calculator,
  GraduationCap,
  FileText,
  Presentation,
  Circle,
  AlertTriangle,
  Star,
  Trash2,
  Target,
  Edit2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnhancedTestCard from './EnhancedTestCard';

type StatusGroupedTestListProps = {
  tests: Test[];
  classes: Class[];
  onDeleteTest: (id: string) => Promise<void>;
};

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'type' | 'class';
type FilterOption = 'all' | 'upcoming' | 'taken' | 'alpha' | 'beta' | 'exam' | 'quiz';

const StatusGroupedTestList = ({
  tests,
  classes,
  onDeleteTest,
}: StatusGroupedTestListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const classesById = useMemo(() => {
    const map = new Map<string, Class>();
    classes?.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const iconMap: Record<string, any> = {
    Calculator,
    GraduationCap,
    FileText,
    Presentation,
    BookOpen,
    Circle,
    AlertTriangle,
    Star,
  };

  const filteredAndSortedTests = useMemo(() => {
    let filtered = tests.filter(test => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          test.title.toLowerCase().includes(query) ||
          test.testType?.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query) ||
          classesById.get(test.classId)?.name.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Status filter
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

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
          break;
        case 'type':
          comparison = (a.testType || '').localeCompare(b.testType || '');
          break;
        case 'class':
          const classA = classesById.get(a.classId)?.name || '';
          const classB = classesById.get(b.classId)?.name || '';
          comparison = classA.localeCompare(classB);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tests, classesById, filter, sortBy, sortOrder, searchQuery]);

  const groupedTests = useMemo(() => {
    const groups: Record<'upcoming' | 'taken', Test[]> = { upcoming: [], taken: [] };
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    filteredAndSortedTests.forEach(test => {
      // A test is completed if:
      // 1. The test date has already occurred (is in the past), OR
      // 2. The test has a status of 'completed' (case-insensitive)
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
      case 'exam':
      case 'final':
      case 'midterm':
        return GraduationCap;
      case 'quiz':
        return FileText;
      case 'project':
        return Presentation;
      case 'alpha':
        return Target;
      case 'beta':
        return AlertTriangle;
      default:
        return BookOpen;
    }
  }, []);

  const stats = useMemo(() => {
    const total = filteredAndSortedTests.length;
    const upcoming = groupedTests.upcoming.length;
    const taken = groupedTests.taken.length;
    const alpha = filteredAndSortedTests.filter(t => t.testType?.toLowerCase() === 'alpha').length;
    const beta = filteredAndSortedTests.filter(t => t.testType?.toLowerCase() === 'beta').length;

    return { total, upcoming, taken, alpha, beta };
  }, [filteredAndSortedTests, groupedTests]);

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  const Section = ({
    title,
    items,
    icon: SectionIcon,
    color,
  }: {
    title: string;
    items: Test[];
    icon: any;
    color: string;
  }) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${color}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
          <SectionIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold">
            {title}
          </h3>
          <p className="text-xs opacity-80">
            {items.length} test{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((test, index) => {
          const classInfo = classesById.get(test.classId);
          const IconComponent = iconMap[classInfo?.icon || 'BookOpen'] || BookOpen;
          const TestTypeIcon = getTestTypeIcon(test.testType);
          const dueDate = new Date(test.testDate);
          const formattedDate = dueDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-[#264f84] dark:hover:border-blue-400 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${test.testType?.toLowerCase() === 'alpha'
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : test.testType?.toLowerCase() === 'beta'
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                      <TestTypeIcon className={`h-4 w-4 ${test.testType?.toLowerCase() === 'alpha'
                        ? 'text-purple-600 dark:text-purple-400'
                        : test.testType?.toLowerCase() === 'beta'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-blue-600 dark:text-blue-400'
                        }`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                      {test.title}
                    </h3>
                  </div>

                  {test.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {test.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                    {test.testTime && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(test.testTime)}
                      </span>
                    )}
                    {classInfo && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        <IconComponent className="h-3.5 w-3.5" />
                        {classInfo.name}
                      </span>
                    )}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${test.testType?.toLowerCase() === 'alpha'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : test.testType?.toLowerCase() === 'beta'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
                      {test.testType}
                    </span>
                    {test.grade && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 text-xs font-semibold text-green-700 dark:text-green-300">
                        <Target className="h-3.5 w-3.5" />
                        {test.grade}
                        {test.score && ` (${test.score}${test.maxScore ? `/${test.maxScore}` : ''})`}
                      </span>
                    )}
                  </div>

                  {test.studyMaterials && test.studyMaterials.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Study Materials</h4>
                      <div className="flex flex-wrap gap-2">
                        {(test.studyMaterials as (string | StudyMaterial)[]).map((material, idx) => {
                          const url = typeof material === 'string' ? material : material.url;
                          const title = typeof material === 'string' ? `Link ${idx + 1}` : (material.title || `Link ${idx + 1}`);
                          return (
                            <LinkCard
                              key={idx}
                              url={url}
                              title={title}
                              className="text-xs"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/tests/edit/${test.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-400 hover:text-[#264f84] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit test"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTest(test.id);
                    }}
                    title="Delete test"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tests by name, type, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#264f84] dark:focus:ring-blue-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Filter */}
            <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
              <SelectTrigger className="w-[145px] h-11 min-h-[2.75rem] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="taken">Taken</SelectItem>
                <SelectItem value="alpha">ALPHA Tests</SelectItem>
                <SelectItem value="beta">BETA Tests</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[130px] h-11 min-h-[2.75rem] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
                <SelectItem value="class">By Class</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-11 w-11 p-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>

            {/* View Mode */}
            <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-9 w-9 p-0 rounded-lg ${viewMode === 'grid'
                  ? 'bg-[#264f84] dark:bg-blue-500 text-white hover:bg-[#1f3f6b] dark:hover:bg-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-9 w-9 p-0 rounded-lg ${viewMode === 'list'
                  ? 'bg-[#264f84] dark:bg-blue-500 text-white hover:bg-[#1f3f6b] dark:hover:bg-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        {(searchQuery || filter !== 'all' || stats.total > 0) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.total}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">total</span>
            </div>
            {stats.upcoming > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats.upcoming}</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">upcoming</span>
              </div>
            )}
            {stats.taken > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{stats.taken}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">completed</span>
              </div>
            )}
            {stats.alpha > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{stats.alpha}</span>
                <span className="text-xs text-purple-600 dark:text-purple-400">ALPHA</span>
              </div>
            )}
            {stats.beta > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{stats.beta}</span>
                <span className="text-xs text-orange-600 dark:text-orange-400">BETA</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {groupedTests.upcoming.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 px-5 py-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-200 dark:border-blue-700">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-900 dark:text-blue-100">
                    Upcoming Tests
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {groupedTests.upcoming.length} test{groupedTests.upcoming.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedTests.upcoming.map((test, index) => {
                  const classInfo = classesById.get(test.classId);
                  const IconComponent = iconMap[classInfo?.icon || 'BookOpen'] || BookOpen;

                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <EnhancedTestCard
                        test={test}
                        classInfo={classInfo}
                        classIcon={IconComponent}
                        onDelete={() => onDeleteTest(test.id)}
                        variant="compact"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {groupedTests.taken.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 px-5 py-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-emerald-200 dark:border-emerald-700">
                  <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                    Completed Tests
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {groupedTests.taken.length} test{groupedTests.taken.length !== 1 ? 's' : ''} taken
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedTests.taken.map((test, index) => {
                  const classInfo = classesById.get(test.classId);
                  const IconComponent = iconMap[classInfo?.icon || 'BookOpen'] || BookOpen;

                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <EnhancedTestCard
                        test={test}
                        classInfo={classInfo}
                        classIcon={IconComponent}
                        onDelete={() => onDeleteTest(test.id)}
                        variant="compact"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTests.upcoming.length > 0 && (
            <Section
              title="Upcoming Tests"
              items={groupedTests.upcoming}
              icon={Calendar}
              color="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-900 dark:text-blue-100"
            />
          )}

          {groupedTests.taken.length > 0 && (
            <Section
              title="Completed Tests"
              items={groupedTests.taken}
              icon={Clock}
              color="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-900 dark:text-emerald-100"
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedTests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative text-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 p-12 shadow-sm overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl opacity-60"></div>

          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 shadow-inner">
              <Calendar className="h-10 w-10 text-[#264f84] dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filter !== 'all' ? 'No tests match your filters' : 'No tests yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Add your first test to keep track of your schedule and grades.'
              }
            </p>
            {(searchQuery || filter !== 'all') && (
              <Button
                variant="outline"
                className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-11 px-6 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                <X className="mr-2 h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StatusGroupedTestList;