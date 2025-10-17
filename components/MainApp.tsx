'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { OnboardingModal } from './OnboardingModal';
import { Button } from '@/components/ui/button';
import { TypingText } from './animate-ui/text/typing';

type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

import {
  BookOpen, Plus, X, Calendar as CalendarIcon, ClipboardList, Check, CheckCircle, Clock,
  ChevronRight, Link, Trash2, Book, Calculator, Code, FlaskConical as Flask, Globe, GraduationCap,
  Layers, Library, PenTool, Ruler, School, Atom, Award, Brain, Briefcase, Compass,
  Cpu, Database, FileText, Film, Gamepad2, GitBranch, Globe2, History,
  Image, Laptop, Lightbulb, Map, Mic2, Music, Palette, Pen, PieChart, Presentation,
  Rocket, Search, Settings, Shield, Smartphone, Speaker, Target, Terminal, TestTube,
  TrendingUp, Type, Video, Wifi, Zap, BookKey, BookLock, BookPlus, BookType, BookUp2,
  BookUser, BookX, BrainCircuit, BrainCog, CalendarCheck, CalendarDays, CalendarHeart,
  CalendarPlus, Camera, Cast, CheckSquare, Cloud, Code2, CreditCard, Crop, Crosshair,
  DollarSign, Download, Edit, FileArchive, FileAudio, FileCode, FileJson, FileVideo,
  FileVolume2, FileWarning, Filter, Flag, Folder, FolderOpen, Gift, GitCommit, Github,
  Gitlab, GitPullRequest, GitCompare, GitFork, GitMerge, GitPullRequestClosed, Gavel,
  GitGraph, GitCommitVertical, GitCompareArrows, GitBranchPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { HomeworkLinkInput } from './HomeworkLinkInput';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LevelDisplay } from './LevelDisplay';
import { SubjectMastery } from './SubjectMastery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconSelector } from '@/components/IconSelector';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';
import { useToast } from '@/context/ToastContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '../context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import { HomeworkPinList } from '@/components/HomeworkPinList';
import { RecurringOptions } from './RecurringOptions';
import { RecurringHomework, RecurringFrequency, Class, Homework } from '@/context/ClassContext';
import { iconMap } from '@/lib/icon-map';

type LucideIconName = keyof typeof import('lucide-react');
type Priority = 'low' | 'medium' | 'high';

const MainApp = () => {
  const { user, full_name } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const { data: gamificationData } = useGamification();
  const { 
    classes, 
    homeworks, 
    loading, 
    error, 
    addClass, 
    addHomework,
    addRecurringHomework,
    toggleHomework, 
    togglePinHomework,
    deleteHomework,
    deleteClass 
  } = useClassContext();
  const [isClient, setIsClient] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showPinHomeworkModal, setShowPinHomeworkModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassIcon, setNewClassIcon] = useState<LucideIconName>('BookOpen');
  const [searchQuery, setSearchQuery] = useState('');

  // Available icons with their display names
  const availableIcons = [
    { name: 'BookOpen', component: BookOpen, category: 'General' },
    { name: 'Book', component: Book, category: 'General' },
    { name: 'Calculator', component: Calculator, category: 'Math & Science' },
    { name: 'Code', component: Code, category: 'Computer Science' },
    { name: 'Flask', component: Flask, category: 'Science' },
    { name: 'Globe', component: Globe, category: 'Geography' },
    { name: 'GraduationCap', component: GraduationCap, category: 'General' },
    { name: 'Layers', component: Layers, category: 'General' },
    { name: 'Library', component: Library, category: 'General' },
    { name: 'PenTool', component: PenTool, category: 'Art' },
    { name: 'Ruler', component: Ruler, category: 'Math' },
    { name: 'School', component: School, category: 'General' },
    { name: 'Atom', component: Atom, category: 'Science' },
    { name: 'Award', component: Award, category: 'General' },
    { name: 'Brain', component: Brain, category: 'Science' },
    { name: 'Briefcase', component: Briefcase, category: 'Business' },
    { name: 'Compass', component: Compass, category: 'Geography' },
    { name: 'Cpu', component: Cpu, category: 'Computer Science' },
    { name: 'Database', component: Database, category: 'Computer Science' },
    { name: 'FileText', component: FileText, category: 'General' },
    { name: 'Film', component: Film, category: 'Media' },
    { name: 'Gamepad2', component: Gamepad2, category: 'Gaming' },
    { name: 'GitBranch', component: GitBranch, category: 'Computer Science' },
    { name: 'Globe2', component: Globe2, category: 'Geography' },
    { name: 'History', component: History, category: 'History' },
    { name: 'Image', component: Image, category: 'Art' },
    { name: 'Laptop', component: Laptop, category: 'Computer Science' },
    { name: 'Lightbulb', component: Lightbulb, category: 'General' },
    { name: 'Map', component: Map, category: 'Geography' },
    { name: 'Mic2', component: Mic2, category: 'Languages' },
    { name: 'Music', component: Music, category: 'Music' },
    { name: 'Palette', component: Palette, category: 'Art' },
    { name: 'Pen', component: Pen, category: 'General' },
    { name: 'PieChart', component: PieChart, category: 'Math' },
    { name: 'Presentation', component: Presentation, category: 'General' },
    { name: 'Rocket', component: Rocket, category: 'Science' },
    { name: 'Search', component: Search, category: 'General' },
    { name: 'Settings', component: Settings, category: 'General' },
    { name: 'Shield', component: Shield, category: 'General' },
    { name: 'Smartphone', component: Smartphone, category: 'Technology' },
    { name: 'Speaker', component: Speaker, category: 'Languages' },
    { name: 'Target', component: Target, category: 'General' },
    { name: 'Terminal', component: Terminal, category: 'Computer Science' },
    { name: 'TestTube', component: TestTube, category: 'Science' },
    { name: 'TrendingUp', component: TrendingUp, category: 'Business' },
    { name: 'Type', component: Type, category: 'Languages' },
    { name: 'Video', component: Video, category: 'Media' },
    { name: 'Wifi', component: Wifi, category: 'Technology' },
    { name: 'Zap', component: Zap, category: 'General' },
    { name: 'BookKey', component: BookKey, category: 'General' },
    { name: 'BookLock', component: BookLock, category: 'General' },
    { name: 'BookPlus', component: BookPlus, category: 'General' },
    { name: 'BookType', component: BookType, category: 'Languages' },
    { name: 'BookUp2', component: BookUp2, category: 'General' },
    { name: 'BookUser', component: BookUser, category: 'General' },
    { name: 'BookX', component: BookX, category: 'General' },
    { name: 'BrainCircuit', component: BrainCircuit, category: 'Science' },
    { name: 'BrainCog', component: BrainCog, category: 'Science' },
    { name: 'CalendarCheck', component: CalendarCheck, category: 'General' },
    { name: 'CalendarDays', component: CalendarDays, category: 'General' },
    { name: 'CalendarHeart', component: CalendarHeart, category: 'General' },
    { name: 'CalendarPlus', component: CalendarPlus, category: 'General' },
    { name: 'Camera', component: Camera, category: 'Media' },
    { name: 'Cast', component: Cast, category: 'Media' },
    { name: 'CheckSquare', component: CheckSquare, category: 'General' },
    { name: 'Cloud', component: Cloud, category: 'Technology' },
    { name: 'Code2', component: Code2, category: 'Computer Science' },
    { name: 'CreditCard', component: CreditCard, category: 'Business' },
    { name: 'Crop', component: Crop, category: 'Art' },
    { name: 'Crosshair', component: Crosshair, category: 'General' },
    { name: 'DollarSign', component: DollarSign, category: 'Business' },
    { name: 'Download', component: Download, category: 'General' },
    { name: 'Edit', component: Edit, category: 'General' },
    { name: 'FileArchive', component: FileArchive, category: 'General' },
    { name: 'FileAudio', component: FileAudio, category: 'Media' },
    { name: 'FileCode', component: FileCode, category: 'Computer Science' },
    { name: 'FileJson', component: FileJson, category: 'Computer Science' },
    { name: 'FileVideo', component: FileVideo, category: 'Media' },
    { name: 'FileVolume2', component: FileVolume2, category: 'Media' },
    { name: 'FileWarning', component: FileWarning, category: 'General' },
    { name: 'Filter', component: Filter, category: 'General' },
    { name: 'Flag', component: Flag, category: 'General' },
    { name: 'Folder', component: Folder, category: 'General' },
    { name: 'FolderOpen', component: FolderOpen, category: 'General' },
    { name: 'Gift', component: Gift, category: 'General' },
    { name: 'GitCommit', component: GitCommit, category: 'Computer Science' },
    { name: 'Github', component: Github, category: 'Computer Science' },
    { name: 'Gitlab', component: Gitlab, category: 'Computer Science' },
    { name: 'GitPullRequest', component: GitPullRequest, category: 'Computer Science' },
    { name: 'GitCompare', component: GitCompare, category: 'Computer Science' },
    { name: 'GitFork', component: GitFork, category: 'Computer Science' },
    { name: 'GitMerge', component: GitMerge, category: 'Computer Science' },
    { name: 'GitPullRequestClosed', component: GitPullRequestClosed, category: 'Computer Science' },
    { name: 'Gavel', component: Gavel, category: 'Law' },
    { name: 'GitGraph', component: GitGraph, category: 'Computer Science' },
    { name: 'GitCommitVertical', component: GitCommitVertical, category: 'Computer Science' },
    { name: 'GitCompareArrows', component: GitCompareArrows, category: 'Computer Science' },
    { name: 'GitBranchPlus', component: GitBranchPlus, category: 'Computer Science' }
  ];

  // Filter icons based on search query
  const filteredIcons = availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group icons by category
  const groupedIcons = filteredIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, typeof availableIcons>);

  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium' as Priority,
    classId: classes[0]?.id || '',
    links: [] as HomeworkLink[],
  });
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState<RecurringHomework>({
    frequency: 'weekly'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-show onboarding modal for users with no classes
  useEffect(() => {
    if (isClient && user && classes.length === 0 && !loading) {
      setShowOnboarding(true);
    }
  }, [isClient, user, classes.length, loading]);

  // Show toast notifications for overdue assignments
  React.useEffect(() => {
    // Always run this effect to maintain hook order, but check conditions inside
    if (!isClient || loading || homeworks.length === 0) return;

  const overdueAssignments = homeworks.filter((hw: Homework) => {
    const dueDate = new Date(hw.dueDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of today (midnight)
    return !hw.completed && dueDate < todayStart;
  });

  if (overdueAssignments.length > 0) {
    // Group by class for better messaging
    const overdueByClass = overdueAssignments.reduce((acc: Record<string, any[]>, hw: Homework) => {
      const className = classes.find((cls: Class) => cls.id === hw.classId)?.name || 'Unknown Class';
      if (!acc[className]) acc[className] = [];
      acc[className].push(hw);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(overdueByClass).forEach(([className, assignments]: [string, any]) => {
      if (assignments.length === 1) {
        warning(
          `${assignments[0].title} is overdue!`,
          `Due date was ${new Date(assignments[0].dueDate).toLocaleDateString()}`
        );
      } else {
        warning(
          `${assignments.length} assignments overdue in ${className}`,
          `Check your ${className} assignments`
        );
      }
    });
  }
  }, [isClient, loading, homeworks, classes, warning]);

  // Show toast notifications for assignments due soon
  React.useEffect(() => {
    // Always run this effect to maintain hook order, but check conditions inside
    if (!isClient || loading || homeworks.length === 0) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const threeDaysFromNow = new Date(todayStart);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const dueSoonAssignments = homeworks.filter((hw: Homework) => {
      const dueDate = new Date(hw.dueDate);
      return !hw.completed && dueDate >= todayStart && dueDate <= threeDaysFromNow;
    });

    if (dueSoonAssignments.length > 0) {
      // Group by class for better messaging
      const dueSoonByClass = dueSoonAssignments.reduce((acc: Record<string, any[]>, hw: Homework) => {
        const className = classes.find((cls: Class) => cls.id === hw.classId)?.name || 'Unknown Class';
        if (!acc[className]) acc[className] = [];
        acc[className].push(hw);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(dueSoonByClass).forEach(([className, assignments]: [string, any]) => {
        if (assignments.length === 1) {
          const hw = assignments[0];
          const dueDate = new Date(hw.dueDate);
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const tomorrowStart = new Date(todayStart);
          tomorrowStart.setDate(tomorrowStart.getDate() + 1);

          let timePhrase = '';
          if (dueDate >= todayStart && dueDate < tomorrowStart) {
            timePhrase = 'today';
          } else if (dueDate >= tomorrowStart && dueDate < new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)) {
            timePhrase = 'tomorrow';
          } else {
            const daysUntilDue = Math.ceil((dueDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
            timePhrase = `in ${daysUntilDue} days`;
          }

          warning(
            `${hw.title} is due ${timePhrase}!`,
            `Due on ${dueDate.toLocaleDateString()}`
          );
        } else {
          warning(
            `${assignments.length} assignments due soon in ${className}`,
            `Check your ${className} assignments`
          );
        }
      });
    }
  }, [isClient, loading, homeworks, classes, warning]);

  // Show success toast when completing homework
  const handleHomeworkToggle = useCallback(async (homeworkId: string) => {
    const homework = homeworks.find((hw: Homework) => hw.id === homeworkId);
    if (!homework) return;

    const wasCompleted = homework.completed;
    const oldLevel = gamificationData.currentLevel;

    await toggleHomework(homeworkId);

    // Show success toast if item was just completed
    if (!wasCompleted) {
      const className = classes.find((cls: Class) => cls.id === homework.classId)?.name || 'Unknown Class';

      // Enhanced success message with XP info (calculated by recalculateTotalXP)
      let successMessage = `Great job on your ${className} assignment!`;

      if (oldLevel !== gamificationData.currentLevel) {
        successMessage += ` 🎉 Level up to ${gamificationData.currentLevel}!`;
      }

      success(
        `✅ ${homework.title} completed!`,
        successMessage
      );
    }
  }, [homeworks, classes, toggleHomework, gamificationData, success]);

  // Add debugging for homework display
  useEffect(() => {
    console.log('Available classes:', classes.map((cls: Class) => ({ id: cls.id, name: cls.name })));
    console.log('Total homework items:', homeworks.length);
    console.log('Homework items:', homeworks.map((hw: Homework) => ({ id: hw.id, classId: hw.classId, title: hw.title })));
  }, [classes, homeworks]);

  // Only return null if not client-side after hooks are initialized
  if (!isClient) {
    return null;
  }

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    try {
      await addClass(newClassName, newClassIcon);
      success(
        `✅ ${newClassName} class added!`,
        'Ready to add your first assignments!'
      );
      setNewClassName('');
      setShowAddClass(false);
    } catch (error) {
      toastError('Failed to add class', 'Please try again');
      console.error('Error adding class:', error);
    }
  };

  const handleAddHomework = async () => {
    if (!newHomework.title.trim() || !newHomework.classId) return;

    try {
      if (isRecurringEnabled) {
        // Add recurring homework
        await addRecurringHomework(
          newHomework.classId,
          newHomework.title,
          newHomework.dueDate,
          newHomework.priority as Priority,
          newHomework.links,
          recurringConfig
        );

        success(
          `✅ ${newHomework.title} recurring homework added!`,
          `First instance created. Future instances will be generated automatically.`
        );
      } else {
        // Add regular homework
        await addHomework(
          newHomework.classId,
          newHomework.title,
          newHomework.dueDate,
          newHomework.priority as Priority,
          newHomework.links
        );

        success(
          `✅ ${newHomework.title} added!`,
          'Don\'t forget to mark it complete when done!'
        );
      }

      // Reset form state
      setNewHomework({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium',
        classId: classes[0]?.id || '',
        links: [],
      });

      // Reset recurring state
      setIsRecurringEnabled(false);
      setRecurringConfig({
        frequency: 'weekly'
      });

      setShowAddHomework(false);
    } catch (error) {
      toastError('Failed to add homework', 'Please try again');
      console.error('Error adding homework:', error);
    }
  };

  // Color mapping for class icons
  const classColors = {
    red: '#E53E3E',
    blue: '#3182CE',
    yellow: '#D69E2E',
    green: '#38A169',
    purple: '#805AD5',
    pink: '#D53F8C',
    teal: '#2E7774',
    gray: '#4A5568'
  };

  // Get initials from class name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get a consistent color for each class
  const getClassColor = (index: number) => {
    const colors = Object.values(classColors);
    return colors[index % colors.length];
  };

  // Calculate next due homework and days until due (no useMemo to avoid hook ordering issues)
  const nextDueHomework = homeworks.length > 0
    ? homeworks
        .filter((hw: any) => !hw.completed && new Date(hw.dueDate) > new Date())
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
    : null;

  const daysUntilNextDue = nextDueHomework
    ? Math.ceil((new Date(nextDueHomework.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome & Stats Section */}
        <div className="mb-10">
          <TypingText
            className="text-4xl"
            text={`Welcome back, ${full_name || 'Student'}!`}
            cursor
            cursorClassName="h-9"
          />
          <p className="text-gray-600 dark:text-gray-400 text-base">Here's what's happening with your classes today</p>
        </div>

        {/* Stats Section - Compact Horizontal Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-5 mb-6">
          <div className="flex items-center justify-between text-sm">
            {/* Completion Rate */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {homeworks.length > 0 ? Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
              </div>
            </div>

            {/* Overdue Items */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {homeworks.filter((hw: any) => {
                    const dueDate = new Date(hw.dueDate);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    return !hw.completed && dueDate < todayStart;
                  }).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
              </div>
            </div>

            {/* Next Deadline */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                {nextDueHomework ? (
                  <>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {daysUntilNextDue}
                      <span className="text-sm hidden sm:inline"> days</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next Due</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next Due</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <LevelDisplay />
          <SubjectMastery />
        </div>

        {/* Pinned Homeworks */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Pinned Homeworks</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Quick access to your important assignments</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPinHomeworkModal(true)}
              className="border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white rounded-full h-9 px-4 text-sm font-medium"
              title="Select homework to pin"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Pin Homework
            </Button>
          </div>
          <HomeworkPinList triggerSelectModal={showPinHomeworkModal} />
        </div>

        {/* Classes Section */}
        <div className="mb-12">
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">My Classes</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your classes and assignments</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddClass(true)}
                className="border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white rounded-full h-9 px-4 text-sm font-medium"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Class
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddHomework(true)}
                className="border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white rounded-full h-9 px-4 text-sm font-medium"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Homework
              </Button>
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#264f84] bg-opacity-10 dark:bg-opacity-20 mb-4">
                <BookOpen className="h-6 w-6 text-[#264f84]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No classes yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get started by adding your first class to organize your schoolwork
              </p>
              <Button
                onClick={() => setShowAddClass(true)}
                className="w-full bg-[#264f84] hover:bg-[#1f3f6b] text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Class
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((cls: any, index: number) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                        style={{ backgroundColor: getClassColor(index) }}
                      >
                        {(() => {
                          const IconComponent = iconMap[cls.icon as keyof typeof iconMap];
                          console.log('Rendering icon:', {
                            className: cls.name,
                            icon: cls.icon,
                            exists: !!IconComponent,
                            availableIcons: Object.keys(iconMap)
                          });
                          return IconComponent 
                            ? React.createElement(IconComponent, { className: 'h-5 w-5' })
                            : React.createElement(Book, { className: 'h-5 w-5' });
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {cls.name}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteClass(cls.id);
                        }}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 -mr-1 -mt-1 transition-colors"
                        aria-label="Delete class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <PlayfulHomeworkList
                      items={(() => {
                        const classHomeworks = homeworks
                          .filter((hw: any) => hw.classId === cls.id)
                          .filter((hw: any) => hw.is_recurring_instance === true || hw.recurring_id == null) // Show recurring instances and regular homework
                          .map((hw: any) => {
                            console.log('Homework item for class', cls.name, ':', {
                              id: hw.id,
                              classId: hw.classId,
                              className: cls.name,
                              title: hw.title,
                              completed: hw.completed,
                              dueDate: hw.dueDate
                            });
                            return {
                              id: hw.id,
                              text: hw.title,
                              completed: hw.completed,
                              subtext: new Date(hw.dueDate),
                              priority: hw.priority || 'medium',
                              classId: cls.id,
                              classColor: getClassColor(index),
                              dueDateIcon: <CalendarIcon className="h-3 w-3 text-gray-400" />,
                              links: hw.links,
                              onDelete: () => deleteHomework(hw.id),
                              className: cls.name,
                              pinned: hw.pinned || false,
                              // Add recurring homework information
                              recurring: hw.recurring_frequency ? {
                                frequency: hw.recurring_frequency as RecurringFrequency,
                                endDate: hw.recurring_end_date ? new Date(hw.recurring_end_date) : undefined,
                                maxOccurrences: hw.recurring_max_occurrences || undefined,
                                parentRecurringId: hw.recurring_id || undefined,
                              } : undefined,
                              isRecurringInstance: hw.is_recurring_instance || false,
                              parentRecurringId: hw.parent_recurring_id || undefined,
                              recurringFrequency: hw.recurring_frequency || undefined,
                            };
                          });

                        // Show all items if expanded, otherwise show only first 3
                        return expandedClasses[cls.id] ? classHomeworks : classHomeworks.slice(0, 3);
                      })()}
                      onItemToggle={handleHomeworkToggle}
                      onPinToggle={togglePinHomework}
                      className="space-y-2"
                    />

                    {(() => {
                      const classHomeworks = homeworks.filter((hw: any) => hw.classId === cls.id && (hw.is_recurring_instance === true || hw.recurring_id == null));
                      const totalCount = classHomeworks.length;

                      if (totalCount > 3) {
                        return (
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                            {expandedClasses[cls.id] ? (
                              <button
                                onClick={() => setExpandedClasses(prev => ({ ...prev, [cls.id]: false }))}
                                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => setExpandedClasses(prev => ({ ...prev, [cls.id]: true }))}
                                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              >
                                +{totalCount - 3} more assignments
                              </button>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {homeworks.filter((hw: any) => hw.classId === cls.id && (hw.is_recurring_instance === true || hw.recurring_id == null)).length === 0 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">No assignments yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Class Modal */}
        <AnimatePresence>
          {showAddClass && (
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => setShowAddClass(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Add New Class</h2>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="className" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Class Name
                    </Label>
                    <Input
                      id="className"
                      type="text"
                      value={newClassName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value)}
                      placeholder="e.g., Math 101"
                      className="w-full"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddClass()}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Choose an Icon
                    </Label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search icons..."
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full mb-3"
                          autoComplete="off"
                        />
                      </div>

                      <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                          <div key={category} className="border-b last:border-b-0">
                            <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {category}
                            </div>
                            <div className="grid grid-cols-6 gap-1 p-2">
                              {icons.map(({ name, component: IconComponent }) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setNewClassIcon(name as LucideIconName);
                                    setSearchQuery('');
                                  }}
                                  className={`p-2 rounded-md flex items-center justify-center ${newClassIcon === name
                                    ? 'bg-[#264f84] text-white'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                                  title={name}
                                >
                                  <IconComponent className="h-5 w-5" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {filteredIcons.length === 0 && (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No icons found. Try a different search term.
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Selected: {newClassIcon}</span>
                        <span>{filteredIcons.length} icons</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddClass(false)}
                      className="px-4 h-9 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddClass}
                      disabled={!newClassName.trim()}
                      className="bg-[#264f84] hover:bg-[#1f3f6b] text-white px-4 h-9 text-sm"
                    >
                      Add Class
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Homework Modal */}
        <AnimatePresence>
          {showAddHomework && (
            <div className="fixed inset-0 bg-white/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md p-5 relative"
              >
                <button
                  onClick={() => {
                    setShowAddHomework(false);
                    // Reset recurring state when modal is closed
                    setIsRecurringEnabled(false);
                    setRecurringConfig({ frequency: 'weekly' });
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Homework</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="homeworkTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Title
                    </Label>
                    <Input
                      id="homeworkTitle"
                      type="text"
                      value={newHomework.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHomework({ ...newHomework, title: e.target.value })}
                      placeholder="e.g., Chapter 5 Exercises"
                      className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="homeworkDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description (Optional)
                    </Label>
                    <textarea
                      id="homeworkDescription"
                      value={newHomework.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewHomework({ ...newHomework, description: e.target.value })}
                      placeholder="Add any additional details..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Due Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#264f84]"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            {format(newHomework.dueDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <Calendar
                            mode="single"
                            selected={newHomework.dueDate}
                            onSelect={(date) => date && setNewHomework({ ...newHomework, dueDate: date })}
                            initialFocus
                            className="text-gray-900 dark:text-gray-100"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Priority
                      </Label>
                      <Select
                        value={newHomework.priority}
                        onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as Priority })}
                      >
                        <SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm hover:border-[#264f84]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectItem value="low" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">Low</SelectItem>
                          <SelectItem value="medium" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">Medium</SelectItem>
                          <SelectItem value="high" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="class" className="block text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5">
                      Class
                    </Label>
                    <Select
                      value={newHomework.classId}
                      onValueChange={(value) => setNewHomework({ ...newHomework, classId: value })}
                    >
                      <SelectTrigger className="h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm hover:border-[#264f84]">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                        {classes.map((cls: any) => (
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm"
                          >
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurringHomework"
                        checked={isRecurringEnabled}
                        onCheckedChange={(checked) => setIsRecurringEnabled(checked as boolean)}
                        className="h-4 w-4 rounded-md border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-[#264f84] data-[state=checked]:bg-[#264f84] data-[state=checked]:border-[#264f84] hover:border-[#264f84]"
                      />
                      <Label
                        htmlFor="recurringHomework"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        Make this a recurring homework
                      </Label>
                    </div>

                    {isRecurringEnabled && (
                      <RecurringOptions
                        recurring={recurringConfig}
                        onChange={setRecurringConfig}
                      />
                    )}

                    <HomeworkLinkInput
                      links={newHomework.links}
                      onChange={(links) => setNewHomework({ ...newHomework, links })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddHomework(false);
                        // Reset recurring state when modal is cancelled
                        setIsRecurringEnabled(false);
                        setRecurringConfig({ frequency: 'weekly' });
                      }}
                      className="px-4 h-9 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddHomework}
                      disabled={!newHomework.title.trim() || !newHomework.classId}
                      className="bg-[#264f84] hover:bg-[#1f3f6b] text-white px-4 h-9 text-sm"
                    >
                      Add Homework
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Onboarding Modal for First-Time Users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
    );
  }

export default MainApp;