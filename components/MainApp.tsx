import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { OnboardingModal } from './OnboardingModal';
import { AddTestModal } from './AddTestModal';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { SplittingText } from './animate-ui/primitives/texts/splitting';
import { useWideLayout } from '@/hooks/use-wide-layout';

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
import { iconMap, IconName } from '@/lib/icon-map';
import { RecurringHomework, RecurringFrequency, Class, Homework, Test } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '../context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import { MarkTestAsTakenModal } from '@/components/MarkTestAsTakenModal';

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
  const [testToMark, setTestToMark] = useState<Test | null>(null);

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

  const [showLevelDisplay, setShowLevelDisplay] = useState(false);

  const [showSubjectMastery, setShowSubjectMastery] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showSubjectMastery');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const [useNaturalLanguageDates, setUseNaturalLanguageDates] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('useNaturalLanguageDates');
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
  });



  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('expandedClasses');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
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

  const handleToggleLevelDisplay = (newState: boolean) => {
    setShowLevelDisplay(newState);
    setCookie('showLevelDisplay', newState.toString());
  };

  const handleToggleSubjectMastery = (newState: boolean) => {
    setShowSubjectMastery(newState);
    setCookie('showSubjectMastery', newState.toString());
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

  // Add debugging for homework display
  useEffect(() => {
    console.log('Available classes:', classes.map((cls: Class) => ({ id: cls.id, name: cls.name })));
    console.log('Total homework items:', homeworks.length);
    console.log('Homework items with class details:', homeworks.map((hw: Homework) => {
      const className = classes.find((cls: Class) => cls.id === hw.classId)?.name || 'Unknown Class';
      return {
        id: hw.id,
        classId: hw.classId,
        className: className,
        title: hw.title,
        is_recurring_instance: (hw as any).is_recurring_instance,
        recurring_id: (hw as any).recurring_id
      };
    }));
  }, [classes, homeworks]);

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

    // console.log('Test filtering:', {
    //   testTitle: test.title,
    //   testDate: test.testDate,
    //   testDateObj: testDate,
    //   today: today,
    //   isBeforeToday: testDate < today,
    //   isAfterOrEqualToday: testDate >= today,
    //   currentFilter: testFilter
    // });

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

  // Function to render each section based on ID
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {


      case 'classes':
        return (
          <div key="classes" className="mb-10">
            <div>
              <div
                className="mb-4 cursor-pointer group"
                onClick={() => handleToggleClasses(!showClasses)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                        My Classes
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your classes and assignments</p>
                    </div>
                    <div
                      className={`p-2 rounded-lg transition-all duration-500 md:hidden ${showClasses
                        ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                        : 'rotate-0 bg-gray-100 dark:bg-gray-900'
                        }`}
                    >
                      <ChevronRight className={`h-5 w-5 transition-colors ${showClasses ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddClass(true);
                      }}
                      className="rounded-lg bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Class
                    </Button>
                    <Button
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddHomework(true);
                      }}
                      className="rounded-lg bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Homework
                    </Button>
                    <div
                      className={`p-2 rounded-lg transition-all duration-500 hidden md:block ${showClasses
                        ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                        : 'rotate-0 bg-gray-100 dark:bg-gray-900'
                        }`}
                    >
                      <ChevronRight className={`h-5 w-5 transition-colors ${showClasses ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${showClasses
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out ${showClasses
                ? 'max-h-[5000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
              {classes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-950 rounded-[32px] p-6 text-center border border-gray-100 dark:border-gray-800"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                    <Layers className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">No classes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
                    Get started by adding your first class to organize your schoolwork.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {classes
                    .map((cls: any, index: number) => (
                      <motion.div
                        key={cls.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.05,
                          layout: { type: "spring", stiffness: 300, damping: 30 }
                        }}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center w-full gap-3">
                            <div className="w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                              {(() => {
                                const IconComponent = iconMap[cls.icon as keyof typeof iconMap] ?? BookOpen;
                                return <IconComponent className="w-4 h-4" style={{ color: getClassColor(index) }} />;
                              })()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {cls.name}
                              </h3>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteClass(cls.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0"
                              aria-label="Delete class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                        <div className="space-y-2 mt-2">
                          <PlayfulHomeworkList
                            items={(() => {
                              const classHomeworks = homeworks
                                .filter((hw: any) => hw.classId === cls.id)
                                .filter((hw: any) => hw.is_recurring_instance === true || hw.recurring_id == null) // Show recurring instances and regular homework
                                .sort((a: any, b: any) => {
                                  // Sort by completion status first (uncompleted first)
                                  if (a.completed !== b.completed) {
                                    return a.completed ? 1 : -1;
                                  }
                                  // Then sort by due date
                                  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                })
                                .map((hw: any) => {
                                  // console.log('Homework item for class', cls.name, ':', {
                                  //   id: hw.id,
                                  //   classId: hw.classId,
                                  //   className: cls.name,
                                  //   title: hw.title,
                                  //   completed: hw.completed,
                                  //   dueDate: hw.dueDate
                                  // });
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
                                    onDeleteSeries: (hw.recurring_id || hw.parent_recurring_id) ? () => deleteRecurringSeries(hw.recurring_id || hw.parent_recurring_id) : undefined,
                                    className: cls.name,
                                    pinned: hw.pinned || false,
                                    // Add recurring homework information
                                    recurring: hw.recurring_frequency ? true : undefined as any,
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

                          {(() => {
                            const classHomeworks = homeworks.filter((hw: any) => hw.classId === cls.id && (hw.is_recurring_instance === true || hw.recurring_id == null));
                            const classHasNoHomework = classHomeworks.length === 0;

                            if (classHasNoHomework) {
                              const upcomingClassTests = tests.filter((t: any) => {
                                if (t.classId !== cls.id) return false;
                                const testDate = new Date(t.testDate);
                                const now = new Date();
                                now.setHours(0, 0, 0, 0);
                                const diffTime = testDate.getTime() - now.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                // Show tests within the next 14 days
                                return diffDays >= 0 && diffDays <= 14;
                              });

                              if (upcomingClassTests.length > 0) {
                                return (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {upcomingClassTests.length} {upcomingClassTests.length === 1 ? 'test' : 'tests'} in the next 14 days
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div className="text-center py-2">
                                  <p className="text-xs text-gray-400 dark:text-gray-500">No assignments yet</p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'tests':
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
                      <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 group-hover:text-[#264f84] dark:group-hover:text-blue-400 transition-colors">
                        Tests & Exams
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your test schedule and study materials</p>
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
                      className="rounded-lg bg-[#264f84] hover:bg-[#1f3f6b] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Test
                    </Button>
                    <div
                      className={`p-2 rounded-lg transition-all duration-500 hidden md:block ${showTests
                        ? 'rotate-90 bg-[#264f84] dark:bg-blue-500'
                        : 'rotate-0 bg-gray-100 dark:bg-gray-900'
                        }`}
                    >
                      <ChevronRight className={`h-5 w-5 transition-colors ${showTests ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                    </div>
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
                    className="bg-white dark:bg-gray-950 rounded-[32px] p-6 text-center border border-gray-100 dark:border-gray-800"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                      <CalendarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">No tests scheduled</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
      <main className={getContainerClass('max-w-7xl') + ' py-8'}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
            Welcome back, {full_name || 'Student'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's what's happening with your classes today
          </p>
        </motion.div>

        {/* Stats Section - Minimalist Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Completion Rate */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#264f84] dark:text-blue-400 font-medium">Complete</span>
              <CheckCircle className="w-4 h-4 text-[#264f84] dark:text-blue-400" />
            </div>
            <div className="text-2xl font-light text-gray-900 dark:text-white">
              {homeworks.length > 0 ? Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100) : 0}%
            </div>
          </div>

          {/* Overdue Items */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${homeworks.filter((hw: any) => {
                const dueDate = new Date(hw.dueDate);
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                return !hw.completed && dueDate < todayStart;
              }).length > 0 ? 'text-red-500' : 'text-[#264f84] dark:text-blue-400'}`}>Overdue</span>
              <div className="relative">
                <Clock className={`w-4 h-4 ${homeworks.filter((hw: any) => {
                  const dueDate = new Date(hw.dueDate);
                  const todayStart = new Date();
                  todayStart.setHours(0, 0, 0, 0);
                  return !hw.completed && dueDate < todayStart;
                }).length > 0 ? 'text-red-500' : 'text-[#264f84] dark:text-blue-400'}`} />
                {homeworks.filter((hw: any) => {
                  const dueDate = new Date(hw.dueDate);
                  const todayStart = new Date();
                  todayStart.setHours(0, 0, 0, 0);
                  return !hw.completed && dueDate < todayStart;
                }).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
                  )}
              </div>
            </div>
            <div className="text-2xl font-light text-gray-900 dark:text-white">
              {homeworks.filter((hw: any) => {
                const dueDate = new Date(hw.dueDate);
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                return !hw.completed && dueDate < todayStart;
              }).length}
            </div>
          </div>

          {/* Test Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#264f84] dark:text-blue-400 font-medium">Tests</span>
              <GraduationCap className="w-4 h-4 text-[#264f84] dark:text-blue-400" />
            </div>
            <div className="text-2xl font-light text-gray-900 dark:text-white">
              {tests.length > 0 ? tests.filter((test: Test) => test.status === 'upcoming').length : 0}
            </div>
          </div>

          {/* Next Deadline */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${(() => {
                const nextItem = nextDueHomework && nextUpcomingTest
                  ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                  : (nextDueHomework || nextUpcomingTest);
                const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;

                if (!daysUntil) return 'text-[#264f84] dark:text-blue-400'; // Default blue
                if (daysUntil === 0) return 'text-red-500'; // Overdue/Today - Red
                if (daysUntil === 1) return 'text-amber-500'; // Tomorrow - Yellow/Amber
                if (daysUntil <= 3) return 'text-orange-500'; // 2-3 days - Orange
                return 'text-green-600 dark:text-green-400'; // 4+ days - Green
              })()
                }`}>
                {nextDueHomework || nextUpcomingTest ? (
                  (() => {
                    const nextItem = nextDueHomework && nextUpcomingTest
                      ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                      : (nextDueHomework || nextUpcomingTest);
                    const isTest = nextItem === nextUpcomingTest;
                    return `Next ${isTest ? 'Test' : 'Due'}`;
                  })()
                ) : 'Next Due'}
              </span>
              <CalendarIcon className={`w-4 h-4 ${(() => {
                const nextItem = nextDueHomework && nextUpcomingTest
                  ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                  : (nextDueHomework || nextUpcomingTest);
                const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;

                if (!daysUntil) return 'text-[#264f84] dark:text-blue-400'; // Default blue
                if (daysUntil === 0) return 'text-red-500'; // Overdue/Today - Red
                if (daysUntil === 1) return 'text-amber-500'; // Tomorrow - Yellow/Amber
                if (daysUntil <= 3) return 'text-orange-500'; // 2-3 days - Orange
                return 'text-green-600 dark:text-green-400'; // 4+ days - Green
              })()
                }`} />
            </div>
            <div className="text-2xl font-light text-gray-900 dark:text-white">
              {nextDueHomework || nextUpcomingTest ? (
                (() => {
                  const nextItem = nextDueHomework && nextUpcomingTest
                    ? (daysUntilNextDue! < daysUntilNextTest! ? nextDueHomework : nextUpcomingTest)
                    : (nextDueHomework || nextUpcomingTest);
                  const daysUntil = nextItem === nextUpcomingTest ? daysUntilNextTest : daysUntilNextDue;
                  const itemDate = new Date(nextItem === nextUpcomingTest ? (nextItem as Test).testDate : (nextItem as Homework).dueDate);

                  if (useNaturalLanguageDates && daysUntil !== null) {
                    if (daysUntil === 0) return 'Today';
                    if (daysUntil === 1) return 'Tomorrow';

                    // Smart natural language for upcoming days
                    if (daysUntil < 7) {
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const currentDay = new Date().getDay();
                      const testDay = itemDate.getDay();

                      // Get the day name for the item
                      const itemDayName = dayNames[testDay];

                      // Check if item is in the same week (within 6 days from today)
                      const daysUntilItem = testDay - currentDay;
                      const isSameWeek = daysUntilItem > 0 && daysUntilItem <= 6;

                      if (isSameWeek) {
                        return `This ${itemDayName}`;
                      } else {
                        return `Next ${itemDayName}`;
                      }
                    }

                    return format(itemDate, 'MMM d');
                  }

                  return `${daysUntil}d`;
                })()
              ) : '-'}
            </div>
          </div>
        </div>
        {/* Gamification Section */}
        {(showLevelDisplay || showSubjectMastery) && (
          <div className={`grid grid-cols-1 gap-6 mb-10 ${showLevelDisplay && showSubjectMastery ? 'md:grid-cols-2' : ''
            }`}>
            {showLevelDisplay && <LevelDisplay />}
            {showSubjectMastery && <SubjectMastery />}
          </div>
        )}

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
                Are you sure you want to delete "<span className="font-medium">{deleteConfirm.title}</span>"?
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
    </div>
  );
}

export default MainApp;