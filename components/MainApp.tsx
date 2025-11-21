import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { OnboardingModal } from './OnboardingModal';
import { AddTestModal } from './AddTestModal';
import { Button } from '@/components/ui/button';
import { SplittingText } from './animate-ui/primitives/texts/splitting';

// Cookie utilities for persisting UI state
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  BookOpen,
  Calculator,
  Code,
  Globe,
  GraduationCap,
  Layers,
  Library,
  PenTool,
  Ruler,
  School,
  Atom,
  Award,
  Brain,
  Briefcase,
  Compass,
  Cpu,
  Database,
  FileText,
  Film,
  Gamepad2,
  GitBranch,
  Globe2,
  History,
  Image,
  Laptop,
  Lightbulb,
  Map,
  Mic2,
  Music,
  Palette,
  Pen,
  PieChart,
  Presentation,
  Rocket,
  Search,
  Settings,
  Shield,
  Smartphone,
  Speaker,
  Target,
  Terminal,
  TestTube,
  TrendingUp,
  Type,
  Video,
  Wifi,
  Zap,
  BookKey,
  BookLock,
  BookPlus,
  BookType,
  BookUp2,
  BookUser,
  BookX,
  BrainCircuit,
  BrainCog,
  CalendarCheck,
  CalendarDays,
  CalendarHeart,
  CalendarPlus,
  Camera,
  Cast,
  CheckSquare,
  Cloud,
  Code2,
  CreditCard,
  Crop,
  Crosshair,
  DollarSign,
  Download,
  Edit,
  FileArchive,
  FileAudio,
  FileCode,
  FileJson,
  FileVideo,
  FileVolume2,
  FileWarning,
  Filter,
  Flag,
  Folder,
  FolderOpen,
  Gift,
  GitCommit,
  Github,
  Gitlab,
  GitPullRequest,
  GitCompare,
  GitFork,
  GitMerge,
  GitPullRequestClosed,
  Gavel,
  GitGraph,
  GitCommitVertical,
  GitCompareArrows,
  GitBranchPlus,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  Book,
  MapPin,
  Pin,
  PinOff
} from "lucide-react";

import { motion, AnimatePresence } from 'framer-motion';

import { HomeworkLinkInput } from './HomeworkLinkInput';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import LevelDisplay from './LevelDisplay';
import { SubjectMastery } from './SubjectMastery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';
import { HomeworkPinList } from '@/components/HomeworkPinList';
import { RecurringOptions } from './RecurringOptions';
import { iconMap } from '@/lib/icon-map';
import { RecurringHomework, RecurringFrequency, Class, Homework, Test } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '../context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import { MarkTestAsTakenModal } from '@/components/MarkTestAsTakenModal';
import { ReindeerAnimation } from './ReindeerAnimation';
import { Snowfall } from './Snowfall';
import { StopAnimationsButton } from './StopAnimationsButton';

type LucideIconName = keyof typeof import('lucide-react');
type Priority = 'low' | 'medium' | 'high';

const MainApp = () => {
  const { user, full_name } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const { data: gamificationData } = useGamification();
  const {
    classes,
    homeworks,
    tests,
    loading,
    error,
    addClass,
    addHomework,
    addTest,
    addRecurringHomework,
    toggleHomework,
    togglePinHomework,
    deleteHomework,
    deleteClass,
    deleteTest,
    updateTest,
    markTestComplete
  } = useClassContext();
  const [isClient, setIsClient] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showPinHomeworkModal, setShowPinHomeworkModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassIcon, setNewClassIcon] = useState<LucideIconName>('BookOpen');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTest, setShowAddTest] = useState(false);
  const [showMarkTestAsTakenModal, setShowMarkTestAsTakenModal] = useState(false);
  const [testToMark, setTestToMark] = useState<{ id: string; title: string } | null>(null);
  const [areAnimationsPaused, setAreAnimationsPaused] = useState(true);

  const toggleAnimations = () => {
    setAreAnimationsPaused(prevState => !prevState);
  };

  // Initialize section visibility states from cookies with defaults
  const [showPinnedHomeworks, setShowPinnedHomeworks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showPinnedHomeworks');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [showClasses, setShowClasses] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showClasses');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [showTests, setShowTests] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showTests');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [showGamification, setShowGamification] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showGamification');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('expandedClasses');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [hasShownInitialNotifications, setHasShownInitialNotifications] = useState(false);

  // Test filtering state
  const [testFilter, setTestFilter] = useState<'all' | 'upcoming' | 'taken'>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('testFilter');
      return (saved as 'all' | 'upcoming' | 'taken') || 'all';
    }
    return 'all';
  });

  // Wrapper functions that save to cookies when state changes
  const handleTogglePinnedHomeworks = (newState: boolean) => {
    setShowPinnedHomeworks(newState);
    setCookie('showPinnedHomeworks', newState.toString());
  };

  const handleToggleClasses = (newState: boolean) => {
    setShowClasses(newState);
    setCookie('showClasses', newState.toString());
  };

  const handleToggleTests = (newState: boolean) => {
    setShowTests(newState);
    setCookie('showTests', newState.toString());
  };

  const handleToggleGamification = (newState: boolean) => {
    setShowGamification(newState);
    setCookie('showGamification', newState.toString());
  };

  // Wrapper functions for test filters that save to cookies
  const handleTestFilterChange = (value: 'all' | 'upcoming' | 'taken') => {
    setTestFilter(value);
    setCookie('testFilter', value);
  };

  const handleExpandedClassesChange = (newState: Record<string, boolean>) => {
    setExpandedClasses(newState);
    setCookie('expandedClasses', JSON.stringify(newState));
  };

  // Available icons with their display names
  const availableIcons = [
    { name: 'BookOpen', component: BookOpen, category: 'General' },
    { name: 'Book', component: Book, category: 'General' },
    { name: 'Calculator', component: Calculator, category: 'Math & Science' },
    { name: 'Code', component: Code, category: 'Computer Science' },
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

  // Show toast notifications for overdue assignments - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (!isClient || loading || homeworks.length === 0 || hasShownInitialNotifications) return;

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

      // Mark that we've shown initial notifications
      setHasShownInitialNotifications(true);
    }
  }, [isClient, loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

  // Show toast notifications for assignments due soon - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (!isClient || loading || homeworks.length === 0 || hasShownInitialNotifications) return;

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

      // Mark that we've shown initial notifications
      setHasShownInitialNotifications(true);
    }
  }, [isClient, loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

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
          recurringConfig,
          newHomework.description
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
          newHomework.links,
          newHomework.description
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

  const handleMarkTestAsTaken = async (score: number, maxScore: number, grade?: string) => {
    if (!testToMark) return;

    try {
      await markTestComplete(testToMark.id, score, maxScore, grade);
      success(
        `✅ ${testToMark.title} marked as taken!`,
        `Score: ${score}/${maxScore}${grade ? ` (${grade})` : ''}`
      );
      setShowMarkTestAsTakenModal(false);
      setTestToMark(null);
    } catch (error) {
      toastError('Failed to mark test as taken', 'Please try again');
      console.error('Error marking test as taken:', error);
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

  // Calculate next upcoming test and days until test
  const nextUpcomingTest = tests.length > 0
    ? tests
      .filter((test: Test) => test.status !== 'taken' && new Date(test.testDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a: Test, b: Test) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())[0]
    : null;

  const daysUntilNextTest = nextUpcomingTest
    ? Math.ceil((new Date(nextUpcomingTest.testDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Test filtering logic
  const filteredTests = tests.filter(test => {
    // Create date objects with consistent timezone (UTC)
    const testDate = new Date(test.testDate + 'T00:00:00');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    console.log('Test filtering:', {
      testTitle: test.title,
      testDate: test.testDate,
      testDateObj: testDate,
      today: today,
      isBeforeToday: testDate < today,
      isAfterOrEqualToday: testDate >= today,
      currentFilter: testFilter
    });

    switch (testFilter) {
      case 'upcoming':
        return testDate >= today; // Show tests from today onwards
      case 'taken':
        return testDate < today; // Show tests before today
      default:
        return true;
    }
  });

  console.log('Filtered tests count:', filteredTests.length, 'out of', tests.length);

  // Group tests by class
  const testsByClass = filteredTests.reduce((acc, test) => {
    const classId = test.classId;
    if (!acc[classId]) {
      acc[classId] = [];
    }
    acc[classId].push(test);
    return acc;
  }, {} as Record<string, typeof tests>);

  // Get class info for each class
  const classesWithTests = classes.filter(cls => testsByClass[cls.id]);

  // Test statistics
  const totalTests = tests.length;
  const upcomingTestsCount = tests.filter(test => test.status === 'upcoming');
  const takenTests = tests.filter(test => test.status === 'taken');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
      {!areAnimationsPaused && <Snowfall />}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome & Stats Section */}
        <div className="mb-10">
          <div className="relative text-left">
            <SplittingText
              text={`Welcome back, ${full_name || 'Student'}!`}
              aria-hidden="true"
              className="block text-4xl font-semibold text-neutral-200 dark:text-neutral-800"
              style={{ fontFamily: 'var(--font-header)' }}
              disableAnimation
            />
            <SplittingText
              text={`Welcome back, ${full_name || 'Student'}!`}
              className="block text-4xl font-semibold absolute inset-0"
              style={{ fontFamily: 'var(--font-header)' }}
              type="chars"
              alternateColors={['#ef4444', '#10b981']} // Red and Green colors
              inView
              initial={{ y: 0, opacity: 0, x: 0, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base text-left">Here's what's happening with your classes today</p>
        </div>

        {/* Stats Section - Compact Horizontal Layout */}
        <div
          className="rounded-2xl shadow-lg p-3 sm:p-4 mb-6 relative overflow-hidden bg-white/95 dark:bg-white/10 backdrop-blur-xl border border-gray-200/80 dark:border-white/18"
        >
          {/* Animated gradient orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10 dark:opacity-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600"
            style={{
              animation: 'float 8s ease-in-out infinite'
            }}
          />

          <style jsx>{`
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, -20px) scale(1.1); }
    }
  `}</style>

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Completion Rate */}
            <div className="group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 bg-gray-50/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-green-500/5 dark:from-emerald-400/10 dark:to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-emerald-500/20 dark:shadow-lg dark:shadow-emerald-500/30">
                  <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {homeworks.length > 0 ? Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Complete</p>
                </div>
              </div>
            </div>

            {/* Overdue Items */}
            <div className="group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 bg-gray-50/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-rose-500/5 dark:from-red-400/10 dark:to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 shadow-md shadow-red-500/20 dark:shadow-lg dark:shadow-red-500/30 relative">
                  <Clock className="h-4 w-4 text-white" strokeWidth={2.5} />
                  {homeworks.filter((hw: any) => {
                    const dueDate = new Date(hw.dueDate);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    return !hw.completed && dueDate < todayStart;
                  }).length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {homeworks.filter((hw: any) => {
                      const dueDate = new Date(hw.dueDate);
                      const todayStart = new Date();
                      todayStart.setHours(0, 0, 0, 0);
                      return !hw.completed && dueDate < todayStart;
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Overdue</p>
                </div>
              </div>
            </div>

            {/* Test Stats */}
            <div className="group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 bg-gray-50/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-500/30">
                  <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {tests.length > 0 ? tests.filter((test: Test) => test.status === 'upcoming').length : 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Tests</p>
                </div>
              </div>
            </div>

            {/* Next Deadline */}
            <div className="group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 bg-gray-50/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-amber-500/5 dark:from-orange-400/10 dark:to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/20 dark:shadow-lg dark:shadow-orange-500/30">
                  <CalendarIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  {nextDueHomework || nextUpcomingTest ? (
                    (() => {
                      const nextItem = nextDueHomework && nextUpcomingTest
                        ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                        : (nextDueHomework || nextUpcomingTest);

                      const isTest = nextItem === nextUpcomingTest;
                      const daysUntil = isTest ? daysUntilNextTest : daysUntilNextDue;

                      return (
                        <>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                            {daysUntil}<span className="text-sm text-gray-500 dark:text-white/60 ml-1">days</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Next {isTest ? 'Test' : 'Due'}</p>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">-</p>
                      <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Next Due</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Gamification Section - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <LevelDisplay />
          <SubjectMastery />
        </div>
        {/* Pinned Homeworks */}
        <div className="mb-10">
          <div
            className="flex justify-between items-center mb-4 cursor-pointer group"
            onClick={() => handleTogglePinnedHomeworks(!showPinnedHomeworks)}
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                Pinned Homeworks
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Quick access to your important assignments</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPinHomeworkModal(true);
                }}
                className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                title="Select homework to pin"
              >
                <Plus className="mr-2 h-4 w-4" />
                Pin Homework
              </Button>
              <div
                className={`p-2 rounded-lg transition-all duration-500 ${showPinnedHomeworks
                  ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                  : 'rotate-0 bg-gray-200 dark:bg-gray-700'
                  }`}
              >
                <ChevronRight className={`h-5 w-5 transition-colors ${showPinnedHomeworks ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`} />
              </div>
            </div>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${showPinnedHomeworks
              ? 'max-h-[2000px] opacity-100'
              : 'max-h-0 opacity-0'
              }`}
          >
            <HomeworkPinList
              triggerSelectModal={showPinHomeworkModal}
              onTriggerComplete={() => setShowPinHomeworkModal(false)}
            />
          </div>
        </div>

        {/* Classes Section */}
        <div className="mb-10">
          <div>
            <div
              className="mb-4 cursor-pointer group"
              onClick={() => handleToggleClasses(!showClasses)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                    My Classes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your classes and assignments</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddClass(true);
                    }}
                    className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Class
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddHomework(true);
                    }}
                    className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Homework
                  </Button>
                  <div
                    className={`p-2 rounded-lg transition-all duration-500 ${showClasses
                      ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                      : 'rotate-0 bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <ChevronRight className={`h-5 w-5 transition-colors ${showClasses ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out ${showClasses
                ? 'max-h-[1000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${showClasses
              ? 'max-h-[5000px] opacity-100'
              : 'max-h-0 opacity-0'
              }`}
          >
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
                  className="w-full bg-[#264f84] hover:bg-[#1f3f6b] text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
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
                      <div className="flex items-center w-full gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: getClassColor(index) }}
                        >
                          {(() => {
                            const IconComponent = iconMap[cls.icon as keyof typeof iconMap] ?? Book;
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                        </div>

                        <h3 className="flex-1 min-w-0 font-medium text-gray-900 dark:text-gray-100 truncate">
                          {cls.name}
                        </h3>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClass(cls.id);
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0"
                          aria-label="Delete class"
                        >
                          <Trash2 className="w-4 h-4" />
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
                                dueDateIcon: <CalendarIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />,
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
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: false })}
                                  className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                  Hide
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: true })}
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
        </div>

        {/* Tests Section - Comprehensive Management */}
        <div className="mb-12">
          <div className="mb-6">
            <div
              className="mb-4 cursor-pointer group"
              onClick={() => handleToggleTests(!showTests)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                    Tests & Exams
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your test schedule and study materials</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddTest(true);
                    }}
                    className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Test
                  </Button>
                  <div
                    className={`p-2 rounded-lg transition-all duration-500 ${showTests
                      ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                      : 'rotate-0 bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <ChevronRight className={`h-5 w-5 transition-colors ${showTests ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out ${showTests
                ? 'max-h-[5000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
              {/* Tests by Class */}
              {classesWithTests.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                    <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tests scheduled</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start by adding your first test to keep track of your exam schedule
                  </p>
                  <Button
                    onClick={() => setShowAddTest(true)}
                    className="bg-[#264f84] hover:bg-[#1f3f6b] text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Add Test
                  </Button>
                </div>
              ) : (
                <StatusGroupedTestList
                  tests={filteredTests}
                  classes={classes}
                  onDeleteTest={deleteTest}
                />
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {showAddClass && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Class
                  </h2>
                  <button
                    onClick={() => setShowAddClass(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Class Name Input */}
                  <div>
                    <Label htmlFor="className" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class Name
                    </Label>
                    <Input
                      id="className"
                      type="text"
                      value={newClassName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value)}
                      placeholder="e.g., Mathematics 101"
                      className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddClass()}
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose an Icon
                    </Label>

                    {/* Search Input */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                        autoComplete="off"
                      />
                    </div>

                    {/* Icon Grid */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                      <div className="max-h-64 overflow-y-auto">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                          <div key={category}>
                            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                              {category}
                            </div>
                            <div className="grid grid-cols-7 gap-1 p-2">
                              {icons.map(({ name, component: IconComponent }) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setNewClassIcon(name as LucideIconName);
                                    setSearchQuery('');
                                  }}
                                  className={`relative p-2.5 rounded-lg flex items-center justify-center transition-all ${newClassIcon === name
                                    ? 'bg-[#264f84] text-white scale-105 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                                    }`}
                                  title={name}
                                >
                                  <IconComponent className="h-5 w-5" />
                                  {newClassIcon === name && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {filteredIcons.length === 0 && (
                          <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              No icons found
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Try a different search term
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Icon Info */}
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Selected: <span className="font-medium text-gray-900 dark:text-white">{newClassIcon}</span>
                      </span>
                      <span>{filteredIcons.length} icons available</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddClass(false)}
                    className="h-10 px-4 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddClass}
                    disabled={!newClassName.trim()}
                    className="h-10 px-6 text-sm bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Class
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Add Homework Modal */}
        <AnimatePresence>
          {showAddHomework && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl z-10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Homework
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddHomework(false);
                      setIsRecurringEnabled(false);
                      setRecurringConfig({ frequency: 'weekly' });
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Title Input */}
                  <div>
                    <Label htmlFor="homeworkTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </Label>
                    <Input
                      id="homeworkTitle"
                      type="text"
                      value={newHomework.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHomework({ ...newHomework, title: e.target.value })}
                      placeholder="e.g., Chapter 5 Exercises"
                      className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <Label htmlFor="homeworkDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <textarea
                      id="homeworkDescription"
                      value={newHomework.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewHomework({ ...newHomework, description: e.target.value })}
                      placeholder="Add any additional details..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84] text-sm resize-none"
                    />
                  </div>

                  {/* Due Date and Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#264f84] rounded-lg"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {format(newHomework.dueDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <Calendar
                            mode="single"
                            selected={newHomework.dueDate}
                            onSelect={(date) => date && setNewHomework({ ...newHomework, dueDate: date })}
                            initialFocus
                            className="text-gray-900 dark:text-white rounded-xl"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </Label>
                      <Select
                        value={newHomework.priority}
                        onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as Priority })}
                      >
                        <SelectTrigger className="w-full !h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                          <SelectItem value="low" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Low</SelectItem>
                          <SelectItem value="medium" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Medium</SelectItem>
                          <SelectItem value="high" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Class Selection */}
                  <div>
                    <Label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class
                    </Label>
                    <Select
                      value={newHomework.classId}
                      onValueChange={(value) => setNewHomework({ ...newHomework, classId: value })}
                    >
                      <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                        {classes.map((cls: any) => (
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg"
                          >
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recurring Homework Section */}
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="recurringHomework"
                        checked={isRecurringEnabled}
                        onCheckedChange={(checked) => setIsRecurringEnabled(checked as boolean)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-[#264f84] data-[state=checked]:bg-[#264f84] data-[state=checked]:border-[#264f84] hover:border-[#264f84]"
                      />
                      <Label
                        htmlFor="recurringHomework"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                      >
                        Make this a recurring homework
                      </Label>
                    </div>

                    {isRecurringEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RecurringOptions
                          recurring={recurringConfig}
                          onChange={setRecurringConfig}
                        />
                      </motion.div>
                    )}

                    <HomeworkLinkInput
                      links={newHomework.links}
                      onChange={(links) => setNewHomework({ ...newHomework, links })}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddHomework(false);
                      setIsRecurringEnabled(false);
                      setRecurringConfig({ frequency: 'weekly' });
                    }}
                    className="h-10 px-4 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddHomework}
                    disabled={!newHomework.title.trim() || !newHomework.classId}
                    className="h-10 px-6 text-sm bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Homework
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Add Test Modal */}
        <AnimatePresence>
          {showAddTest && (
            <AddTestModal isOpen={showAddTest} onClose={() => setShowAddTest(false)} />
          )}
        </AnimatePresence>

        {/* Mark Test as Taken Modal */}
        <AnimatePresence>
          {showMarkTestAsTakenModal && testToMark && (
            <MarkTestAsTakenModal
              isOpen={showMarkTestAsTakenModal}
              onClose={() => {
                setShowMarkTestAsTakenModal(false);
                setTestToMark(null);
              }}
              onSubmit={handleMarkTestAsTaken}
              testTitle={testToMark.title}
            />
          )}
        </AnimatePresence>
      </main>
      {!areAnimationsPaused && <ReindeerAnimation />}
      <StopAnimationsButton areAnimationsPaused={areAnimationsPaused} onToggle={toggleAnimations} />
    </div>
  );
}

export default MainApp;