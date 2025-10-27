'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      switch (filter) {
        case 'upcoming':
          if (test.status !== 'upcoming') return false;
          break;
        case 'taken':
          if (test.status !== 'taken') return false;
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
    filteredAndSortedTests.forEach(test => {
      if (test.status === 'taken') groups.taken.push(test);
      else groups.upcoming.push(test);
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
        return Circle; // Using Circle as placeholder for alpha
      case 'beta':
        return AlertTriangle; // Using AlertTriangle as placeholder for beta
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
          <SectionIcon className="h-4 w-4 text-gray-700" />
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

      <div className="space-y-3 pl-4">
        {items.map((test, index) => {
          const classInfo = classesById.get(test.classId);
          const IconComponent = iconMap[classInfo?.icon || 'BookOpen'] || BookOpen;

          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
    </motion.section>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur rounded-xl border border-gray-200/70 dark:border-gray-800/70 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
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
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
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