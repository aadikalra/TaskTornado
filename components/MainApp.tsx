import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Facehash } from 'facehash';
import { format, addDays } from 'date-fns';
import { OnboardingModal } from './OnboardingModal';
import WelcomeLetter from './WelcomeLetter';
import { AddTestModal } from './AddTestModal';
import { TestDetailModal } from './TestDetailModal';
import { Button } from '@/components/animate-ui/components/buttons/button';
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
  AlertDialogTrigger,
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

import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

import { HomeworkLinkInput } from './HomeworkLinkInput';
import { RecurringOptions } from './RecurringOptions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { MiniCalendar } from './MiniCalendar';
import { MobileWeekCalendar } from './MobileWeekCalendar';
import { ComingUp, useUpcomingItems } from './ComingUp';
import { EmailWidget } from './EmailWidget';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { PlayfulHomeworkList, PlayfulHomeworkListRef } from '@/components/PlayfulHomeworkList';
import { HugeIcon, hugeIconMap } from '@/lib/huge-icon-map';
import { iconMap, IconName } from '@/lib/icon-map';

// Helper component to render class icon with HugeIcon fallback
const ClassIconRenderer: React.FC<{ iconName: string; className?: string; style?: React.CSSProperties }> = ({ iconName, className, style }) => {
  return (
    <HugeIcon
      name={iconName}
      size={24}
      className={className}
      style={style}
    />
  );
};

// Helper component to wrap ClassIconRenderer for EnhancedTestCard
const createClassIconComponent = (iconName: string) => {
  return (props: { className?: string; style?: React.CSSProperties }) => (
    <ClassIconRenderer iconName={iconName} {...props} />
  );
};

import { RecurringHomework, Class, Homework, Test } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useUpgrade } from '@/context/UpgradeContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '../context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import EnhancedTestCard from '@/components/EnhancedTestCard';
import { TaskBracket } from '@/components/TaskBracket';

type LucideIconName = IconName;
type Priority = 'low' | 'medium' | 'high';

const MainApp = () => {
  const { user, full_name } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const { handlePlanLimitError } = useUpgrade();
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
    updateHomework,
    updateTestDueDate,
    markTestComplete
  } = useClassContext();

  const upcomingItems = useUpcomingItems();
  const hasUpcoming = upcomingItems.length > 0;

  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showPinHomeworkModal, setShowPinHomeworkModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeLetter, setShowWelcomeLetter] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassIcon, setNewClassIcon] = useState<string>('Book02');
  const [searchQuery, setSearchQuery] = useState('');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [isHomeworkSearchExpanded, setIsHomeworkSearchExpanded] = useState(false);
  const [homeworkFilter, setHomeworkFilter] = useState('all');
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isAddTestExpanded, setIsAddTestExpanded] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isTestDetailModalOpen, setIsTestDetailModalOpen] = useState(false);
  const [classIdForAddTest, setClassIdForAddTest] = useState<string | undefined>(undefined);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showBracket, setShowBracket] = useState(false);

  // Refs for PlayfulHomeworkList instances to clear selection
  const homeworkListRefs = useRef<Map<string, PlayfulHomeworkListRef | null>>(new Map());

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
  const [testFilter, setTestFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('testFilter');
      return saved || 'all';
    }
    return 'all';
  });
  const [testSearch, setTestSearch] = useState('');
  const [isTestSearchExpanded, setIsTestSearchExpanded] = useState(false);

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
  const handleTestFilterChange = (value: string) => {
    setTestFilter(value);
    setCookie('testFilter', value);
  };

  const handleExpandedClassesChange = (newState: Record<string, boolean>) => {
    setExpandedClasses(newState);
    setCookie('expandedClasses', JSON.stringify(newState));
  };

  // Available icons with their display names and semantic tags
  const availableIcons = useMemo(() => [
    { name: 'BookOpen', iconName: 'Book01', category: 'General', tags: ['reading', 'study', 'learning', 'education', 'homework', 'textbook'] },
    { name: 'Book', iconName: 'Book02', category: 'General', tags: ['reading', 'note', 'subject', 'library'] },
    { name: 'Calculator', iconName: 'Abacus', category: 'Math', tags: ['math', 'numbers', 'statistics', 'accounting', 'arithmetic'] },
    { name: 'Code', iconName: 'Code', category: 'Computer Science', tags: ['programming', 'coding', 'software', 'development', 'it', 'tech', 'web'] },
    { name: 'GraduationCap', iconName: 'GraduationScroll', category: 'General', tags: ['degree', 'graduation', 'success', 'school', 'university', 'academic'] },
    { name: 'Dumbbell', iconName: 'WorkoutSport', category: 'Sports', tags: ['gym', 'pe', 'sports', 'health', 'exercise', 'physical', 'training'] },
    { name: 'AmericanFootball', iconName: 'AmericanFootball', category: 'Sports', tags: ['football', 'sports', 'american', 'nfl'] },
    { name: 'Baseball', iconName: 'Baseball', category: 'Sports', tags: ['baseball', 'sports', 'mlb'] },
    { name: 'BaseballBat', iconName: 'BaseballBat', category: 'Sports', tags: ['baseball', 'sports', 'bat'] },
    { name: 'BaseballHelmet', iconName: 'BaseballHelmet', category: 'Sports', tags: ['baseball', 'sports', 'helmet', 'protection'] },
    { name: 'Basketball01', iconName: 'Basketball01', category: 'Sports', tags: ['basketball', 'sports', 'nba'] },
    { name: 'Basketball02', iconName: 'Basketball02', category: 'Sports', tags: ['basketball', 'sports', 'nba'] },
    { name: 'BasketballHoop', iconName: 'BasketballHoop', category: 'Sports', tags: ['basketball', 'sports', 'hoop'] },
    { name: 'BowlingBall', iconName: 'BowlingBall', category: 'Sports', tags: ['bowling', 'sports', 'ball'] },
    { name: 'Football', iconName: 'Football', category: 'Sports', tags: ['football', 'sports', 'soccer'] },
    { name: 'FootballPitch', iconName: 'FootballPitch', category: 'Sports', tags: ['football', 'sports', 'soccer', 'field'] },
    { name: 'TennisBall', iconName: 'TennisBall', category: 'Sports', tags: ['tennis', 'sports', 'ball'] },
    { name: 'Volleyball', iconName: 'Volleyball', category: 'Sports', tags: ['volleyball', 'sports'] },
    { name: 'YogaBall', iconName: 'YogaBall', category: 'Sports', tags: ['yoga', 'sports', 'fitness', 'exercise'] },
    { name: 'FlaskConical', iconName: 'TestTube01', category: 'Science', tags: ['chemistry', 'science', 'lab', 'experiment', 'liquid'] },
    { name: 'Sigma', iconName: 'Math', category: 'Math', tags: ['math', 'sum', 'calculation', 'advanced', 'greek', 'formulas'] },
    { name: 'Variable', iconName: 'BinaryCode', category: 'Math', tags: ['algebra', 'math', 'equation', 'letters', 'x', 'y'] },
    { name: 'Palette', iconName: 'Artboard', category: 'Art', tags: ['design', 'painting', 'drawing', 'creativity', 'color', 'arts'] },
    { name: 'Brush', iconName: 'PenTool01', category: 'Art', tags: ['painting', 'design', 'drawing', 'art'] },
    { name: 'Theater', iconName: 'Book03', category: 'Art', tags: ['drama', 'acting', 'performance', 'stage', 'play', 'arts'] },
    { name: 'Music2', iconName: 'MusicNote01', category: 'Music', tags: ['notes', 'melody', 'audio', 'song', 'music'] },
    { name: 'Music4', iconName: 'MusicThree', category: 'Music', tags: ['instruments', 'notes', 'rhythm', 'band', 'orchestra'] },
    { name: 'Globe2', iconName: 'Globe', category: 'Geography', tags: ['world', 'earth', 'travel', 'social studies', 'geography'] },
    { name: 'History', iconName: 'Scroll', category: 'History', tags: ['past', 'time', 'museum', 'tradition', 'historical'] },
    { name: 'Landmark', iconName: 'School', category: 'History', tags: ['government', 'politics', 'museum', 'architecture', 'civics'] },
    { name: 'Briefcase', iconName: 'Laptop', category: 'Business', tags: ['work', 'professional', 'career', 'management', 'economics'] },
    { name: 'Activity01', iconName: 'Activity01', category: 'Business', tags: ['business', 'activity', 'work', 'tasks'] },
    { name: 'ActivityCircle', iconName: 'ActivityCircle', category: 'Business', tags: ['business', 'activity', 'work', 'tasks'] },
    { name: 'AnalysisTextLink', iconName: 'AnalysisTextLink', category: 'Business', tags: ['business', 'analysis', 'data', 'report'] },
    { name: 'Analytics01', iconName: 'Analytics01', category: 'Business', tags: ['business', 'analytics', 'data', 'statistics'] },
    { name: 'AnalyticsDown', iconName: 'AnalyticsDown', category: 'Business', tags: ['business', 'analytics', 'data', 'trends'] },
    { name: 'AnalyticsUp', iconName: 'AnalyticsUp', category: 'Business', tags: ['business', 'analytics', 'data', 'growth'] },
    { name: 'Mountain', iconName: 'Globe02', category: 'Geography', tags: ['nature', 'outdoors', 'environment', 'climbing', 'earth'] },
    { name: 'Star', iconName: 'Crown', category: 'General', tags: ['favorite', 'important', 'success', 'brilliant', 'rating'] },
    { name: 'Quote', iconName: 'FilePen', category: 'Languages', tags: ['literature', 'writing', 'english', 'speech', 'referencing'] },
    { name: 'Shapes', iconName: 'Calculate', category: 'Math', tags: ['geometry', 'basics', 'design', 'patterns'] },
    { name: 'Game', iconName: 'Game', category: 'Gaming', tags: ['fun', 'play', 'video games', 'leisure'] },
    { name: 'Gameboy', iconName: 'Gameboy', category: 'Gaming', tags: ['fun', 'play', 'video games', 'leisure', 'retro'] },
    { name: 'GameController01', iconName: 'GameController01', category: 'Gaming', tags: ['fun', 'play', 'video games', 'controller'] },
    { name: 'GameController02', iconName: 'GameController02', category: 'Gaming', tags: ['fun', 'play', 'video games', 'controller'] },
    { name: 'GameController03', iconName: 'GameController03', category: 'Gaming', tags: ['fun', 'play', 'video games', 'controller'] },
    { name: 'GamepadDirectional', iconName: 'GamepadDirectional', category: 'Gaming', tags: ['fun', 'play', 'video games', 'controller'] },
    { name: 'AiGame', iconName: 'AiGame', category: 'Gaming', tags: ['fun', 'play', 'ai', 'video games'] },
    { name: 'AircraftGame', iconName: 'AircraftGame', category: 'Gaming', tags: ['fun', 'play', 'aircraft', 'video games'] },
    { name: 'Coffee', iconName: 'Book04', category: 'General', tags: ['energy', 'break', 'morning', 'cafe', 'teacher'] },
    { name: 'School', iconName: 'School', category: 'General', tags: ['building', 'education', 'campus'] },
    { name: 'Award', iconName: 'Crown02', category: 'General', tags: ['trophy', 'prize', 'achievement', 'win'] },
    { name: 'Compass', iconName: 'Compass', category: 'Geography', tags: ['direction', 'map', 'navigation'] },
    { name: 'FileText', iconName: 'Scroll', category: 'General', tags: ['document', 'writing', 'assignment'] },
    { name: 'GitBranch', iconName: 'BinaryCode', category: 'Computer Science', tags: ['coding', 'version control', 'tech'] },
    { name: 'Image', iconName: 'Camera02', category: 'Art', tags: ['picture', 'photo', 'design'] },
    { name: 'Laptop', iconName: 'Laptop', category: 'Computer Science', tags: ['computer', 'work', 'it'] },
    { name: 'Lightbulb', iconName: 'LightbulbOff', category: 'General', tags: ['idea', 'innovation', 'thought'] },
    { name: 'Map', iconName: 'Maps', category: 'Geography', tags: ['navigation', 'places', 'travel'] },
    { name: 'Music', iconName: 'MusicNote03', category: 'Music', tags: ['sound', 'audio', 'song'] },
    { name: 'PieChart', iconName: 'Target02', category: 'Math', tags: ['data', 'statistics', 'graph'] },
    { name: 'RocketTarget', iconName: 'Target01', category: 'Science', tags: ['space', 'launch', 'speed'] },
    { name: 'Shield', iconName: 'Crown03', category: 'General', tags: ['security', 'protection', 'safety'] },
    { name: 'Terminal', iconName: 'CommandLine', category: 'Computer Science', tags: ['coding', 'cli', 'tech'] },
    // Language icons
    { name: 'LanguageCircle', iconName: 'LanguageCircle', category: 'Languages', tags: ['translation', 'foreign', 'speech', 'communication', 'global', 'linguistics'] },
    { name: 'LanguageSkill', iconName: 'LanguageSkill', category: 'Languages', tags: ['language', 'skill', 'learning', 'education'] },
    { name: 'LanguageSquare', iconName: 'LanguageSquare', category: 'Languages', tags: ['translation', 'foreign', 'speech', 'communication', 'global', 'linguistics'] },
    // Computer Science icons
    { name: 'Api', iconName: 'Api', category: 'Computer Science', tags: ['api', 'rest', 'backend', 'interface'] },
    { name: 'ApiGateway', iconName: 'ApiGateway', category: 'Computer Science', tags: ['api', 'gateway', 'aws', 'cloud'] },
    { name: 'AwsLambda', iconName: 'AwsLambda', category: 'Computer Science', tags: ['aws', 'lambda', 'serverless', 'cloud'] },
    { name: 'Bash', iconName: 'Bash', category: 'Computer Science', tags: ['bash', 'shell', 'terminal', 'linux'] },
    { name: 'Bucket', iconName: 'Bucket', category: 'Computer Science', tags: ['bucket', 'storage', 'aws', 's3'] },
    { name: 'Bug01', iconName: 'Bug01', category: 'Computer Science', tags: ['bug', 'error', 'debug', 'issue'] },
    { name: 'Bug02', iconName: 'Bug02', category: 'Computer Science', tags: ['bug', 'error', 'debug', 'issue'] },
    { name: 'CProgramming', iconName: 'CProgramming', category: 'Computer Science', tags: ['c', 'programming', 'language', 'code'] },
    { name: 'Cpp', iconName: 'Cpp', category: 'Computer Science', tags: ['cpp', 'c++', 'programming', 'language', 'code'] },
    { name: 'CodeFolder', iconName: 'CodeFolder', category: 'Computer Science', tags: ['code', 'folder', 'project', 'directory'] },
    { name: 'ComputerProgramming01', iconName: 'ComputerProgramming01', category: 'Computer Science', tags: ['programming', 'coding', 'dev', 'software'] },
    { name: 'ComputerProgramming02', iconName: 'ComputerProgramming02', category: 'Computer Science', tags: ['programming', 'coding', 'dev', 'software'] },
    { name: 'ComputerTerminal01', iconName: 'ComputerTerminal01', category: 'Computer Science', tags: ['terminal', 'cli', 'command', 'console'] },
    { name: 'ComputerTerminal02', iconName: 'ComputerTerminal02', category: 'Computer Science', tags: ['terminal', 'cli', 'command', 'console'] },
    // Science icons
    { name: 'Acceleration', iconName: 'Acceleration', category: 'Science', tags: ['physics', 'speed', 'motion', 'velocity'] },
    { name: 'Atom', iconName: 'Atom01', category: 'Science', tags: ['physics', 'science', 'energy', 'nuclear', 'lab', 'quantum'] },
    { name: 'Atom02', iconName: 'Atom02', category: 'Science', tags: ['physics', 'science', 'energy', 'nuclear', 'lab', 'quantum'] },
    { name: 'Bacteria', iconName: 'Bacteria', category: 'Science', tags: ['biology', 'microbe', 'germ', 'pathogen'] },
    { name: 'BlackHole', iconName: 'BlackHole', category: 'Science', tags: ['space', 'astronomy', 'physics', 'cosmos'] },
    { name: 'BlackHole01', iconName: 'BlackHole01', category: 'Science', tags: ['space', 'astronomy', 'physics', 'cosmos'] },
    { name: 'BoundingBox', iconName: 'BoundingBox', category: 'Science', tags: ['geometry', 'box', 'frame', 'selection'] },
    { name: 'Cells', iconName: 'Cells', category: 'Science', tags: ['biology', 'cell', 'organism', 'microscopic'] },
    { name: 'Gravity', iconName: 'Gravity', category: 'Science', tags: ['physics', 'force', 'attraction', 'weight'] },
    { name: 'Magnet', iconName: 'Magnet', category: 'Science', tags: ['physics', 'magnetism', 'attraction', 'force'] },
    { name: 'Magnet01', iconName: 'Magnet01', category: 'Science', tags: ['physics', 'magnetism', 'attraction', 'force'] },
    { name: 'Magnet02', iconName: 'Magnet02', category: 'Science', tags: ['physics', 'magnetism', 'attraction', 'force'] },
    { name: 'Molecules', iconName: 'Molecules', category: 'Science', tags: ['chemistry', 'molecular', 'atomic', 'science'] },
    { name: 'Nanotechnology', iconName: 'NanoTechnology', category: 'Science', tags: ['technology', 'nano', 'science', 'innovation'] },
    { name: 'Pendulum', iconName: 'Pendulum', category: 'Science', tags: ['physics', 'motion', 'oscillation', 'time'] },
    { name: 'Prism', iconName: 'Prism', category: 'Science', tags: ['optics', 'light', 'refraction', 'spectrum'] },
    { name: 'Prism01', iconName: 'Prism01', category: 'Science', tags: ['optics', 'light', 'refraction', 'spectrum'] },
    { name: 'Pulley', iconName: 'Pulley', category: 'Science', tags: ['physics', 'mechanics', 'simple machine', 'lift'] },
    { name: 'Robot01', iconName: 'Robot01', category: 'Science', tags: ['technology', 'robot', 'automation', 'ai'] },
    { name: 'Robot02', iconName: 'Robot02', category: 'Science', tags: ['technology', 'robot', 'automation', 'ai'] },
    { name: 'Robotic', iconName: 'Robotic', category: 'Science', tags: ['technology', 'robot', 'automation', 'ai'] },
    { name: 'SolarSystem', iconName: 'SolarSystem', category: 'Science', tags: ['space', 'astronomy', 'planets', 'cosmos'] },
    { name: 'SolarSystem01', iconName: 'SolarSystem01', category: 'Science', tags: ['space', 'astronomy', 'planets', 'cosmos'] },
    { name: 'Submerge', iconName: 'Submerge', category: 'Science', tags: ['water', 'depth', 'submarine', 'ocean'] },
    { name: 'TestTube', iconName: 'TestTube', category: 'Science', tags: ['chemistry', 'lab', 'experiment', 'science'] },
    { name: 'TestTube01', iconName: 'TestTube01', category: 'Science', tags: ['chemistry', 'lab', 'experiment', 'science'] },
    { name: 'TestTube02', iconName: 'TestTube02', category: 'Science', tags: ['chemistry', 'lab', 'experiment', 'science'] },
    { name: 'TestTube03', iconName: 'TestTube03', category: 'Science', tags: ['chemistry', 'lab', 'experiment', 'science'] },
    { name: 'Ufo', iconName: 'Ufo', category: 'Science', tags: ['space', 'alien', 'ufo', 'extraterrestrial'] },
    { name: 'Ufo01', iconName: 'Ufo01', category: 'Science', tags: ['space', 'alien', 'ufo', 'extraterrestrial'] },
    { name: 'WindTurbine', iconName: 'WindTurbine', category: 'Science', tags: ['energy', 'wind', 'renewable', 'power'] },
    // Math icons
    { name: 'BoardMath', iconName: 'BoardMath', category: 'Math', tags: ['mathematics', 'math', 'board', 'teaching'] },
    // ... (rest of the code remains the same)
    { name: '1stBracket', iconName: '1stBracket', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'algebra'] },
    { name: '1stBracketCircle', iconName: '1stBracketCircle', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'circle', 'algebra'] },
    { name: '1stBracketSquare', iconName: '1stBracketSquare', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'square', 'algebra'] },
    { name: '2ndBracket', iconName: '2ndBracket', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'algebra'] },
    { name: '2ndBracketCircle', iconName: '2ndBracketCircle', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'circle', 'algebra'] },
    { name: '2ndBracketSquare', iconName: '2ndBracketSquare', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'square', 'algebra'] },
    { name: '3rdBracket', iconName: '3rdBracket', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'algebra'] },
    { name: '3rdBracketCircle', iconName: '3rdBracketCircle', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'circle', 'algebra'] },
    { name: '3rdBracketSquare', iconName: '3rdBracketSquare', category: 'Math', tags: ['math', 'brackets', 'parentheses', 'square', 'algebra'] },
    { name: 'Absolute', iconName: 'Absolute', category: 'Math', tags: ['math', 'absolute value', 'numbers'] },
    { name: 'Acute', iconName: 'Acute', category: 'Math', tags: ['math', 'angles', 'geometry'] },
    { name: 'Alpha', iconName: 'Alpha', category: 'Math', tags: ['math', 'greek', 'alpha', 'letters'] },
    { name: 'AlphaCircle', iconName: 'AlphaCircle', category: 'Math', tags: ['math', 'greek', 'alpha', 'circle', 'letters'] },
    { name: 'AlphaSquare', iconName: 'AlphaSquare', category: 'Math', tags: ['math', 'greek', 'alpha', 'square', 'letters'] },
    { name: 'Angle', iconName: 'Angle', category: 'Math', tags: ['math', 'angles', 'geometry'] },
    { name: 'Angle01', iconName: 'Angle01', category: 'Math', tags: ['math', 'angles', 'geometry'] },
    { name: 'ApproximatelyEqual', iconName: 'ApproximatelyEqual', category: 'Math', tags: ['math', 'approximation', 'equality', 'symbols'] },
    { name: 'ApproximatelyEqualCircle', iconName: 'ApproximatelyEqualCircle', category: 'Math', tags: ['math', 'approximation', 'equality', 'circle', 'symbols'] },
    { name: 'ApproximatelyEqualSquare', iconName: 'ApproximatelyEqualSquare', category: 'Math', tags: ['math', 'approximation', 'equality', 'square', 'symbols'] },
    { name: 'Beta', iconName: 'Beta', category: 'Math', tags: ['math', 'greek', 'beta', 'letters'] },
    { name: 'Cone', iconName: 'Cone01', category: 'Math', tags: ['math', 'geometry', '3d', 'shapes'] }
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

  // AI Autofill state
  const [autoFillText, setAutoFillText] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleAutoFill = useCallback(async () => {
    if (!autoFillText.trim() || isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const classNames = classes.map((c: any) => c.name).join(', ');
      const today = format(new Date(), 'yyyy-MM-dd');
      const dayOfWeek = format(new Date(), 'EEEE');
      // Build compact 14-day reference so the AI doesn't do calendar math
      const dateRef = (() => {
        const now = new Date();
        const lines: string[] = [];
        for (let i = 0; i <= 13; i++) {
          const d = addDays(now, i);
          const label = i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : '';
          lines.push(`${format(d, 'EEE MMM d')} = ${format(d, 'yyyy-MM-dd')}${label ? ` (${label})` : ''}`);
        }
        return lines.join(', ');
      })();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are helping a student fill out a homework form. Today is ${dayOfWeek}, ${today}.

Date reference (use these exact dates): ${dateRef}

Available classes: ${classNames}
Priority options: low, medium, high

The student typed: "${autoFillText}"

Return ONLY a JSON object with whichever fields you can determine:
- "title": string (the homework title/name)
- "description": string (any extra details)
- "dueDate": string (use the date reference above to pick the correct yyyy-MM-dd date)
- "priority": "low" | "medium" | "high"
- "className": string (must exactly match one of the available classes)
- "links": array of objects [{"title": "Platform Name (e.g., Google Docs, Canvas)", "url": "https://example.com"}] (if the user provides links, smartly infer the title based on the website domain or known service, rather than something generic)

Only include fields you are confident about. Omit unknown fields.
Return ONLY valid JSON, no explanation, no markdown.`,
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

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updates: any = {};

        if (parsed.title) updates.title = parsed.title;
        if (parsed.description) updates.description = parsed.description;
        if (parsed.priority && ['low', 'medium', 'high'].includes(parsed.priority)) {
          updates.priority = parsed.priority;
        }
        if (parsed.dueDate) {
          const d = new Date(parsed.dueDate + 'T12:00:00');
          if (!isNaN(d.getTime())) updates.dueDate = d;
        }
        if (parsed.className) {
          const matchedClass = classes.find((c: any) =>
            c.name.toLowerCase() === parsed.className.toLowerCase()
          );
          if (matchedClass) updates.classId = matchedClass.id;
        }
        if (parsed.links && Array.isArray(parsed.links)) {
          updates.links = parsed.links.filter((l: any) => l.title && l.url);
        }

        if (Object.keys(updates).length > 0) {
          setNewHomework(prev => ({ ...prev, ...updates }));
          setAutoFillText('');
        }
      }
    } catch (error) {
      console.error('Autofill error:', error);
    } finally {
      setIsAutoFilling(false);
    }
  }, [autoFillText, isAutoFilling, classes]);

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

  // Show welcome letter after onboarding completion
  const handleShowWelcomeLetter = () => {
    setShowOnboarding(false);
    setShowWelcomeLetter(true);
  };

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
    red: '#F9A8A8',     // pastel red
    blue: '#93C5FD',    // pastel blue
    yellow: '#FCD39D',  // pastel amber
    green: '#86EFAC',   // pastel green
    purple: '#C4B5FD',  // pastel purple
    pink: '#F9A8D4',    // pastel pink
    teal: '#99F6E4',    // pastel teal
    gray: '#CBD5E1'     // pastel slate
  };

  const headerColors = {
    red: '#DC2626',     // red-600
    blue: '#2563EB',    // blue-600
    yellow: '#D97706',  // amber-600
    green: '#16A34A',   // green-600
    purple: '#7C3AED',  // purple-600
    pink: '#DB2777',    // pink-600
    teal: '#0D9488',    // teal-600
    gray: '#475569'     // slate-600
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

  // Memoized: test filtering logic
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const testDate = new Date(test.testDate + 'T00:00:00');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);      // First apply status/type filter
      let matches = true;
      switch (testFilter) {
        case 'upcoming':
          matches = testDate >= today;
          break;
        case 'taken':
          matches = testDate < today;
          break;
        case 'alpha_only':
          matches = test.testType === 'ALPHA';
          break;
        case 'beta_only':
          matches = test.testType === 'BETA';
          break;
        case 'exams':
          matches = ['exam', 'midterm', 'final'].includes(test.testType?.toLowerCase() || '');
          break;
        case 'quizzes':
          matches = ['quiz', 'Quiz'].includes(test.testType || '');
          break;
        default:
          matches = true;
      }

      if (!matches) return false;

      // Then apply search filter
      if (testSearch.trim()) {
        const searchLower = testSearch.toLowerCase();
        return (
          test.title.toLowerCase().includes(searchLower) ||
          test.description?.toLowerCase().includes(searchLower) ||
          classes.find(c => c.id === test.classId)?.name.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [tests, testFilter, testSearch, classes]);

  // Memoized: homework filtering logic
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter(hw => {
      // First apply status filter
      let matches = true;
      switch (homeworkFilter) {
        case 'completed':
          matches = hw.completed;
          break;
        case 'incomplete':
          matches = !hw.completed;
          break;
        case 'pinned':
          matches = hw.pinned;
          break;
        default:
          matches = true;
      }

      if (!matches) return false;

      // Then apply search filter
      if (homeworkSearch.trim()) {
        const searchLower = homeworkSearch.toLowerCase();
        return (
          hw.title.toLowerCase().includes(searchLower) ||
          hw.description?.toLowerCase().includes(searchLower) ||
          classes.find(c => c.id === hw.classId)?.name.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [homeworks, homeworkFilter, homeworkSearch, classes]);

  // Memoize the processed class data to prevent re-renders
  const processedClasses = useMemo(() => {
    return classes.map((cls: any, index: number) => {
      const classTests = filteredTests.filter((t: any) => {
        const testDate = new Date(t.testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.classId === cls.id && t.status !== 'taken' && t.status !== 'completed' && testDate >= today;
      });

      // Get all homeworks for this class
      const allClassHomeworks = filteredHomeworks
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
        dueDateIcon: <HugeIcon name="Calendar02" size={12} className="h-3 w-3 text-sky-400 dark:text-sky-500" />,
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
  }, [classes, filteredHomeworks, filteredTests, getClassColor, isHomeworkArchived]);

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
      await addClass(newClassName, newClassIcon as any);
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
      setAutoFillText('');

      setShowAddHomework(false);
    } catch (error: any) {
      if (!handlePlanLimitError(error)) {
        toastError('Failed to add homework', 'Please try again');
      }
      console.error('Error adding homework:', error);
    }
  };

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsTestDetailModalOpen(true);
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
                        className="p-2.5 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 md:hidden transition-all duration-300"
                      >
                        <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showClasses ? 'rotate-90' : 'rotate-0'}`} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Nav-pill style action buttons */}
                    <div 
                      className="flex items-center gap-0 p-1 bg-[#dbeafe]/60 dark:bg-[#dbeafe]/10 backdrop-blur-md rounded-full shadow-sm border border-[#93c5fd]/50 dark:border-[#93c5fd]/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {homeworks.length > 0 && (
                        <>
                          <div
                            className="relative flex items-center h-8"
                            onClick={(e) => {
                              if (!isHomeworkSearchExpanded) {
                                setIsHomeworkSearchExpanded(true);
                                // Auto-focus the input after animation or immediately
                                setTimeout(() => {
                                  const input = document.getElementById('homework-search-input');
                                  input?.focus();
                                }, 10);
                              }
                            }}
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                width: isHomeworkSearchExpanded || homeworkSearch ? (window.innerWidth < 640 ? 128 : 160) : 32
                              }}
                              className="relative h-full flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-l-full border-r border-sky-500/20 dark:border-sky-400/20 transition-all overflow-hidden"
                              style={{ minWidth: isHomeworkSearchExpanded || homeworkSearch ? undefined : '32px' }}
                            >
                              <HugeIcon
                                name="Search01"
                                size={14}
                                className={`absolute left-[9px] h-3.5 w-3.5 text-sky-700 dark:text-sky-300 transition-colors ${isHomeworkSearchExpanded || homeworkSearch ? 'opacity-90' : 'opacity-100'}`}
                              />
                              <motion.input
                                id="homework-search-input"
                                type="text"
                                placeholder="Search homework..."
                                value={homeworkSearch}
                                onChange={(e) => setHomeworkSearch(e.target.value)}
                                onBlur={() => {
                                  if (!homeworkSearch) setIsHomeworkSearchExpanded(false);
                                }}
                                animate={{ opacity: isHomeworkSearchExpanded || homeworkSearch ? 1 : 0 }}
                                className="w-full h-full pl-8 pr-3 text-[12px] font-semibold bg-transparent text-sky-700 dark:text-sky-300 placeholder-sky-700/40 dark:placeholder-sky-300/40 border-0 focus:ring-0 outline-none"
                              />
                            </motion.div>
                          </div>

                          <Select value={homeworkFilter} onValueChange={(value: string) => setHomeworkFilter(value)}>
                            <SelectTrigger size="sm" hideIcon className="w-8 h-8 p-0 flex items-center justify-center text-sky-700 dark:text-sky-300 rounded-r-full bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 transition-all border-0 focus:ring-0 shadow-none shrink-0">
                              <HugeIcon name="Filter" size={14} className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />
                            </SelectTrigger>
                            <SelectContent className="w-56 bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl p-1.5" position="popper" sideOffset={4}>
                              <SelectGroup>
                                <SelectLabel className="px-3 py-2 text-[10px] font-bold text-sky-500/50 uppercase tracking-widest">Status</SelectLabel>
                                <SelectItem value="all" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">All Homework</SelectItem>
                                <SelectItem value="completed" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Completed</SelectItem>
                                <SelectItem value="incomplete" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Incomplete</SelectItem>
                                <SelectItem value="pinned" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Pinned</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 ml-1.5 mr-1.5" />
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelectionMode) {
                                // First clear all selections
                                homeworkListRefs.current.forEach(ref => {
                                  ref?.clearSelection();
                                });
                                // Then exit selection mode after a short delay
                                setTimeout(() => {
                                  setIsSelectionMode(false);
                                }, 50);
                              } else {
                                setIsSelectionMode(true);
                              }
                            }}
                            whileHover="hover"
                            initial="initial"
                            className={`group relative flex items-center h-8 rounded-full transition-all active:scale-95 overflow-hidden border-0 ${isSelectionMode
                                ? 'text-white bg-sky-500 dark:bg-sky-600'
                                : 'text-sky-700 dark:text-sky-300 bg-sky-500/25 dark:bg-sky-400/20'
                              }`}
                          >
                            <div className="flex items-center justify-center w-8 h-8 shrink-0">
                              {isSelectionMode ? (
                                <HugeIcon name="CheckmarkCircle02" size={14} className="h-3.5 w-3.5" />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                >
                                  <path d="M15 2.5H12C7.52166 2.5 5.28249 2.5 3.89124 3.89124C2.5 5.28249 2.5 7.52166 2.5 12C2.5 16.4783 2.5 18.7175 3.89124 20.1088C5.28249 21.5 7.52166 21.5 12 21.5C16.4783 21.5 18.7175 21.5 20.1088 20.1088C21.5 18.7175 21.5 16.4783 21.5 12V10" />
                                  <path d="M8.5 10L12 13.5L21.0002 3.5" />
                                </svg>
                              )}
                            </div>
                            <motion.span 
                              variants={{
                                initial: { width: isSelectionMode ? 'auto' : 0, opacity: isSelectionMode ? 1 : 0, marginRight: isSelectionMode ? 12 : 0 },
                                hover: { width: 'auto', opacity: 1, marginRight: 12 }
                              }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="text-[13px] font-semibold whitespace-nowrap overflow-hidden"
                            >
                              {isSelectionMode ? 'Done' : 'Select'}
                            </motion.span>
                          </motion.button>
                          <div className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 ml-1.5 mr-1.5" />
                        </>
                      )}
                      <div className="relative flex items-center h-8">
                        <motion.div
                          initial={false}
                          animate={{ width: isAddMenuExpanded ? 165 : 32 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="relative h-full flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-full overflow-hidden"
                          onMouseEnter={() => setIsAddMenuExpanded(true)}
                          onMouseLeave={() => setIsAddMenuExpanded(false)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddClass(true);
                            }}
                            className="flex items-center px-3 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }}
                          >
                            Class
                          </button>
                          <div 
                            className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 shrink-0 transition-opacity duration-200" 
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }} 
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddHomework(true);
                            }}
                            className="flex items-center pl-3 pr-7 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }}
                          >
                            Homework
                          </button>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="absolute h-3.5 w-3.5 text-sky-700 dark:text-sky-300 pointer-events-none transition-all duration-200"
                            style={{ right: isAddMenuExpanded ? '12px' : '9px', top: '50%', transform: 'translateY(-50%)' }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 4V20M20 12H4" />
                          </svg>
                        </motion.div>
                      </div>
                      {showTestsInClassCards && (
                        <motion.div
                          initial={false}
                          animate={{ width: isAddTestExpanded ? 72 : 32 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="relative h-8 flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-full overflow-hidden cursor-pointer shrink-0"
                          onMouseEnter={() => setIsAddTestExpanded(true)}
                          onMouseLeave={() => setIsAddTestExpanded(false)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddTest(true);
                          }}
                        >
                          <span
                            className="flex items-center pl-3 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddTestExpanded ? 1 : 0 }}
                          >
                            Test
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="absolute h-3.5 w-3.5 text-sky-700 dark:text-sky-300 pointer-events-none transition-all duration-200"
                            style={{ right: isAddTestExpanded ? '10px' : '9px', top: '50%', transform: 'translateY(-50%)' }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 4V20M20 12H4" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    {!showTestsInClassCards && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClasses(!showClasses);
                        }}
                        className="p-2.5 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hidden md:flex items-center justify-center transition-all duration-300"
                      >
                        <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showClasses ? 'rotate-90' : 'rotate-0'}`} />
                      </button>
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
                  className="bg-[#f5f9fc] dark:bg-sky-500/[0.03] backdrop-blur-md rounded-[32px] border border-sky-100 dark:border-sky-500/10 p-12 sm:p-20 text-center shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.02] to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center mx-auto mb-6 border border-sky-100 dark:border-sky-500/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <HugeIcon name="Layers01" size={32} className="h-8 w-8 text-sky-500/40 dark:text-sky-400/40" />
                    </div>
                    <h3 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">No classes yet</h3>
                    <p className="text-sky-600/50 dark:text-sky-400/40 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                      Get started by adding your first class to organize your schoolwork and track your progress.
                    </p>
                    <button
                      onClick={() => setShowAddClass(true)}
                      className="mt-8 px-6 py-2.5 bg-[#ebf6b5] hover:bg-[#e0efa0] text-sky-900 font-bold rounded-xl border border-[#d4e88e] transition-all active:scale-95 shadow-sm"
                    >
                      Add Your First Class
                    </button>
                  </div>
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
                        className={`group rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-500 border bg-[#f5f9fc] dark:bg-gray-900 ${showFrowny && hasOverdueHomework
                          ? 'border-red-300 dark:border-red-500/40 shadow-red-100 dark:shadow-red-900/20 shadow-md'
                          : 'border-sky-100 dark:border-white/5'
                          }`}

                      >
                        <div
                          className="p-3 mb-3 rounded-xl transition-colors duration-500"
                          style={{ backgroundColor: `${getClassColor(index)}40` }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center w-full gap-3">
                              <div className="shrink-0 transition-transform group-hover:scale-110 duration-500">
                                <ClassIconRenderer
                                  iconName={cls.icon}
                                  className="w-6 h-6"
                                  style={{ color: getHeaderColor(index) }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className="text-base font-bold truncate tracking-tight uppercase"
                                  style={{ color: getHeaderColor(index) }}
                                >
                                  {cls.name}
                                </h3>
                              </div>

                              {/* Summary counts */}
                              <div className="shrink-0 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                                {(() => {
                                  const activeCount = classHomeworks.filter((hw: any) => !hw.completed).length;
                                  const testCount = classTests.length;
                                  const parts: string[] = [];
                                  if (activeCount > 0) parts.push(`${activeCount} task${activeCount !== 1 ? 's' : ''}`);
                                  if (testCount > 0) parts.push(`${testCount} test${testCount !== 1 ? 's' : ''}`);
                                  const summary = parts.length > 0 ? parts.join(' · ') : 'No tasks';
                                  return (
                                    <span
                                      className="text-[11px] font-semibold tracking-wide opacity-50"
                                      style={{ color: getHeaderColor(index) }}
                                    >
                                      {summary}
                                    </span>
                                  );
                                })()}
                              </div>

                              <div className="flex flex-row items-center gap-1">
                                <Link
                                  href={`/classes/edit/${cls.id}`}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-sky-500 dark:text-gray-500 dark:hover:text-sky-400 hover:bg-sky-500/10 dark:hover:bg-sky-500/20 transition-all shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="Edit class"
                                >
                                  <HugeIcon name="Pen02" size={16} className="w-4 h-4" />
                                </Link>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClassToDelete({ id: cls.id, name: cls.name });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all shrink-0"
                                  aria-label="Delete class"
                                >
                                  <HugeIcon name="Delete02" size={16} className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 mt-1">
                          <PlayfulHomeworkList
                            ref={ref => {
                              if (ref) {
                                homeworkListRefs.current.set(`${cls.id}-main`, ref);
                              } else {
                                homeworkListRefs.current.delete(`${cls.id}-main`);
                              }
                            }}
                            items={classHomeworks.slice(0, 3)}
                            onItemToggle={handleHomeworkToggle}
                            onPinToggle={togglePinHomework}
                            onBulkDelete={handleBulkDelete}
                            onBulkMove={handleBulkMove}
                            availableClasses={classes.map((c, idx) => ({
                              id: c.id,
                              name: c.name,
                              icon: c.icon || 'BookOpen',
                              color: getHeaderColor(idx),
                              bgColor: getClassColor(idx)
                            }))}
                            isSelectionMode={isSelectionMode}
                            className={`transition-all duration-300 ${isSelectionMode ? 'opacity-60' : ''}`}
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
                                  ref={ref => {
                                    if (ref) {
                                      homeworkListRefs.current.set(`${cls.id}-expanded`, ref);
                                    } else {
                                      homeworkListRefs.current.delete(`${cls.id}-expanded`);
                                    }
                                  }}
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
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                  <span className="text-[11px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Upcoming Tests</span>
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                </div>
                              )}
                              <div className="space-y-0.5">
                                {classTests.map((test: any) => (
                                  <EnhancedTestCard
                                    key={test.id}
                                    test={test}
                                    classIcon={createClassIconComponent(cls.icon)}
                                    variant="list-item"
                                    onClick={() => handleTestClick(test)}
                                    className="hover:bg-sky-500/[0.03] rounded-lg -mx-2 px-2"
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {classHomeworks.length > 3 && (
                            <div className="text-xs text-center text-sky-600/30 dark:text-sky-400/30 pt-1">
                              {expandedClasses[cls.id] ? (
                                <button
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: false })}
                                  className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                                >
                                  Hide
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: true })}
                                  className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
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
                                className="text-xs text-sky-600/40 hover:text-sky-600 dark:text-sky-400/40 dark:hover:text-sky-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
                              >
                                <HugeIcon name="Archive" size={14} className="w-3.5 h-3.5" />
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
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                  <span className="text-[11px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider flex items-center gap-1.5">
                                    <HugeIcon name="Archive" size={12} className="w-3 h-3" />
                                    Archived
                                  </span>
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <PlayfulHomeworkList
                                  ref={ref => {
                                    if (ref) {
                                      homeworkListRefs.current.set(`${cls.id}-archived`, ref);
                                    } else {
                                      homeworkListRefs.current.delete(`${cls.id}-archived`);
                                    }
                                  }}
                                  items={classArchivedHomeworks}
                                  onItemToggle={handleHomeworkToggle}
                                  onPinToggle={togglePinHomework}
                                  className="space-y-2 opacity-50"
                                />
                                <div className="flex items-center justify-center gap-3 pt-3">
                                  <button
                                    onClick={() => setShowArchivedForClass(prev => ({ ...prev, [cls.id]: false }))}
                                    className="text-xs text-sky-600/30 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                                  >
                                    Hide archived
                                  </button>
                                  <span className="text-sky-200 dark:text-gray-700">·</span>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button
                                        className="text-xs text-red-400/60 hover:text-red-500 transition-colors"
                                      >
                                        Delete all archived
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete all archived?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete {classArchivedHomeworks.length} archived assignment{classArchivedHomeworks.length > 1 ? 's' : ''} from this class. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            for (const hw of classArchivedHomeworks) {
                                              await deleteHomework(hw.id);
                                            }
                                            setShowArchivedForClass(prev => ({ ...prev, [cls.id]: false }));
                                          }}
                                        >
                                          Delete All
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
          <div key="tests" className="mt-8 mb-10" data-tour="tests">
            <div>
              <div
                className={`mb-3 group cursor-pointer`}
                onClick={() => handleToggleTests(!showTests)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                        Tests & Exams
                      </h2>
                    </div>
                    <div
                      className="p-2.5 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 md:hidden transition-all duration-300"
                    >
                      <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showTests ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Nav-pill style action buttons — matching My Classes */}
                    <div
                      className="flex items-center gap-0 p-1 bg-[#dbeafe]/60 dark:bg-[#dbeafe]/10 backdrop-blur-md rounded-full shadow-sm border border-[#93c5fd]/50 dark:border-[#93c5fd]/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        className="relative flex items-center h-8"
                        onClick={(e) => {
                          if (!isTestSearchExpanded) {
                            setIsTestSearchExpanded(true);
                            // Auto-focus the input after animation or immediately
                            setTimeout(() => {
                              const input = document.getElementById('test-search-input');
                              input?.focus();
                            }, 10);
                          }
                        }}
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            width: isTestSearchExpanded || testSearch ? (window.innerWidth < 640 ? 128 : 160) : 32
                          }}
                          className="relative h-full flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-l-full border-r border-sky-500/20 dark:border-sky-400/20 transition-all overflow-hidden"
                          style={{ minWidth: isTestSearchExpanded || testSearch ? undefined : '32px' }}
                        >
                          <HugeIcon 
                            name="Search01" 
                            size={14} 
                            className={`absolute left-[9px] h-3.5 w-3.5 text-sky-700 dark:text-sky-300 transition-colors ${isTestSearchExpanded || testSearch ? 'opacity-90' : 'opacity-100'}`} 
                          />
                          <motion.input
                            id="test-search-input"
                            type="text"
                            placeholder="Search tests..."
                            value={testSearch}
                            onChange={(e) => setTestSearch(e.target.value)}
                            onBlur={() => {
                              if (!testSearch) setIsTestSearchExpanded(false);
                            }}
                            animate={{ opacity: isTestSearchExpanded || testSearch ? 1 : 0 }}
                            className="w-full h-full pl-8 pr-3 text-[12px] font-semibold bg-transparent text-sky-700 dark:text-sky-300 placeholder-sky-700/40 dark:placeholder-sky-300/40 border-0 focus:ring-0 outline-none"
                          />
                        </motion.div>
                      </div>

                      <Select value={testFilter} onValueChange={(value: string) => handleTestFilterChange(value)}>
                        <SelectTrigger size="sm" hideIcon className="w-8 h-8 p-0 flex items-center justify-center text-sky-700 dark:text-sky-300 rounded-r-full bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 transition-all border-0 focus:ring-0 shadow-none shrink-0">
                          <HugeIcon name="Filter" size={14} className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />
                        </SelectTrigger>
                        <SelectContent className="w-56 bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl p-1.5" position="popper" sideOffset={4}>
                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-[10px] font-bold text-sky-500/50 uppercase tracking-widest">Visibility</SelectLabel>
                            <SelectItem value="all" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">All Tests</SelectItem>
                            <SelectItem value="upcoming" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Upcoming</SelectItem>
                            <SelectItem value="taken" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Taken</SelectItem>
                          </SelectGroup>
                          
                          <SelectSeparator className="my-1.5 bg-sky-100/50 dark:bg-gray-800/50" />
                          
                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-[10px] font-bold text-sky-500/50 uppercase tracking-widest">Test Types</SelectLabel>
                            <SelectItem value="alpha_only" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">ALPHA</SelectItem>
                            <SelectItem value="beta_only" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">BETA</SelectItem>
                            <SelectItem value="exams" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Exams</SelectItem>
                            <SelectItem value="quizzes" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Quizzes</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 ml-1.5 mr-1.5" />
                      <motion.div
                        initial={false}
                        animate={{ width: isAddTestExpanded ? 72 : 32 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="relative h-8 flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-full overflow-hidden cursor-pointer shrink-0"
                        onMouseEnter={() => setIsAddTestExpanded(true)}
                        onMouseLeave={() => setIsAddTestExpanded(false)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddTest(true);
                        }}
                      >
                        <span
                          className="flex items-center pl-3 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                          style={{ opacity: isAddTestExpanded ? 1 : 0 }}
                        >
                          Test
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="absolute h-3.5 w-3.5 text-sky-700 dark:text-sky-300 pointer-events-none transition-all duration-200"
                          style={{ right: isAddTestExpanded ? '10px' : '9px', top: '50%', transform: 'translateY(-50%)' }}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 4V20M20 12H4" />
                        </svg>
                      </motion.div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTests(!showTests);
                      }}
                      className="p-2.5 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hidden md:flex items-center justify-center transition-all duration-300"
                    >
                      <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showTests ? 'rotate-90' : 'rotate-0'}`} />
                    </button>
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
                    className="bg-[#f5f9fc] dark:bg-sky-500/[0.03] backdrop-blur-md rounded-[32px] border border-sky-100 dark:border-sky-500/10 p-12 sm:p-20 text-center shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.02] to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center mx-auto mb-6 border border-sky-100 dark:border-sky-500/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <HugeIcon name="Calendar02" size={32} className="h-8 w-8 text-sky-500/40 dark:text-sky-400/40" />
                      </div>
                      <h3 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">No tests scheduled</h3>
                      <p className="text-sky-600/50 dark:text-sky-400/40 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                        Start by adding your first test to keep track of your exam schedule and academic performance.
                      </p>
                      <button
                        onClick={() => setShowAddTest(true)}
                        className="mt-8 px-6 py-2.5 bg-[#ebf6b5] hover:bg-[#e0efa0] text-sky-900 font-bold rounded-xl border border-[#d4e88e] transition-all active:scale-95 shadow-sm"
                      >
                        Add Your First Test
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <StatusGroupedTestList
                    tests={filteredTests}
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

  // Bulk action handlers
  const handleBulkDelete = useCallback((ids: string[]) => {
    ids.forEach(id => {
      const homework = homeworks.find(hw => hw.id === id);
      if (homework) {
        deleteHomework(homework.id);
      }
    });
  }, [homeworks, deleteHomework]);

  const handleBulkMove = useCallback((ids: string[], targetClassId: string) => {
    ids.forEach(id => {
      const homework = homeworks.find(hw => hw.id === id);
      if (homework && homework.classId !== targetClassId) {
        // Update the homework class directly in the database
        updateHomework(id, { classId: targetClassId });
      }
    });
  }, [homeworks, updateHomework]);

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

            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight">
                {timeGreeting.text}, {full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <button
                onClick={() => setShowBracket(true)}
                className="shrink-0 group relative p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all duration-300 active:scale-90 self-center"
                title="Task Bracket"
              >
                <HugeIcon name="Sword03" size={16} className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 dark:text-sky-400 group-hover:text-sky-500 transition-colors" />
                <span className="absolute inset-0 rounded-xl animate-ping bg-sky-400/10 pointer-events-none" style={{ animationDuration: '3s' }} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Calendar + Coming Up + Email */}
        <div className={`grid grid-cols-1 ${hasUpcoming ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 mb-8 h-auto lg:h-[320px]`}>
          <div className="hidden md:block h-[320px]">
            <MiniCalendar />
          </div>
          <div className="block md:hidden">
            <MobileWeekCalendar />
          </div>
          {hasUpcoming && (
            <div className="h-[320px]">
              <ComingUp />
            </div>
          )}
          <div className="hidden lg:block h-[320px]">
            <EmailWidget />
          </div>
        </div>

        {/* Render sections in user-defined order */}
        {sectionOrder.map(sectionId => renderSection(sectionId))}

        {/* Task Bracket Modal */}
        <TaskBracket
          open={showBracket}
          onClose={() => setShowBracket(false)}
          tasks={homeworks.filter((hw: any) => !hw.completed).map((hw: any) => ({ id: hw.id, title: hw.title }))}
        />

        <AnimatePresence>
          {showAddClass && (
            <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-100">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100/60 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                    Add New Class
                  </h2>
                  <button
                    onClick={() => setShowAddClass(false)}
                    className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                  >
                    <HugeIcon name="Cancel01" size={16} className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Class Name Input */}
                  <div>
                    <Label htmlFor="className" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1 mb-2 block">
                      Class Name
                    </Label>
                    <Input
                      id="className"
                      type="text"
                      value={newClassName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value)}
                      placeholder="e.g., Mathematics 101"
                      className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none"
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
                            <span className="text-[10px] font-bold text-[#a8b86d] uppercase tracking-widest flex items-center gap-1.5">
                              <HugeIcon name="AiMagic" size={12} className="h-3 w-3" />
                              AI Suggestions
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAISuggest();
                              }}
                              disabled={isSuggestingIcons}
                              className="text-[10px] font-bold text-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1 uppercase tracking-widest"
                            >
                              {isSuggestingIcons ? (
                                <HugeIcon name="LoaderPinwheel" size={10} className="h-2.5 w-2.5 animate-spin" />
                              ) : (
                                <HugeIcon name="Rotate01" size={10} className="h-2.5 w-2.5" />
                              )}
                              {isSuggestingIcons ? 'Analyzing...' : 'Refresh'}
                            </button>
                          </div>
                          <div className="flex gap-2 p-2 bg-sky-50/40 dark:bg-sky-500/5 rounded-xl border border-sky-100/50 dark:border-sky-500/10 overflow-x-auto min-h-[52px]">
                            {aiSuggestions.map((icon) => (
                              <button
                                key={`suggest-${icon.name}`}
                                type="button"
                                onClick={() => setNewClassIcon(icon.iconName)}
                                className={`p-2.5 rounded-xl transition-all shrink-0 ${newClassIcon === icon.iconName
                                  ? 'bg-[#ebf6b5] text-sky-900 shadow-sm scale-110 border-[#d4e88e]'
                                  : 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-gray-800 hover:bg-sky-50 dark:hover:bg-gray-700 hover:scale-105'
                                  }`}
                                title={icon.name}
                              >
                                {(() => {
                                  return <HugeIcon name={icon.iconName} className="h-5 w-5" />;
                                })()}
                              </button>
                            ))}
                            {aiSuggestions.length === 0 && !isSuggestingIcons && (
                              <div className="flex items-center justify-center w-full min-h-[36px]">
                                <span className="text-[10px] text-sky-500 italic">
                                  Type more to get AI suggestions...
                                </span>
                              </div>
                            )}
                            {isSuggestingIcons && aiSuggestions.length === 0 && (
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                  <div key={i} className="w-10 h-10 bg-sky-100/40 dark:bg-gray-800 animate-pulse rounded-xl" />
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
                    <Label className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1 mb-2 block">
                      Choose an Icon
                    </Label>

                    {/* Search Input */}
                    <div className="relative mb-3">
                      <HugeIcon name="Search01" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 dark:text-sky-500" />
                      <Input
                        type="text"
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none"
                        autoComplete="off"
                      />
                    </div>

                    {/* Icon Grid */}
                    <div className="border border-sky-100 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                      <div className="max-h-64 overflow-y-auto">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                          <div key={category}>
                            <div className="sticky top-0 bg-sky-50/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-2 text-[9px] font-bold text-sky-500/80 uppercase tracking-[0.2em] border-b border-sky-100/50 dark:border-gray-700/50 z-10">
                              {category}
                            </div>
                            <div className="grid grid-cols-7 gap-1 p-2">
                              {icons.map(({ name, iconName }) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setNewClassIcon(iconName);
                                    setSearchQuery('');
                                  }}
                                  className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all ${newClassIcon === iconName
                                    ? 'bg-[#ebf6b5] text-sky-900 scale-105 shadow-sm border border-[#d4e88e]'
                                    : 'text-sky-700/60 dark:text-sky-300/60 hover:bg-sky-50 dark:hover:bg-gray-800 hover:text-sky-900 dark:hover:text-white hover:scale-110'
                                    }`}
                                  title={name}
                                >
                                  <HugeIcon name={iconName} className="h-5 w-5" />
                                  {newClassIcon === iconName && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#b5d565] rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {filteredIcons.length === 0 && (
                          <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-100/40 dark:bg-gray-800 mb-3">
                              <HugeIcon name="Search01" size={20} className="w-5 h-5 text-sky-500" />
                            </div>
                            <p className="text-sm text-sky-800 dark:text-sky-300">
                              No icons found
                            </p>
                            <p className="text-xs text-sky-500 mt-1">
                              Try a different search term
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Icon Info */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-sky-500 dark:text-sky-400">
                      <span>
                        Selected: <span className="font-semibold text-sky-900 dark:text-white">{newClassIcon}</span>
                      </span>
                      <span>{filteredIcons.length} icons available</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100/60 dark:border-gray-800">
                  <button
                    onClick={() => setShowAddClass(false)}
                    className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClass}
                    disabled={!newClassName.trim()}
                    className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Class
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Add Homework Modal */}
        <AnimatePresence>
          {showAddHomework && (
            <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                  <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                    Add New Homework
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddHomework(false);
                      setIsRecurringEnabled(false);
                      setRecurringConfig({ frequency: 'weekly' });
                    }}
                    className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                  >
                    <HugeIcon name="Cancel01" size={16} className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* AI Autofill */}
                  <div className="relative">
                    <div className="flex items-center gap-1.5 ml-1 mb-1.5">
                      <HugeIcon name="AiMagic" size={12} className="h-3 w-3 text-sky-500/60 dark:text-sky-400/60" />
                      <Label className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest">
                        Quick Fill
                      </Label>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={autoFillText}
                        onChange={(e) => setAutoFillText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && autoFillText.trim()) {
                            e.preventDefault();
                            handleAutoFill();
                          }
                        }}
                        placeholder='e.g., "Math ch5 exercises due friday high priority"'
                        className="w-full h-9 pl-3 pr-12 text-sm bg-sky-50/50 dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400/50 dark:placeholder-sky-500/50 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] focus:bg-white dark:focus:bg-gray-900 transition-colors"
                      />
                      <button
                        onClick={handleAutoFill}
                        disabled={!autoFillText.trim() || isAutoFilling}
                        className="absolute right-1 h-7 w-7 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Fill fields with AI"
                      >
                        {isAutoFilling ? (
                          <HugeIcon name="LoaderPinwheel" size={14} className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <HugeIcon name="ArrowUp02" size={14} className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-sky-100/60 dark:border-gray-800" />

                  <div className="space-y-4">
                    {/* Title Input - Large & Prominent */}
                    <div className="space-y-1.5">
                      <Label htmlFor="homeworkTitle" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                        <span className="tracking-widest">Title</span><span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="homeworkTitle"
                        type="text"
                        value={newHomework.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHomework({ ...newHomework, title: e.target.value })}
                        placeholder="Homework title..."
                        className="w-full h-9 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sm text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all font-normal outline-none"
                      />
                    </div>

                    {/* Metadata Grid - Compact & Efficient */}
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="class" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                          <span className="tracking-widest">Class</span><span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newHomework.classId}
                          onValueChange={(value) => setNewHomework({ ...newHomework, classId: value })}
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-[#ebf6b5]/10 hover:border-[#d4e88e] focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                            <SelectValue placeholder="Class" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl" position="popper" sideOffset={4}>
                            {classes.map((cls: any) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id}
                                className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg"
                              >
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="priority" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1">
                          Priority
                        </Label>
                        <Select
                          value={newHomework.priority}
                          onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as Priority })}
                        >
                          <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-[#ebf6b5]/10 hover:border-[#d4e88e] focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                            <SelectValue placeholder="Prio" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl" position="popper" sideOffset={4}>
                            <SelectItem value="low" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">Low</SelectItem>
                            <SelectItem value="medium" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">Medium</SelectItem>
                            <SelectItem value="high" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="dueDate" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                          <span className="tracking-widest">Due Date</span><span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              hoverScale={1}
                              tapScale={1}
                              className="w-full justify-start px-3 font-normal h-9 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 hover:bg-[#ebf6b5]/10 dark:hover:bg-[#ebf6b5]/5 hover:border-[#d4e88e] rounded-xl transition-all"
                            >
                              <HugeIcon name="Calendar02" size={14} className="mr-2 h-3.5 w-3.5 text-sky-500" />
                              <span className="text-left truncate">{format(newHomework.dueDate, 'MMM d')}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5">
                            <Calendar
                              mode="single"
                              selected={newHomework.dueDate}
                              onSelect={(date) => date && setNewHomework({ ...newHomework, dueDate: date })}
                              initialFocus
                              className="text-sky-900 dark:text-white rounded-2xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <HomeworkLinkInput
                      links={newHomework.links}
                      onChange={(links) => setNewHomework({ ...newHomework, links })}
                    />

                    {/* Description Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="homeworkDescription" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1">
                        Description
                      </Label>
                      <textarea
                        id="homeworkDescription"
                        value={newHomework.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewHomework({ ...newHomework, description: e.target.value })}
                        placeholder="Add some details..."
                        rows={2}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/30 focus:border-[#d4e88e] text-sm resize-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Recurring and Links - More Compact Footer Section */}
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center gap-2.5 p-1">
                      <Checkbox
                        id="recurringHomework"
                        checked={isRecurringEnabled}
                        onCheckedChange={(checked) => setIsRecurringEnabled(checked as boolean)}
                        className="size-5 rounded-md border-2 border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-600 data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-lime-400/40 outline-none"
                      />
                      <Label
                        htmlFor="recurringHomework"
                        className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest cursor-pointer select-none"
                      >
                        Make this recurring
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

                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddHomework(false);
                      setIsRecurringEnabled(false);
                      setRecurringConfig({ frequency: 'weekly' });
                    }}
                    className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddHomework}
                    disabled={!newHomework.title.trim() || !newHomework.classId}
                    className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Homework
                  </button>
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
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onShowLetter={handleShowWelcomeLetter}
          />
        )}
      </AnimatePresence>

      {/* Welcome Letter */}
      <AnimatePresence>
        {showWelcomeLetter && (
          <WelcomeLetter
            isOpen={showWelcomeLetter}
            onClose={() => setShowWelcomeLetter(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Recurring Homework Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] p-7 max-w-md w-full border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5"
            >
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-2">
                Delete Recurring Homework
              </h3>
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-6">
                How would you like to delete &quot;<span className="font-semibold text-sky-800 dark:text-sky-200">{deleteConfirm.title}</span>&quot;?
              </p>

              <div className="space-y-2.5 mb-6">
                <button
                  onClick={() => handleDeleteConfirm(false)}
                  className="w-full h-11 flex items-center justify-center text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/15 border border-sky-200 dark:border-sky-500/20 rounded-full transition-colors"
                >
                  Delete only this instance
                </button>
                <button
                  onClick={() => handleDeleteConfirm(true)}
                  className="w-full h-11 flex items-center justify-center text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-full transition-colors"
                >
                  Delete entire recurring series
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{classToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class and all of its homework and tests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (classToDelete) {
                  deleteClass(classToDelete.id);
                  setClassToDelete(null);
                }
              }}
            >
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

export default MainApp;