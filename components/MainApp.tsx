import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Facehash } from 'facehash';
import { format } from 'date-fns';
import { OnboardingModal } from './OnboardingModal';
import { AddTestModal } from './AddTestModal';
import { TestDetailModal } from './TestDetailModal';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { SplittingText } from './animate-ui/primitives/texts/splitting';
import { useWideLayout } from '@/hooks/use-wide-layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  Archive,
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
  PinOff,
  Dumbbell,
  Music2,
  Languages,
  FlaskConical,
  Microscope,
  Sigma,
  Variable,
  FunctionSquare,
  Binary,
  Heart,
  Stethoscope,
  Dna,
  Landmark,
  Mountain,
  Telescope,
  Microchip,
  CircuitBoard,
  Brush,
  Theater,
  Quote,
  Shapes,
  Gamepad,
  Music4,
  Coffee,
  Sun,
  Moon,
  Star,
  ZapOff,
  ArrowRight
} from "lucide-react";

import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

import { HomeworkLinkInput } from './HomeworkLinkInput';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { SubjectMastery } from './SubjectMastery';
import { MiniCalendar } from './MiniCalendar';
import { ComingUp } from './ComingUp';
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
import { iconMap, IconName } from '@/lib/icon-map';
import { RecurringHomework, RecurringFrequency, Class, Homework, Test } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '../context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import { MarkTestAsTakenModal } from '@/components/MarkTestAsTakenModal';
import EnhancedTestCard from '@/components/EnhancedTestCard';

type LucideIconName = IconName;
type Priority = 'low' | 'medium' | 'high';

const MainApp = () => {
  const { user, full_name } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const { data: gamificationData, addXP } = useGamification();
  const { getContainerClass } = useWideLayout();
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
    deleteClass,
    deleteHomework,
    deleteRecurringSeries,
    deleteTest,
    updateHomeworkDueDate,
    updateTestDueDate,
    markTestComplete
  } = useClassContext();

  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showPinHomeworkModal, setShowPinHomeworkModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassIcon, setNewClassIcon] = useState<LucideIconName>('BookOpen');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTest, setShowAddTest] = useState(false);
  const [showMarkTestAsTakenModal, setShowMarkTestAsTakenModal] = useState(false);
  const [testToMark, setTestToMark] = useState<Test | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isTestDetailModalOpen, setIsTestDetailModalOpen] = useState(false);
  const [classIdForAddTest, setClassIdForAddTest] = useState<string | undefined>(undefined);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);

  // Initialize section visibility states from cookies with defaults
  const [showPinnedHomeworks, setShowPinnedHomeworks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showPinnedHomeworks');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [showTestsInClassCards, setShowTestsInClassCards] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showTestsInClassCards');
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









  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('expandedClasses');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Track which classes are showing archived homework
  const [showArchivedForClass, setShowArchivedForClass] = useState<Record<string, boolean>>({});

  // Helper function to determine if homework is archived (completed and due date was more than 7 days ago)
  const isHomeworkArchived = useCallback((hw: any): boolean => {
    if (!hw.completed) return false;
    const dueDate = new Date(hw.dueDate);
    const now = new Date();
    const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDue >= 7;
  }, []);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    isRecurring: boolean;
    recurringId?: string;
  } | null>(null);

  const [hasShownInitialNotifications, setHasShownInitialNotifications] = useState(false);

  // Test filtering state
  const [testFilter, setTestFilter] = useState<'all' | 'upcoming' | 'taken'>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('testFilter');
      return (saved as 'all' | 'upcoming' | 'taken') || 'all';
    }
    return 'all';
  });

  // Section order state - Reordering disabled
  type SectionId = 'pinned' | 'classes' | 'tests';
  const sectionOrder: SectionId[] = ['pinned', 'classes', 'tests'];

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





  // Wrapper functions for test filters that save to cookies
  const handleTestFilterChange = (value: 'all' | 'upcoming' | 'taken') => {
    setTestFilter(value);
    setCookie('testFilter', value);
  };

  const handleExpandedClassesChange = (newState: Record<string, boolean>) => {
    setExpandedClasses(newState);
    setCookie('expandedClasses', JSON.stringify(newState));
  };

  // Available icons with their display names and semantic tags
  const availableIcons = useMemo(() => [
    { name: 'BookOpen', component: BookOpen, category: 'General', tags: ['reading', 'study', 'learning', 'education', 'homework', 'textbook'] },
    { name: 'Book', component: Book, category: 'General', tags: ['reading', 'note', 'subject', 'library'] },
    { name: 'Calculator', component: Calculator, category: 'Math & Science', tags: ['math', 'numbers', 'statistics', 'accounting', 'arithmetic'] },
    { name: 'Code', component: Code, category: 'Computer Science', tags: ['programming', 'coding', 'software', 'development', 'it', 'tech', 'web'] },
    { name: 'GraduationCap', component: GraduationCap, category: 'General', tags: ['degree', 'graduation', 'success', 'school', 'university', 'academic'] },
    { name: 'Languages', component: Languages, category: 'Languages', tags: ['translation', 'foreign', 'speech', 'communication', 'global', 'linguistics'] },
    { name: 'Dumbbell', component: Dumbbell, category: 'Fitness', tags: ['gym', 'pe', 'sports', 'health', 'exercise', 'physical', 'training'] },
    { name: 'Microscope', component: Microscope, category: 'Science', tags: ['lab', 'biology', 'research', 'experiment', 'medicine', 'investigation'] },
    { name: 'FlaskConical', component: FlaskConical, category: 'Science', tags: ['chemistry', 'science', 'lab', 'experiment', 'liquid'] },
    { name: 'Atom', component: Atom, category: 'Science', tags: ['physics', 'science', 'energy', 'nuclear', 'lab', 'quantum'] },
    { name: 'Sigma', component: Sigma, category: 'Math', tags: ['math', 'sum', 'calculation', 'advanced', 'greek', 'formulas'] },
    { name: 'Variable', component: Variable, category: 'Math', tags: ['algebra', 'math', 'equation', 'letters', 'x', 'y'] },
    { name: 'Binary', component: Binary, category: 'Computer Science', tags: ['data', 'it', 'low-level', 'coding', '01'] },
    { name: 'Palette', component: Palette, category: 'Art', tags: ['design', 'painting', 'drawing', 'creativity', 'color', 'arts'] },
    { name: 'Brush', component: Brush, category: 'Art', tags: ['painting', 'design', 'drawing', 'art'] },
    { name: 'Theater', component: Theater, category: 'Art', tags: ['drama', 'acting', 'performance', 'stage', 'play', 'arts'] },
    { name: 'Music2', component: Music2, category: 'Music', tags: ['notes', 'melody', 'audio', 'song', 'music'] },
    { name: 'Music4', component: Music4, category: 'Music', tags: ['instruments', 'notes', 'rhythm', 'band', 'orchestra'] },
    { name: 'Globe2', component: Globe2, category: 'Geography', tags: ['world', 'earth', 'travel', 'social studies', 'geography'] },
    { name: 'History', component: History, category: 'History', tags: ['past', 'time', 'museum', 'tradition', 'historical'] },
    { name: 'Landmark', component: Landmark, category: 'History', tags: ['government', 'politics', 'museum', 'architecture', 'civics'] },
    { name: 'Briefcase', component: Briefcase, category: 'Business', tags: ['work', 'professional', 'career', 'management', 'economics'] },
    { name: 'Stethoscope', component: Stethoscope, category: 'Science', tags: ['medicine', 'doctor', 'health', 'hospital', 'nursing'] },
    { name: 'Telescope', component: Telescope, category: 'Science', tags: ['astronomy', 'space', 'ufo', 'research', 'stars'] },
    { name: 'Mountain', component: Mountain, category: 'Geography', tags: ['nature', 'outdoors', 'environment', 'climbing', 'earth'] },
    { name: 'Star', component: Star, category: 'General', tags: ['favorite', 'important', 'success', 'brilliant', 'rating'] },
    { name: 'Heart', component: Heart, category: 'General', tags: ['love', 'passion', 'biology', 'empathy', 'health'] },
    { name: 'Quote', component: Quote, category: 'Languages', tags: ['literature', 'writing', 'english', 'speech', 'referencing'] },
    { name: 'Shapes', component: Shapes, category: 'Math', tags: ['geometry', 'basics', 'design', 'patterns'] },
    { name: 'Gamepad', component: Gamepad, category: 'Gaming', tags: ['fun', 'play', 'video games', 'leisure'] },
    { name: 'Coffee', component: Coffee, category: 'General', tags: ['energy', 'break', 'morning', 'cafe', 'teacher'] },
    { name: 'School', component: School, category: 'General', tags: ['building', 'education', 'campus'] },
    { name: 'Award', component: Award, category: 'General', tags: ['trophy', 'prize', 'achievement', 'win'] },
    { name: 'Brain', component: Brain, category: 'Science', tags: ['psychology', 'mind', 'intellect', 'thinking'] },
    { name: 'Compass', component: Compass, category: 'Geography', tags: ['direction', 'map', 'navigation'] },
    { name: 'Cpu', component: Cpu, category: 'Computer Science', tags: ['hardware', 'processor', 'tech'] },
    { name: 'Database', component: Database, category: 'Computer Science', tags: ['storage', 'data', 'backend'] },
    { name: 'FileText', component: FileText, category: 'General', tags: ['document', 'writing', 'assignment'] },
    { name: 'Film', component: Film, category: 'Media', tags: ['video', 'cinema', 'movie'] },
    { name: 'Gamepad2', component: Gamepad2, category: 'Gaming', tags: ['fun', 'play', 'video games'] },
    { name: 'GitBranch', component: GitBranch, category: 'Computer Science', tags: ['coding', 'version control', 'tech'] },
    { name: 'Image', component: Image, category: 'Art', tags: ['picture', 'photo', 'design'] },
    { name: 'Laptop', component: Laptop, category: 'Computer Science', tags: ['computer', 'work', 'it'] },
    { name: 'Lightbulb', component: Lightbulb, category: 'General', tags: ['idea', 'innovation', 'thought'] },
    { name: 'Map', component: Map, category: 'Geography', tags: ['navigation', 'places', 'travel'] },
    { name: 'Mic2', component: Mic2, category: 'Languages', tags: ['speech', 'recording', 'audio'] },
    { name: 'Music', component: Music, category: 'Music', tags: ['sound', 'audio', 'song'] },
    { name: 'Pen', component: Pen, category: 'General', tags: ['writing', 'note', 'draw'] },
    { name: 'PieChart', component: PieChart, category: 'Math', tags: ['data', 'statistics', 'graph'] },
    { name: 'Presentation', component: Presentation, category: 'General', tags: ['slides', 'lecture', 'teaching'] },
    { name: 'Rocket', component: Rocket, category: 'Science', tags: ['space', 'launch', 'speed'] },
    { name: 'Search', component: Search, category: 'General', tags: ['find', 'lookup', 'research'] },
    { name: 'Settings', component: Settings, category: 'General', tags: ['config', 'options', 'tools'] },
    { name: 'Shield', component: Shield, category: 'General', tags: ['security', 'protection', 'safety'] },
    { name: 'Smartphone', component: Smartphone, category: 'Technology', tags: ['mobile', 'phone', 'app'] },
    { name: 'Speaker', component: Speaker, category: 'Languages', tags: ['audio', 'sound', 'announcement'] },
    { name: 'Target', component: Target, category: 'General', tags: ['goal', 'focus', 'objective'] },
    { name: 'Terminal', component: Terminal, category: 'Computer Science', tags: ['coding', 'cli', 'tech'] },
    { name: 'TrendingUp', component: TrendingUp, category: 'Business', tags: ['growth', 'stats', 'finance'] },
    { name: 'Type', component: Type, category: 'Languages', tags: ['font', 'text', 'writing'] },
    { name: 'Video', component: Video, category: 'Media', tags: ['record', 'camera', 'cinema'] },
    { name: 'Wifi', component: Wifi, category: 'Technology', tags: ['internet', 'connection', 'online'] },
    { name: 'Zap', component: Zap, category: 'General', tags: ['energy', 'quick', 'flash'] }
  ], []);

  // Filter icons based on search query with semantic tag support
  const filteredIcons = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    if (!lowerQuery) return availableIcons;

    return availableIcons.filter(icon =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.category.toLowerCase().includes(lowerQuery) ||
      icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery, availableIcons]);

  // Group icons by category
  const groupedIcons = useMemo(() => {
    return filteredIcons.reduce((acc, icon) => {
      if (!acc[icon.category]) {
        acc[icon.category] = [];
      }
      acc[icon.category].push(icon);
      return acc;
    }, {} as Record<string, typeof availableIcons>);
  }, [filteredIcons]);

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

  const [isSuggestingIcons, setIsSuggestingIcons] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const handleAISuggest = useCallback(async () => {
    if (!newClassName.trim()) return;
    setIsSuggestingIcons(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on the school class name "${newClassName}", identify the 6 most relevant Lucide icon names from this list: ${availableIcons.map(i => i.name).join(', ')}. Return ONLY a JSON array of strings. No explanation.`,
          action: 'generate',
          model: 'gemini-2.5-flash-lite'
        })
      });

      const reader = response.body?.getReader();
      let text = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.response) text += data.response;
              } catch (e) { }
            }
          }
        }
      }

      const match = text.match(/\[.*\]/s);
      if (match) {
        const iconNames = JSON.parse(match[0]);
        const suggestions = availableIcons.filter(icon =>
          iconNames.some((name: string) => name.toLowerCase() === icon.name.toLowerCase())
        );
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('AI Suggestion error:', error);
    } finally {
      setIsSuggestingIcons(false);
    }
  }, [newClassName, availableIcons]);

  // Auto-suggest icons when class name changes
  useEffect(() => {
    if (newClassName.trim().length < 3) {
      if (aiSuggestions.length > 0) setAiSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      handleAISuggest();
    }, 1000);
    return () => clearTimeout(timer);
  }, [newClassName, handleAISuggest]);



  // Auto-show onboarding modal for users with no classes
  useEffect(() => {
    if (user && classes.length === 0 && !loading) {
      setShowOnboarding(true);
    }
  }, [user, classes.length, loading]);

  // Show toast notifications for overdue assignments - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (loading || homeworks.length === 0 || hasShownInitialNotifications) return;

    // Delay toast notifications so the page UI can settle first (dock, animations, etc.)
    const delayTimer = setTimeout(() => {
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
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, [loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

  // Show toast notifications for assignments due soon - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (loading || homeworks.length === 0 || hasShownInitialNotifications) return;

    // Delay toast notifications so the page UI can settle first
    const delayTimer = setTimeout(() => {
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
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, [loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

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

      success(
        `✅ ${homework.title} completed!`,
        `Great job on your ${className} assignment!`
      );
    }
  }, [homeworks, classes, toggleHomework, gamificationData, success]);

  // Handle delete confirmation for recurring homework
  const handleDeleteClick = (homeworkId: string, title: string, isRecurring: boolean, recurringId?: string) => {
    if (isRecurring || recurringId) {
      setDeleteConfirm({
        id: homeworkId,
        title,
        isRecurring: true,
        recurringId
      });
    } else {
      // Regular homework - delete immediately
      deleteHomework(homeworkId);
    }
  };

  const handleDeleteConfirm = async (deleteSeries: boolean) => {
    if (!deleteConfirm) return;

    try {
      if (deleteSeries && deleteConfirm.recurringId) {
        // Delete entire recurring series
        await deleteRecurringSeries(deleteConfirm.recurringId);
      } else {
        // Delete just this instance
        await deleteHomework(deleteConfirm.id);
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };



  // Award XP for existing completed tests on component mount
  useEffect(() => {
    const awardXpForCompletedTests = () => {
      const completedTests = tests.filter(test =>
        test.status?.toLowerCase() === 'completed' ||
        test.status?.toLowerCase() === 'taken' ||
        (test.score !== null && test.score !== undefined)
      );

      completedTests.forEach(test => {
        if (test.score && test.maxScore) {
          const percentageScore = (test.score / test.maxScore) * 100;
          let xpEarned = 50; // Base XP for completing any test

          // Bonus XP for good performance
          if (percentageScore >= 90) {
            xpEarned += 30; // Excellent performance
          } else if (percentageScore >= 80) {
            xpEarned += 20; // Great performance
          } else if (percentageScore >= 70) {
            xpEarned += 10; // Good performance
          } else if (percentageScore >= 60) {
            xpEarned += 5; // Passing performance
          }

          // Extra bonus for perfect scores
          if (test.score === test.maxScore) {
            xpEarned += 15;
          }

          // Bonus XP for high-stakes tests
          if (test.testType?.toLowerCase() === 'exam') {
            xpEarned += 10;
          } else if (test.testType?.toLowerCase() === 'alpha') {
            xpEarned += 5;
          }

          // Award the XP
          const testClass = classes.find(c => c.id === test.classId);
          addXP(xpEarned, test.classId, testClass?.name);
        }
      });
    };

    // Only run if we have tests and classes loaded
    if (tests.length > 0 && classes.length > 0 && !loading) {
      awardXpForCompletedTests();
    }
  }, [tests, classes, loading, addXP]);

  // Color mapping for class icons
  const classColors = {
    red: '#C53030',    // red-700
    blue: '#2B6CB0',   // blue-700
    yellow: '#C2410C', // orange-700
    green: '#2F855A',  // green-700
    purple: '#6B46C1', // purple-700
    pink: '#B83280',   // pink-700
    teal: '#285E61',   // teal-800
    gray: '#2D3748'    // gray-700
  };

  const headerColors = {
    red: '#9B2C2C',    // red-800
    blue: '#2A4365',   // blue-900
    yellow: '#9A3412', // orange-800
    green: '#22543D',  // green-800
    purple: '#44337A', // purple-800
    pink: '#82274A',   // pink-800
    teal: '#1D4044',   // teal-900
    gray: '#1A202C'    // gray-900
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
  const getClassColor = useCallback((index: number) => {
    const colors = Object.values(classColors);
    return colors[index % colors.length];
  }, []);

  const getHeaderColor = useCallback((index: number) => {
    const colors = Object.values(headerColors);
    return colors[index % colors.length];
  }, []);

  // Memoize the processed class data to prevent re-renders
  const processedClasses = useMemo(() => {
    return classes.map((cls: any, index: number) => {
      const classTests = tests.filter((t: any) => {
        const testDate = new Date(t.testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.classId === cls.id && t.status !== 'taken' && t.status !== 'completed' && testDate >= today;
      });

      // Get all homeworks for this class
      const allClassHomeworks = homeworks
        .filter((hw: any) => hw.classId === cls.id)
        .filter((hw: any) => hw.is_recurring_instance === true || hw.recurring_id == null);

      // Separate active and archived homeworks
      const activeHomeworks = allClassHomeworks.filter((hw: any) => !isHomeworkArchived(hw));
      const archivedHomeworks = allClassHomeworks.filter((hw: any) => isHomeworkArchived(hw));

      const mapHomework = (hw: any) => ({
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
        onDeleteSeries: (hw.recurring_id || hw.parent_recurring_id) ? () => deleteRecurringSeries(hw.recurring_id || hw.parent_recurring_id) : undefined,
        className: cls.name,
        pinned: hw.pinned || false,
        recurring: hw.recurring_frequency ? true : undefined as any,
        isRecurringInstance: hw.is_recurring_instance || false,
        parentRecurringId: hw.parent_recurring_id || undefined,
        recurringFrequency: hw.recurring_frequency || undefined,
        isArchived: isHomeworkArchived(hw),
      });

      const classHomeworks = activeHomeworks
        .sort((a: any, b: any) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .map(mapHomework);

      const classArchivedHomeworks = archivedHomeworks
        .sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .map(mapHomework);

      return {
        ...cls,
        classTests,
        classHomeworks,
        classArchivedHomeworks,
        index
      };
    });
  }, [classes, homeworks, tests, getClassColor, isHomeworkArchived]);

  // Memoized: overdue homework count (used in stats section)
  const overdueCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return homeworks.filter((hw: any) => !hw.completed && new Date(hw.dueDate) < todayStart).length;
  }, [homeworks]);

  // Memoized: next due homework and days until due
  const { nextDueHomework, daysUntilNextDue } = useMemo(() => {
    if (homeworks.length === 0) return { nextDueHomework: null, daysUntilNextDue: null };
    const now = new Date();
    const next = homeworks
      .filter((hw: any) => !hw.completed && new Date(hw.dueDate) > now)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] || null;
    const days = next
      ? Math.ceil((new Date(next.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { nextDueHomework: next, daysUntilNextDue: days };
  }, [homeworks]);

  // Memoized: next upcoming test and days until test
  const { nextUpcomingTest, daysUntilNextTest } = useMemo(() => {
    if (tests.length === 0) return { nextUpcomingTest: null, daysUntilNextTest: null };
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const next = tests
      .filter((test: Test) => test.status !== 'taken' && new Date(test.testDate) >= todayStart)
      .sort((a: Test, b: Test) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())[0] || null;
    const days = next
      ? Math.ceil((new Date(next.testDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { nextUpcomingTest: next, daysUntilNextTest: days };
  }, [tests]);

  // Memoized: test filtering logic
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const testDate = new Date(test.testDate + 'T00:00:00');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      switch (testFilter) {
        case 'upcoming':
          return testDate >= today;
        case 'taken':
          return testDate < today;
        default:
          return true;
      }
    });
  }, [tests, testFilter]);

  // Memoized: group tests by class
  const testsByClass = useMemo(() => {
    return filteredTests.reduce((acc, test) => {
      const classId = test.classId;
      if (!acc[classId]) {
        acc[classId] = [];
      }
      acc[classId].push(test);
      return acc;
    }, {} as Record<string, typeof tests>);
  }, [filteredTests]);

  // Memoized: classes that have tests
  const classesWithTests = useMemo(() => classes.filter(cls => testsByClass[cls.id]), [classes, testsByClass]);

  // Memoized: test statistics
  const { totalTests, upcomingTestsCount, takenTests } = useMemo(() => ({
    totalTests: tests.length,
    upcomingTestsCount: tests.filter(test => test.status === 'upcoming'),
    takenTests: tests.filter(test => test.status === 'taken'),
  }), [tests]);



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

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsTestDetailModalOpen(true);
  };

  const handleMarkTestAsTaken = async (score: number, maxScore: number, grade?: string) => {
    if (!testToMark) return;

    try {
      await markTestComplete(testToMark.id, score, maxScore, grade);

      // Calculate XP based on test performance
      const percentageScore = (score / maxScore) * 100;
      let xpEarned = 50; // Base XP for completing any test

      // Bonus XP for good performance
      if (percentageScore >= 90) {
        xpEarned += 30; // Excellent performance
      } else if (percentageScore >= 80) {
        xpEarned += 20; // Great performance
      } else if (percentageScore >= 70) {
        xpEarned += 10; // Good performance
      } else if (percentageScore >= 60) {
        xpEarned += 5; // Passing performance
      }

      // Extra bonus for perfect scores
      if (score === maxScore) {
        xpEarned += 15;
      }

      // Bonus XP for high-stakes tests
      if (testToMark.testType?.toLowerCase() === 'exam') {
        xpEarned += 10;
      } else if (testToMark.testType?.toLowerCase() === 'alpha') {
        xpEarned += 5;
      }

      // Award the XP
      const testClass = classes.find(c => c.id === testToMark.classId);
      addXP(xpEarned, testToMark.classId, testClass?.name);

      success(
        `✅ ${testToMark.title} marked as taken!`,
        `Score: ${score}/${maxScore}${grade ? ` (${grade})` : ''} | +${xpEarned} XP 🎯`
      );
      setShowMarkTestAsTakenModal(false);
      setTestToMark(null);
    } catch (error) {
      toastError('Failed to mark test as taken', 'Please try again');
      console.error('Error marking test as taken:', error);
    }
  };







  // Function to render each section based on ID
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {


      case 'classes':
        const effectivelyShowClasses = showTestsInClassCards || showClasses;
        return (
          <div key="classes" className="mt-8 mb-10" data-tour="classes">
            <div>
              <div
                className={`mb-3 group ${!showTestsInClassCards ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={!showTestsInClassCards ? () => handleToggleClasses(!showClasses) : undefined}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                        My Classes
                      </h2>
                    </div>
                    {!showTestsInClassCards && (
                      <div
                        className={`p-2 rounded-lg transition-all duration-500 md:hidden ${showClasses
                          ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                          : 'rotate-0 bg-gray-100 dark:bg-gray-900'
                          }`}
                      >
                        <ChevronRight className={`h-5 w-5 transition-colors ${showClasses ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Nav-pill style action buttons */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddClass(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white hover:text-white/80 rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Class
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddHomework(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white hover:text-white/80 rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Homework
                      </button>
                      {showTestsInClassCards && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddTest(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white hover:text-white/80 rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Test
                        </button>
                      )}
                    </div>
                    {!showTestsInClassCards && (
                      <Button
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClasses(!showClasses);
                        }}
                        className={`p-2 rounded-lg duration-500 hidden md:block ${showClasses
                          ? 'bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-400'
                          }`}
                      >
                        <ChevronRight className={`h-5 w-5 transition-transform ${showClasses ? 'rotate-90' : 'rotate-0'}`} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${effectivelyShowClasses
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out ${effectivelyShowClasses
                ? 'max-h-[5000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
              {classes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-950 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                    <Layers className="h-6 w-6 text-[#6B7280] dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-light text-[#111827] dark:text-white mb-2 tracking-tight">No classes yet</h3>
                  <p className="text-[#6B7280] dark:text-gray-400 max-w-xs mx-auto text-sm">
                    Get started by adding your first class to organize your schoolwork.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">




                  {processedClasses.map((cls: any) => {
                    const { classHomeworks, classArchivedHomeworks, classTests, index } = cls;
                    const visibleHomeworks = expandedClasses[cls.id] ? classHomeworks : classHomeworks.slice(0, 3);
                    const hasTests = classTests.length > 0 && showTestsInClassCards;
                    const hasHomework = classHomeworks.length > 0;
                    const hasArchivedHomework = classArchivedHomeworks.length > 0;
                    const isShowingArchived = showArchivedForClass[cls.id] || false;

                    // Check if this class has overdue homework
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const hasOverdueHomework = classHomeworks.some((hw: any) => !hw.completed && new Date(hw.subtext) < todayStart);

                    return (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                        className={`group rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-500 border bg-white dark:bg-gray-900 ${showFrowny && hasOverdueHomework
                          ? 'border-red-300 dark:border-red-500/40 shadow-red-100 dark:shadow-red-900/20 shadow-md'
                          : 'border-gray-200/70 dark:border-white/5'
                          }`}

                      >
                        <div
                          className="p-3 mb-3 rounded-xl transition-colors duration-500"
                          style={{ backgroundColor: `${getClassColor(index)}12` }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center w-full gap-3">
                              <div className="shrink-0 transition-transform group-hover:scale-110 duration-500">
                                {(() => {
                                  const IconComponent = iconMap[cls.icon as keyof typeof iconMap] ?? BookOpen;
                                  return <IconComponent className="w-6 h-6" style={{ color: getHeaderColor(index) }} />;
                                })()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className="text-base font-bold truncate tracking-tight uppercase"
                                  style={{ color: getHeaderColor(index) }}
                                >
                                  {cls.name}
                                </h3>
                                {!hasHomework && !hasTests && !hasArchivedHomework && (
                                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                                    0 assignments
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClassToDelete({ id: cls.id, name: cls.name });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0"
                                aria-label="Delete class"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 mt-1">
                          <PlayfulHomeworkList
                            items={classHomeworks.slice(0, 3)}
                            onItemToggle={handleHomeworkToggle}
                            onPinToggle={togglePinHomework}
                            className="space-y-1.5"
                          />

                          <AnimatePresence>
                            {expandedClasses[cls.id] && classHomeworks.length > 3 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: 'hidden' }}
                              >
                                <PlayfulHomeworkList
                                  items={classHomeworks.slice(3)}
                                  onItemToggle={handleHomeworkToggle}
                                  onPinToggle={togglePinHomework}
                                  className="space-y-1.5 pt-1.5"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {hasTests && (
                            <>
                              {hasHomework && (
                                <div className="flex items-center gap-3 my-3">
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                                  <span className="text-[12px] uppercase font-bold text-gray-400 tracking-wider">Upcoming Tests</span>
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                                </div>
                              )}
                              <div className="space-y-1">
                                {classTests.map((test: any) => (
                                  <EnhancedTestCard
                                    key={test.id}
                                    test={test}
                                    classIcon={iconMap[cls.icon as keyof typeof iconMap] || BookOpen}
                                    variant="list-item"
                                    onClick={() => handleTestClick(test)}
                                    className="hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg -mx-2 px-2"
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {classHomeworks.length > 3 && (
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
                                  +{classHomeworks.length - 3} more assignments
                                </button>
                              )}
                            </div>
                          )}



                          {/* Show archived homework option when no active homework but has archived */}
                          {!hasHomework && hasArchivedHomework && !isShowingArchived && (
                            <div className="text-center py-2">
                              <button
                                onClick={() => setShowArchivedForClass(prev => ({ ...prev, [cls.id]: true }))}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                View {classArchivedHomeworks.length} archived assignment{classArchivedHomeworks.length > 1 ? 's' : ''}
                              </button>
                            </div>
                          )}

                          {/* Archived homework section */}
                          <AnimatePresence>
                            {isShowingArchived && hasArchivedHomework && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="flex items-center gap-3 my-3">
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                                  <span className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                                    <Archive className="w-3 h-3" />
                                    Archived
                                  </span>
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <PlayfulHomeworkList
                                  items={classArchivedHomeworks}
                                  onItemToggle={handleHomeworkToggle}
                                  onPinToggle={togglePinHomework}
                                  className="space-y-2 opacity-60"
                                />
                                <div className="text-center pt-2">
                                  <button
                                    onClick={() => setShowArchivedForClass(prev => ({ ...prev, [cls.id]: false }))}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  >
                                    Hide archived
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'tests':
        if (showTestsInClassCards) return null;
        return (
          <div key="tests" className="mb-12">
            <div className="mb-6">
              <div
                className="mb-4 cursor-pointer group"
                onClick={() => handleToggleTests(!showTests)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-[#111827] dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                        Tests & Exams
                      </h2>
                      <p className="text-[#6B7280] dark:text-gray-400 text-xs sm:text-sm">Manage your test schedule and study materials</p>
                    </div>
                    <div
                      className={`p-2 rounded-lg transition-all duration-500 md:hidden ${showTests
                        ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                        : 'rotate-0 bg-gray-100 dark:bg-gray-900'
                        }`}
                    >
                      <ChevronRight className={`h-5 w-5 transition-colors ${showTests ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddTest(true);
                      }}
                      className="rounded-lg bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-medium uppercase tracking-tight px-4"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Test
                    </Button>
                    <Button
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTests(!showTests);
                      }}
                      className={`p-2 rounded-lg duration-500 hidden md:block ${showTests
                        ? 'bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      <ChevronRight className={`h-5 w-5 transition-transform ${showTests ? 'rotate-90' : 'rotate-0'}`} />
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${showTests
                  ? 'max-h-[5000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
                {/* Tests by Class */}
                {classesWithTests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-950 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                      <CalendarIcon className="h-6 w-6 text-[#6B7280] dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-light text-[#111827] dark:text-white mb-2 tracking-tight">No tests scheduled</h3>
                    <p className="text-[#6B7280] dark:text-gray-400 max-w-xs mx-auto text-sm">
                      Start by adding your first test to keep track of your exam schedule
                    </p>
                  </motion.div>
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
        );

      default:
        return null;
    }
  };

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Burning the Midnight Oil' };
    if (hour < 12) return { text: 'Good Morning' };
    if (hour < 17) return { text: 'Good Afternoon' };
    if (hour < 21) return { text: 'Good Evening' };
    return { text: 'Late Night Grind' };
  }, []);

  // ─── Facehash Joke Feature ──────────────────────────────────────────────────
  const [joke, setJoke] = useState<string | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);
  const jokeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchJoke = useCallback(async () => {
    if (jokeLoading) return;
    setJokeLoading(true);
    try {
      const res = await fetch('https://icanhazdadjoke.com/', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      setJoke(data.joke);
      // Auto-dismiss after 8 seconds
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } catch {
      setJoke("Why did the student eat their homework? Because their teacher said it was a piece of cake!");
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } finally {
      setJokeLoading(false);
    }
  }, [jokeLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
    };
  }, []);

  // ─── Facehash "Overdue Peek" Animation ──────────────────────────────────────
  const facehashRef = React.useRef<HTMLDivElement>(null);
  const overdueCardRef = React.useRef<HTMLDivElement>(null);
  const facehashControls = useAnimationControls();
  const [hasPlayedOverduePeek, setHasPlayedOverduePeek] = useState(false);
  const [showFrowny, setShowFrowny] = useState(false);
  const [showSleepy, setShowSleepy] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const prevCompletionCountRef = React.useRef(0);
  const victoryAnimatingRef = React.useRef(false);

  // Initial appear animation (since we use controls instead of declarative animate)
  useEffect(() => {
    facehashControls.start({
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, type: 'spring', stiffness: 300, damping: 20 },
    });
  }, [facehashControls]);

  useEffect(() => {
    if (overdueCount <= 0 || hasPlayedOverduePeek) return;

    const timer = setTimeout(() => {
      if (!facehashRef.current || !overdueCardRef.current) return;
      // Don't interrupt if joke bubble is showing
      if (joke) return;

      const avatarRect = facehashRef.current.getBoundingClientRect();
      const cardRect = overdueCardRef.current.getBoundingClientRect();

      // Calculate where to move: center the avatar over the overdue card
      const deltaX = cardRect.left + cardRect.width / 2 - (avatarRect.left + avatarRect.width / 2);
      const deltaY = cardRect.top - avatarRect.top - 8; // hover just above the card

      setHasPlayedOverduePeek(true);

      // Animate: slide over slowly, show frowny, pause, slide back
      facehashControls.start({
        x: deltaX,
        y: deltaY,
        rotate: -8,
        transition: { type: 'spring', stiffness: 60, damping: 16 },
      }).then(() => {
        setShowFrowny(true);
        return new Promise(resolve => setTimeout(resolve, 4000));
      }).then(() => {
        setShowFrowny(false);
        return facehashControls.start({
          x: 0,
          y: 0,
          rotate: 0,
          transition: { type: 'spring', stiffness: 80, damping: 18 },
        });
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [overdueCount, hasPlayedOverduePeek, joke, facehashControls]);

  // ─── Facehash "Sleepy Head" — Persistent from 10:30 PM to 5 AM ─────────────
  const isLateNight = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    // 10:30 PM (22:30) through 4:59 AM
    return (hour === 22 && minutes >= 30) || hour >= 23 || hour < 5;
  }, []);

  // Settle into sleep on mount if late night
  useEffect(() => {
    if (!isLateNight) return;

    // If overdue homework exists, wait for overdue peek to finish first
    const delay = overdueCount > 0 ? 8000 : 500;
    const timer = setTimeout(() => {
      if (showFrowny || joke) return;
      setShowSleepy(true);

      // Settle into sleeping position and stay
      facehashControls.start({
        rotate: 20,
        y: 6,
        transition: { type: 'spring', stiffness: 30, damping: 12 },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isLateNight, overdueCount, showFrowny, joke, facehashControls]);

  // ─── Facehash "Celebration Dance" Animation ───────────────────────────────────
  const playPartyAnimation = useCallback(() => {
    // Override other animations
    setShowParty(true);

    // Phase 1: Anticipation — crouch/squish down
    facehashControls.start({
      scaleX: 1.12,
      scaleY: 0.88,
      y: 4,
      rotate: 0,
      transition: { duration: 0.15, ease: 'easeIn' },
    }).then(() => {
      // Phase 2: Launch up with backflip!
      return facehashControls.start({
        scaleX: 0.9,
        scaleY: 1.1,
        y: -30,
        rotate: -360,
        transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
      });
    }).then(() => {
      // Phase 3: Hang at the top for a beat
      return new Promise(resolve => setTimeout(resolve, 80));
    }).then(() => {
      // Phase 4: Fall and land — overshoot squish
      return facehashControls.start({
        scaleX: 1.15,
        scaleY: 0.85,
        y: 3,
        rotate: 0,
        transition: { duration: 0.25, ease: 'easeIn' },
      });
    }).then(() => {
      // Phase 5: Settle bounce
      return facehashControls.start({
        scaleX: 1,
        scaleY: 1,
        y: -6,
        transition: { duration: 0.2, type: 'spring', stiffness: 400, damping: 12 },
      });
    }).then(() => {
      // Phase 6: Final settle
      return facehashControls.start({
        y: 0,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 15 },
      });
    }).then(() => {
      setShowParty(false);
    });
  }, [facehashControls]);

  // ─── Facehash "100% Victory Lap" Animation ──────────────────────────────────
  const playVictoryAnimation = useCallback(() => {
    if (victoryAnimatingRef.current) return;
    victoryAnimatingRef.current = true;
    setShowVictory(true);
    setShowParty(false);

    // Phase 1: Majestic rise — slow float upward
    facehashControls.start({
      y: -10,
      scale: 1.06,
      rotate: 0,
      transition: { duration: 0.8, ease: [0.2, 0.8, 0.3, 1] },
    }).then(() => {
      // Phase 2: Hover with gentle bob — bask in glory
      return facehashControls.start({
        y: [-10, -13, -10, -12, -10],
        transition: { duration: 2.5, ease: 'easeInOut' },
      });
    }).then(() => {
      // Phase 3: Graceful descent
      setShowVictory(false);
      return facehashControls.start({
        y: 0,
        scale: 1,
        transition: { duration: 0.6, type: 'spring', stiffness: 100, damping: 14 },
      });
    }).then(() => {
      victoryAnimatingRef.current = false;
    });
  }, [facehashControls]);

  // Detect completion increase
  const completionCount = useMemo(() => homeworks.filter((hw: any) => hw.completed).length, [homeworks]);
  const totalHomeworkCount = homeworks.length;

  useEffect(() => {
    if (completionCount > prevCompletionCountRef.current && prevCompletionCountRef.current > 0) {
      // Check if this completion made it 100%
      if (totalHomeworkCount > 0 && completionCount === totalHomeworkCount) {
        playVictoryAnimation();
      } else {
        playPartyAnimation();
      }
    }
    prevCompletionCountRef.current = completionCount;
  }, [completionCount, totalHomeworkCount, playPartyAnimation, playVictoryAnimation]);

  // Completion rate for emoji reaction
  const completionRate = useMemo(() => {
    if (homeworks.length === 0) return 0;
    return Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100);
  }, [homeworks]);

  const completionEmoji = completionRate === 100 ? '🏆' : completionRate >= 80 ? '🔥' : completionRate >= 50 ? '💪' : completionRate > 0 ? '🌱' : '📝';
  const overdueEmoji = overdueCount === 0 ? '✅' : overdueCount <= 2 ? '😬' : '😰';

  // Compute the Facehash background color to use on the heading
  const FACEHASH_COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
  ];
  const facehashColor = useMemo(() => {
    const name = (full_name?.split(' ')[0]) || user?.email || 'Student';
    // Exact replica of facehash's stringHash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    hash = Math.abs(hash);
    return FACEHASH_COLORS[hash % FACEHASH_COLORS.length];
  }, [full_name, user?.email]);

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 overflow-x-hidden font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-8">
        {/* Welcome Section — with Facehash Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Facehash Avatar — clickable for jokes */}
            <div className="relative shrink-0" ref={facehashRef}>
              <div className="relative">
                {/* Pillow + zzz during sleepy animation - moved OUTSIDE the clipped container */}
                <AnimatePresence>
                  {showSleepy && (
                    <>
                      {/* Pillow underneath the tilted avatar */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7, x: 5 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                        className="absolute -bottom-3 -left-4 pointer-events-none select-none z-0"
                      >
                        <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                          {/* Pillow body - soft rounded squircle */}
                          <rect x="2" y="4" width="44" height="18" rx="6" fill="#e0e7ff" className="dark:fill-indigo-900/60" />
                          {/* Pillow puff highlights */}
                          <ellipse cx="12" cy="11" rx="6" ry="5" fill="#eef2ff" className="dark:fill-indigo-800/40" />
                          <ellipse cx="36" cy="11" rx="6" ry="5" fill="#eef2ff" className="dark:fill-indigo-800/40" />
                          {/* Pillow outline */}
                          <rect x="2" y="4" width="44" height="18" rx="6" stroke="#c7d2fe" strokeWidth="1" fill="none" className="dark:stroke-indigo-700/50" />
                        </svg>
                      </motion.div>
                      {/* Floating zzz */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute -top-4 -right-3 pointer-events-none select-none z-20"
                      >
                        <motion.span
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-[10px] font-bold text-indigo-300 dark:text-indigo-400/60 block"
                        >
                          z
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -3, 0], opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                          className="text-xs font-bold text-teal-300 dark:text-teal-400/60 block -mt-1 ml-1"
                        >
                          z
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -5, 0], opacity: [0.2, 0.7, 0.2] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                          className="text-sm font-bold text-teal-300 dark:text-teal-400/60 block -mt-1 ml-2.5"
                        >
                          z
                        </motion.span>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Golden crown when all homework is done */}
                <AnimatePresence>
                  {completionRate === 100 && homeworks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-30"
                    >
                      <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
                        {/* Crown glow */}
                        <ellipse cx="22" cy="26" rx="16" ry="5" fill="#fbbf24" opacity="0.2" />
                        {/* Crown body */}
                        <path
                          d="M5 24L2 8L12 16L22 4L32 16L42 8L39 24H5Z"
                          fill="#f59e0b"
                          stroke="#d97706"
                          strokeWidth="1"
                        />
                        {/* Crown band */}
                        <rect x="5" y="24" width="34" height="4" rx="1" fill="#d97706" />
                        {/* Crown jewels */}
                        <circle cx="14" cy="18" r="2.5" fill="#fbbf24" />
                        <circle cx="22" cy="12" r="3" fill="#fcd34d" />
                        <circle cx="30" cy="18" r="2.5" fill="#fbbf24" />
                      </svg>
                      {/* Sparkles */}
                      <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-2 -left-2"
                      >
                        <span className="text-[10px]">✨</span>
                      </motion.div>
                      <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute -top-2 -right-2"
                      >
                        <span className="text-[10px]">✨</span>
                      </motion.div>
                      <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute -top-1 left-1/2 -translate-x-1/2"
                      >
                        <span className="text-[8px]">⭐</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={facehashControls}
                  whileTap={{ scale: 0.92 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  className="rounded-2xl overflow-hidden shadow-md cursor-pointer select-none z-10 relative"
                  onClick={fetchJoke}
                  title="Click me for a joke!"
                >
                  <Facehash
                    name={(full_name?.split(' ')[0]) || user?.email || 'Student'}
                    size={64}
                    enableBlink={!showSleepy}
                    intensity3d="dramatic"
                    showInitial={!showFrowny && !showSleepy && !showParty && !showVictory}
                    colors={[
                      '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
                      '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
                      '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
                    ]}
                    style={{ borderRadius: '16px' }}
                    onRenderMouth={
                      showVictory ? () => (
                        // Victory mouth — proud confident grin
                        <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                          <path
                            d="M3 3C5 11 19 11 21 3"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 6C9 9 15 9 17 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.4"
                          />
                        </svg>
                      ) : showParty ? () => (
                        // Party mouth — wide happy smile
                        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                          <path
                            d="M2 2C6 10 18 10 22 2"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : showFrowny ? () => (
                        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                          <path
                            d="M2 10C5 4 10 2 18 4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : showSleepy ? () => (
                        // Sleeping mouth — gentle relaxed closed line
                        <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                          <path
                            d="M3 2C5.5 4.5 10.5 4.5 13 2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : undefined
                    }
                  />
                </motion.div>
              </div>

              {/* Joke Speech Bubble */}
              <AnimatePresence>
                {joke && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute left-0 top-full mt-2 z-50 w-64 sm:w-72 cursor-pointer"
                    onClick={() => { setJoke(null); if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current); }}
                  >
                    {/* Speech bubble arrow */}
                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45" />
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                        {joke}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-right">
                        tap to dismiss · click me again for another
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight">
                {timeGreeting.text}, {full_name?.split(' ')[0] || 'Student'}!
              </h1>
            </div>

            {/* Stats pill — green bg, sky-500 text, inner segment pills */}
            <div className="hidden lg:flex items-center gap-2.5 p-1.5 bg-[#f5f9fc] dark:bg-gray-800 rounded-full shadow-sm border border-sky-100 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{completionRate}%</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Complete</span>
              </div>
              <div className="w-px h-5 bg-blue-700/20 dark:bg-blue-400/20" />
              <div ref={overdueCardRef} className="flex items-center gap-2 px-4 py-2 rounded-full">
                <Clock className={`w-4 h-4 ${overdueCount > 0 ? 'text-red-500' : 'text-blue-700 dark:text-blue-400'}`} />
                <span className={`text-sm font-bold ${overdueCount > 0 ? 'text-red-500' : 'text-blue-700 dark:text-blue-400'}`}>{overdueCount}</span>
                <span className={`text-xs font-medium ${overdueCount > 0 ? 'text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>Overdue</span>
              </div>
              <div className="w-px h-5 bg-blue-700/20 dark:bg-blue-400/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full">
                <GraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{tests.length > 0 ? tests.filter((test: Test) => test.status === 'upcoming').length : 0}</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Tests</span>
              </div>
              <div className="w-px h-5 bg-blue-700/20 dark:bg-blue-400/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full">
                <CalendarIcon className={`w-4 h-4 ${(() => {
                  const nextItem = nextDueHomework && nextUpcomingTest
                    ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                    : (nextDueHomework || nextUpcomingTest);
                  const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;
                  if (daysUntil === 0) return 'text-red-500';
                  if (daysUntil === 1) return 'text-amber-500';
                  return 'text-blue-700 dark:text-blue-400';
                })()}`} />
                <span className={`text-sm font-bold whitespace-nowrap ${(() => {
                  const nextItem = nextDueHomework && nextUpcomingTest
                    ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                    : (nextDueHomework || nextUpcomingTest);
                  const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;
                  if (daysUntil === 0) return 'text-red-500';
                  if (daysUntil === 1) return 'text-amber-500';
                  return 'text-blue-700 dark:text-blue-400';
                })()}`}>
                  {nextDueHomework || nextUpcomingTest ? (
                    (() => {
                      const nextItem = nextDueHomework && nextUpcomingTest
                        ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                        : (nextDueHomework || nextUpcomingTest);
                      const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;
                      const itemDate = new Date(nextItem === nextUpcomingTest ? (nextItem as Test).testDate : (nextItem as Homework).dueDate);

                      if (daysUntil !== null) {
                        if (daysUntil === 0) return 'Today';
                        if (daysUntil === 1) return 'Tomorrow';

                        if (daysUntil < 7) {
                          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const currentDay = new Date().getDay();
                          const testDay = itemDate.getDay();
                          const itemDayName = dayNames[testDay];
                          const daysUntilItem = testDay - currentDay;
                          const isSameWeek = daysUntilItem > 0 && daysUntilItem <= 6;
                          if (isSameWeek) return `This ${itemDayName}`;
                          return `Next ${itemDayName}`;
                        }
                        return format(itemDate, 'MMM d');
                      }
                      return `${daysUntil}d`;
                    })()
                  ) : '-'}
                </span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {nextDueHomework || nextUpcomingTest ? (
                    (() => {
                      const nextItem = nextDueHomework && nextUpcomingTest
                        ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                        : (nextDueHomework || nextUpcomingTest);
                      return nextItem === nextUpcomingTest ? 'Next Test' : 'Next Due';
                    })()
                  ) : 'Next Due'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar + Coming Up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 h-[300px]">
          <MiniCalendar />
          <ComingUp />
        </div>

        {/* Render sections in user-defined order */}
        {sectionOrder.map(sectionId => renderSection(sectionId))}

        <AnimatePresence>
          {showAddClass && (
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-100">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-950 rounded-lg shadow-lg w-full max-w-md relative border border-gray-200 dark:border-gray-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Add New Class
                  </h2>
                  <button
                    onClick={() => setShowAddClass(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
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
                      className="w-full h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddClass()}
                    />
                  </div>

                  {/* AI Suggestions */}
                  <AnimatePresence>
                    {newClassName.trim().length >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#264f84] dark:text-blue-400 flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" />
                              Semantic Suggestions
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAISuggest();
                              }}
                              disabled={isSuggestingIcons}
                              className="text-[10px] text-gray-500 hover:text-[#264f84] transition-colors flex items-center gap-1"
                            >
                              {isSuggestingIcons ? (
                                <Loader2 className="h-2 w-2 animate-spin" />
                              ) : (
                                <Sparkles className="h-2 w-2" />
                              )}
                              {isSuggestingIcons ? 'Analyzing...' : 'Refresh Suggestions'}
                            </button>
                          </div>
                          <div className="flex gap-2 p-2 bg-blue-50/30 dark:bg-blue-900/10 rounded-lg border border-blue-100/50 dark:border-blue-900/20 overflow-x-auto min-h-[52px]">
                            {aiSuggestions.map((icon) => (
                              <button
                                key={`suggest-${icon.name}`}
                                type="button"
                                onClick={() => setNewClassIcon(icon.name)}
                                className={`p-2.5 rounded-lg transition-all shrink-0 ${newClassIcon === icon.name
                                  ? 'bg-[#264f84] text-white shadow-sm scale-110'
                                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                title={icon.name}
                              >
                                {(() => {
                                  const Icon = icon.component;
                                  return <Icon className="h-5 w-5" />;
                                })()}
                              </button>
                            ))}
                            {aiSuggestions.length === 0 && !isSuggestingIcons && (
                              <div className="flex items-center justify-center w-full min-h-[36px]">
                                <span className="text-[10px] text-gray-400 italic">
                                  Type more to get AI suggestions...
                                </span>
                              </div>
                            )}
                            {isSuggestingIcons && aiSuggestions.length === 0 && (
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                  <div key={i} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                        className="pl-10 w-full h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                        autoComplete="off"
                      />
                    </div>

                    {/* Icon Grid */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-950">
                      <div className="max-h-64 overflow-y-auto">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                          <div key={category}>
                            <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
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
                                    ? 'bg-[#264f84] text-white scale-105 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:scale-105'
                                    }`}
                                  title={name}
                                >
                                  <IconComponent className="h-5 w-5" />
                                  {newClassIcon === name && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {filteredIcons.length === 0 && (
                          <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 mb-3">
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
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddClass(false)}
                    className="h-10 px-4 text-sm border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddClass}
                    disabled={!newClassName.trim()}
                    className="h-10 px-6 text-sm bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
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
            <AddTestModal
              isOpen={showAddTest}
              onClose={() => {
                setShowAddTest(false);
                setClassIdForAddTest(undefined);
              }}
              defaultClassId={classIdForAddTest}
            />
          )}
        </AnimatePresence>

        {/* Test Detail Modal */}
        <TestDetailModal
          test={selectedTest}
          isOpen={isTestDetailModalOpen}
          onClose={() => setIsTestDetailModalOpen(false)}
          onDelete={deleteTest}
          classInfo={selectedTest ? classes.find(c => c.id === selectedTest.classId) : undefined}
          layoutId={selectedTest ? `test-card-${selectedTest.id}` : undefined}
        />

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

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Recurring Homework
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete &quot;<span className="font-medium">{deleteConfirm.title}</span>&quot;?
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleDeleteConfirm(false)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Delete only this instance
                </button>
                <button
                  onClick={() => handleDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete entire recurring series
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={!!classToDelete} onOpenChange={(open) => { if (!open) setClassToDelete(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{classToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class and all of its homework and tests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={() => {
                if (classToDelete) {
                  deleteClass(classToDelete.id);
                  setClassToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

export default MainApp;