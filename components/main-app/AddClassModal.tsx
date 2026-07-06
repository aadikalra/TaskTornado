'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useClassContext } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useMainApp } from '@/context/MainAppContext';

// Available icons with their display names and semantic tags
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
  { name: 'LanguageCircle', iconName: 'LanguageCircle', category: 'Languages', tags: ['translation', 'foreign', 'speech', 'communication', 'global', 'linguistics'] },
  { name: 'LanguageSkill', iconName: 'LanguageSkill', category: 'Languages', tags: ['language', 'skill', 'learning', 'education'] },
  { name: 'LanguageSquare', iconName: 'LanguageSquare', category: 'Languages', tags: ['translation', 'foreign', 'speech', 'communication', 'global', 'linguistics'] },
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
  { name: 'BoardMath', iconName: 'BoardMath', category: 'Math', tags: ['mathematics', 'math', 'board', 'teaching'] },
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
];

export const AddClassModal = () => {
  const { showAddClass, setShowAddClass } = useMainApp();
  const { addClass } = useClassContext();
  const { success, error: toastError } = useToast();

  const [newClassName, setNewClassName] = useState('');
  const [newClassIcon, setNewClassIcon] = useState<string>('Book02');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSuggestingIcons, setIsSuggestingIcons] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Filter icons based on search query with semantic tag support
  const filteredIcons = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    if (!lowerQuery) return availableIcons;

    return availableIcons.filter(icon =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.category.toLowerCase().includes(lowerQuery) ||
      icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

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
  }, [newClassName]);

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
  }, [newClassName, handleAISuggest, aiSuggestions.length]);

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

  if (!showAddClass) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
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
                          <HugeIcon name={icon.iconName as any} className="h-5 w-5" />
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
                            <HugeIcon name={iconName as any} className="h-5 w-5" />
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
    </AnimatePresence>
  );
};
