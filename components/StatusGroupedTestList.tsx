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
  Edit2
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
      now.setHours(0, 0, 0, 0); // Set to beginning of today for accurate comparison

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

    // Sort tests
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
    now.setHours(0, 0, 0, 0); // Set to beginning of today

    filteredAndSortedTests.forEach(test => {
      if (new Date(test.testDate) < now) {
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
        return Target; // Using Circle as placeholder for alpha
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
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50">
          <SectionIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {items.length} test{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
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
              className="group relative bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TestTypeIcon className={`h-4 w-4 ${test.testType?.toLowerCase() === 'alpha' ? 'text-purple-600' : test.testType?.toLowerCase() === 'beta' ? 'text-orange-600' : 'text-blue-600'}`} />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {test.title}
                    </h3>
                  </div>
                  
                  {test.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {test.description}
                    </p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                    {test.testTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(test.testTime)}
                      </span>
                    )}
                    {classInfo && (
                      <span className="flex items-center gap-1">
                        <IconComponent className="h-3 w-3" />
                        {classInfo.name}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      test.testType?.toLowerCase() === 'alpha' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : test.testType?.toLowerCase() === 'beta'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {test.testType}
                    </span>
                    {test.grade && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <Target className="h-3 w-3" />
                        {test.grade}
                        {test.score && ` (${test.score}${test.maxScore ? `/${test.maxScore}` : ''})`}
                      </span>
                    )}
                  </div>
                  
                  {test.studyMaterials && test.studyMaterials.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Study Materials:</h4>
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
                
                <div className="ml-4 flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/tests/edit/${test.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit test"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
      <div className="bg-transparent">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-3">
            {/* Filter */}
            <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
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
              <SelectTrigger className="w-[120px] bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-9 w-9 p-0 rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-9 w-9 p-0 rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{stats.total}</span>
            <span>total</span>
          </div>
          {stats.upcoming > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">{stats.upcoming}</span>
              <span>upcoming</span>
            </div>
          )}
          {stats.taken > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">{stats.taken}</span>
              <span>taken</span>
            </div>
          )}
          {stats.alpha > 0 && (
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <span className="font-medium">{stats.alpha}</span>
              <span>ALPHA</span>
            </div>
          )}
          {stats.beta > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
              <span className="font-medium">{stats.beta}</span>
              <span>BETA</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {groupedTests.upcoming.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Upcoming Tests
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {groupedTests.upcoming.length} test{groupedTests.upcoming.length !== 1 ? 's' : ''}
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
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
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Completed Tests
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {groupedTests.taken.length} test{groupedTests.taken.length !== 1 ? 's' : ''}
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
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
              color="border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20"
            />
          )}

          {groupedTests.taken.length > 0 && (
            <Section
              title="Completed Tests"
              items={groupedTests.taken}
              icon={Clock}
              color="border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20"
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
          className="text-center rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40 backdrop-blur p-10 shadow-sm"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200/40 bg-blue-500/10">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {searchQuery || filter !== 'all' ? 'No tests match your filters' : 'No tests yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Add your first test to keep track of your schedule and grades.'
            }
          </p>
          {(searchQuery || filter !== 'all') && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default StatusGroupedTestList;