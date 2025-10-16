'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Crown, Zap, BookOpen } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  className?: string;
  showDetails?: boolean;
}

export const LevelDisplay = ({ className, showDetails = true }: LevelDisplayProps) => {
  const { data, getLevelInfo } = useGamification();

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Master':
        return <Crown className="h-6 w-6 text-white drop-shadow-sm" />;
      case 'Expert':
        return <Award className="h-6 w-6 text-white drop-shadow-sm" />;
      case 'Scholar':
        return <BookOpen className="h-6 w-6 text-white drop-shadow-sm" />;
      default:
        return <TrendingUp className="h-6 w-6 text-white drop-shadow-sm" />;
    }
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case 'Master':
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/30';
      case 'Expert':
        return 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 shadow-purple-500/30';
      case 'Scholar':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-blue-500/30';
      default:
        return 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-500/30';
    }
  };

  const currentLevelInfo = getLevelInfo();
  const nextLevelInfo = getLevelInfo(data.currentLevel === 'Master' ? 'Master' : (
    data.currentLevel === 'Student' ? 'Scholar' :
    data.currentLevel === 'Scholar' ? 'Expert' : 'Master'
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Level Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              'relative p-3 rounded-full shadow-lg border-2 border-white',
              getLevelBadgeStyle(data.currentLevel)
            )}
          >
            {getLevelIcon(data.currentLevel)}
            {/* Badge glow effect */}
            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse" />

            {/* Special effects for higher levels */}
            {data.currentLevel === 'Master' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-yellow-300 opacity-50"
              />
            )}
            {data.currentLevel === 'Expert' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-purple-300 rounded-full"
              />
            )}
          </motion.div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.currentLevel}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{data.totalXP} XP earned</p>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Level {data.currentLevel}</span>
              <span>{Math.round(data.levelProgress)}% to {data.currentLevel === 'Master' ? 'Max' : nextLevelInfo.name}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.levelProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  data.currentLevel === 'Master' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  data.currentLevel === 'Expert' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                  data.currentLevel === 'Scholar' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  'bg-gradient-to-r from-green-400 to-green-600'
                )}
              />
            </div>
          </div>

          {/* Next Level Preview */}
          {data.currentLevel !== 'Master' && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <span>Next: {nextLevelInfo.name}</span>
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'p-1.5 rounded-full shadow-md',
                    nextLevelInfo.name === 'Scholar' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                    nextLevelInfo.name === 'Expert' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                    'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  )}
                >
                  {nextLevelInfo.name === 'Scholar' ? <BookOpen className="h-3 w-3 text-white" /> :
                   nextLevelInfo.name === 'Expert' ? <Award className="h-3 w-3 text-white" /> :
                   <Crown className="h-3 w-3 text-white" />}
                </motion.div>
                <span>{nextLevelInfo.minXP} XP</span>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
