'use client';

import { useParams, useRouter } from 'next/navigation';
import { useClassContext, Class } from '@/context/ClassContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Loader2, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { iconMap, IconName } from '@/lib/icon-map';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';

// Available icons with their display names and semantic tags (same as MainApp)
const availableIcons = [
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
  { name: 'Cells', iconName: 'Cells', category: 'Science', tags: ['biology', 'cell', 'science', 'life'] },
  { name: 'Gravity', iconName: 'Gravity', category: 'Science', tags: ['physics', 'gravity', 'science'] },
  { name: 'Magnet', iconName: 'Magnet', category: 'Science', tags: ['magnet', 'physics', 'science', 'magnetic'] },
  { name: 'Magnet01', iconName: 'Magnet01', category: 'Science', tags: ['magnet', 'physics', 'science', 'magnetic'] },
  { name: 'Magnet02', iconName: 'Magnet02', category: 'Science', tags: ['magnet', 'physics', 'science', 'magnetic'] },
  { name: 'Molecules', iconName: 'Molecules', category: 'Science', tags: ['chemistry', 'molecule', 'science', 'structure'] },
  { name: 'NanoTechnology', iconName: 'NanoTechnology', category: 'Science', tags: ['nanotech', 'science', 'technology'] },
  { name: 'Pendulum', iconName: 'Pendulum', category: 'Science', tags: ['physics', 'pendulum', 'motion'] },
  { name: 'Prism', iconName: 'Prism', category: 'Science', tags: ['physics', 'prism', 'light', 'optics'] },
  { name: 'Prism01', iconName: 'Prism01', category: 'Science', tags: ['physics', 'prism', 'light', 'optics'] },
  { name: 'Pulley', iconName: 'Pulley', category: 'Science', tags: ['physics', 'pulley', 'mechanics'] },
  { name: 'Robot01', iconName: 'Robot01', category: 'Science', tags: ['robot', 'technology', 'science'] },
  { name: 'Robot02', iconName: 'Robot02', category: 'Science', tags: ['robot', 'technology', 'science'] },
  { name: 'Robotic', iconName: 'Robotic', category: 'Science', tags: ['robot', 'technology', 'science'] },
  { name: 'SolarSystem', iconName: 'SolarSystem', category: 'Science', tags: ['space', 'solar system', 'astronomy', 'science'] },
  { name: 'SolarSystem01', iconName: 'SolarSystem01', category: 'Science', tags: ['space', 'solar system', 'astronomy', 'science'] },
  { name: 'Submerge', iconName: 'Submerge', category: 'Science', tags: ['water', 'science', 'physics'] },
  { name: 'TestTube', iconName: 'TestTube', category: 'Science', tags: ['chemistry', 'test tube', 'lab', 'science'] },
  { name: 'TestTube01', iconName: 'TestTube01', category: 'Science', tags: ['chemistry', 'test tube', 'lab', 'science'] },
  { name: 'TestTube02', iconName: 'TestTube02', category: 'Science', tags: ['chemistry', 'test tube', 'lab', 'science'] },
  { name: 'TestTube03', iconName: 'TestTube03', category: 'Science', tags: ['chemistry', 'test tube', 'lab', 'science'] },
  { name: 'Ufo', iconName: 'Ufo', category: 'Science', tags: ['space', 'ufo', 'alien', 'science'] },
  { name: 'Ufo01', iconName: 'Ufo01', category: 'Science', tags: ['space', 'ufo', 'alien', 'science'] },
  { name: 'WindTurbine', iconName: 'WindTurbine', category: 'Science', tags: ['wind', 'energy', 'turbine', 'science'] },
  // Math icons
  { name: 'Absolute', iconName: 'Absolute', category: 'Math', tags: ['math', 'absolute', 'value', 'number'] },
  { name: 'Acute', iconName: 'Acute', category: 'Math', tags: ['math', 'acute', 'angle', 'geometry'] },
  { name: '1stBracket', iconName: 'FirstBracket', category: 'Math', tags: ['math', 'bracket', 'parenthesis', 'symbol'] },
  { name: '1stBracketCircle', iconName: 'FirstBracketCircle', category: 'Math', tags: ['math', 'bracket', 'circle', 'symbol'] },
  { name: '1stBracketSquare', iconName: 'FirstBracketSquare', category: 'Math', tags: ['math', 'bracket', 'square', 'symbol'] },
  { name: '2ndBracket', iconName: 'SecondBracket', category: 'Math', tags: ['math', 'bracket', 'parenthesis', 'symbol'] },
  { name: '2ndBracketCircle', iconName: 'SecondBracketCircle', category: 'Math', tags: ['math', 'bracket', 'circle', 'symbol'] },
  { name: '2ndBracketSquare', iconName: 'SecondBracketSquare', category: 'Math', tags: ['math', 'bracket', 'square', 'symbol'] },
  { name: '3rdBracket', iconName: 'ThirdBracket', category: 'Math', tags: ['math', 'bracket', 'parenthesis', 'symbol'] },
  { name: '3rdBracketCircle', iconName: 'ThirdBracketCircle', category: 'Math', tags: ['math', 'bracket', 'circle', 'symbol'] },
  { name: '3rdBracketSquare', iconName: 'ThirdBracketSquare', category: 'Math', tags: ['math', 'bracket', 'square', 'symbol'] },
  { name: 'Alpha', iconName: 'Alpha', category: 'Math', tags: ['math', 'greek', 'alpha', 'symbol'] },
  { name: 'AlphaCircle', iconName: 'AlphaCircle', category: 'Math', tags: ['math', 'greek', 'alpha', 'circle'] },
  { name: 'AlphaSquare', iconName: 'AlphaSquare', category: 'Math', tags: ['math', 'greek', 'alpha', 'square'] },
  { name: 'Angle', iconName: 'Angle', category: 'Math', tags: ['math', 'angle', 'geometry', 'symbol'] },
  { name: 'Angle01', iconName: 'Angle01', category: 'Math', tags: ['math', 'angle', 'geometry', 'symbol'] },
  { name: 'ApproximatelyEqual', iconName: 'ApproximatelyEqual', category: 'Math', tags: ['math', 'approximate', 'equal', 'symbol'] },
  { name: 'ApproximatelyEqualCircle', iconName: 'ApproximatelyEqualCircle', category: 'Math', tags: ['math', 'approximate', 'circle', 'symbol'] },
  { name: 'ApproximatelyEqualSquare', iconName: 'ApproximatelyEqualSquare', category: 'Math', tags: ['math', 'approximate', 'square', 'symbol'] },
  { name: 'Beta', iconName: 'Beta', category: 'Math', tags: ['math', 'greek', 'beta', 'symbol'] },
  { name: 'Cone', iconName: 'Cone01', category: 'Math', tags: ['math', 'cone', 'geometry', '3d'] },
  { name: 'Cone02', iconName: 'Cone02', category: 'Math', tags: ['math', 'cone', 'geometry', '3d'] },
  { name: 'CongruentTo', iconName: 'CongruentTo', category: 'Math', tags: ['math', 'congruent', 'geometry', 'symbol'] },
  { name: 'CongruentToCircle', iconName: 'CongruentToCircle', category: 'Math', tags: ['math', 'congruent', 'circle', 'symbol'] },
  { name: 'CongruentToSquare', iconName: 'CongruentToSquare', category: 'Math', tags: ['math', 'congruent', 'square', 'symbol'] },
  { name: 'Coordinate', iconName: 'Coordinate01', category: 'Math', tags: ['math', 'coordinate', 'geometry', 'graph'] },
  { name: 'Coordinate02', iconName: 'Coordinate02', category: 'Math', tags: ['math', 'coordinate', 'geometry', 'graph'] },
  { name: 'Cos', iconName: 'Cos', category: 'Math', tags: ['math', 'cosine', 'trigonometry', 'function'] },
  { name: 'Cosine', iconName: 'Cosine01', category: 'Math', tags: ['math', 'cosine', 'trigonometry', 'function'] },
  { name: 'Cosine01', iconName: 'Cosine01', category: 'Math', tags: ['math', 'cosine', 'trigonometry', 'function'] },
  { name: 'Cosine02', iconName: 'Cosine02', category: 'Math', tags: ['math', 'cosine', 'trigonometry', 'function'] },
  { name: 'Cube', iconName: 'Cube', category: 'Math', tags: ['math', 'cube', 'geometry', '3d'] },
  { name: 'Cylinder', iconName: 'Cylinder01', category: 'Math', tags: ['math', 'cylinder', 'geometry', '3d'] },
  { name: 'Cylinder01', iconName: 'Cylinder01', category: 'Math', tags: ['math', 'cylinder', 'geometry', '3d'] },
  { name: 'Cylinder02', iconName: 'Cylinder02', category: 'Math', tags: ['math', 'cylinder', 'geometry', '3d'] },
  { name: 'Cylinder03', iconName: 'Cylinder03', category: 'Math', tags: ['math', 'cylinder', 'geometry', '3d'] },
  { name: 'Cylinder04', iconName: 'Cylinder04', category: 'Math', tags: ['math', 'cylinder', 'geometry', '3d'] },
];

// Group icons by category
const groupedIcons = availableIcons.reduce((acc, icon) => {
  if (!acc[icon.category]) {
    acc[icon.category] = [];
  }
  acc[icon.category].push(icon);
  return acc;
}, {} as Record<string, typeof availableIcons>);

export default function EditClassPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { classes, updateClass } = useClassContext();

  const [formData, setFormData] = useState({
    name: '',
    color: '#0ea5e9',
    icon: 'Book02' as string // Changed to use iconName
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const classToEdit = classes.find(c => c.id === id);
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        color: classToEdit.color || '#0ea5e9',
        icon: classToEdit.icon || 'Book02'
      });
    }
    setLoading(false);
  }, [id, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateClass(id as string, formData as any);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to update class:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredIcons = availableIcons.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!formData.name) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-gray-900 rounded-2xl mb-5 border border-sky-100 dark:border-gray-800">
          <HugeIcon name="Book02" size={28} className="h-7 w-7 text-sky-400 dark:text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">Class not found</h1>
        <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-6">This class may have been deleted or doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>
    );
  }

  // Get the fallback icon from Lucide map
  const fallbackIcon = iconMap[formData.icon as keyof typeof iconMap] ?? BookOpen;

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <HugeIcon
                name={formData.icon}
                size={20}
                className="w-5 h-5"
                style={{ color: formData.color }}
                fallbackIcon={fallbackIcon}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                Edit Class
              </h1>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <Label htmlFor="name" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Class Name <span className="text-red-400 normal-case">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter class name"
                  required
                  className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>



              <div>
                <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Choose an Icon
                </Label>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 dark:text-sky-500" />
                  <Input
                    type="text"
                    placeholder="Search icons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    autoComplete="off"
                  />
                </div>

                <div className="border border-sky-100 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="max-h-64 overflow-y-auto w-full">
                    {Object.entries(groupedIcons).map(([category, icons]) => (
                      <div key={category}>
                        <div className="sticky top-0 z-10 bg-sky-50 dark:bg-gray-800 px-3 py-2 text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-sky-100 dark:border-gray-700">
                          {category}
                        </div>
                        <div className="grid grid-cols-7 gap-1 p-2">
                          {icons.filter(icon => filteredIcons.some(fi => fi.name === icon.name)).map(({ name, iconName }) => {
                            const fallbackIconForGrid = iconMap[name as keyof typeof iconMap] ?? BookOpen;
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  handleChange('icon', iconName);
                                  setSearchQuery('');
                                }}
                                className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all ${
                                  formData.icon === iconName
                                    ? 'bg-sky-500 text-white scale-105 shadow-sm'
                                    : 'text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 hover:text-sky-600 hover:scale-105'
                                }`}
                                title={name}
                              >
                                <HugeIcon
                                  name={iconName}
                                  size={20}
                                  className="h-5 w-5"
                                  fallbackIcon={fallbackIconForGrid}
                                />
                                {formData.icon === iconName && (
                                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#b5d565] rounded-full border-2 border-white dark:border-gray-900" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {filteredIcons.length === 0 && (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-100/40 dark:bg-gray-800 mb-3">
                          <Search className="w-5 h-5 text-sky-500" />
                        </div>
                        <p className="text-sm text-sky-800 dark:text-sky-300">No icons found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-sky-500 dark:text-sky-400">
                  <span>
                    Selected: <span className="font-semibold text-sky-900 dark:text-white">{formData.icon}</span>
                  </span>
                  <span>{filteredIcons.length} icons available</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 sm:px-8 py-4 border-t border-sky-100/60 dark:border-gray-800">
              <Link href="/">
                <button
                  type="button"
                  disabled={saving}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.name.trim() || !formData.icon}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
