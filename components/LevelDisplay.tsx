import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Crown, BookOpen } from 'lucide-react';
import { useGamification, UserLevel } from '@/context/GamificationContext';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  className?: string;
  showDetails?: boolean;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ className, showDetails = true }) => {
  const { data, getLevelInfo } = useGamification();

  if (!data) {
    return <div>Loading...</div>;
  }
  
  const getLevelConfig = (level: UserLevel) => {
    const configs: Record<UserLevel, {
        icon: React.ElementType;
        color: string;
    }> = {
      Master: {
        icon: Crown,
        color: 'text-amber-600 dark:text-amber-400'
      },
      Expert: {
        icon: Award,
        color: 'text-purple-600 dark:text-purple-400'
      },
      Scholar: {
        icon: BookOpen,
        color: 'text-blue-600 dark:text-blue-400'
      },
      Student: {
        icon: TrendingUp,
        color: 'text-emerald-600 dark:text-emerald-400'
      }
    };
    return configs[level] || configs.Student;
  };

  const config = getLevelConfig(data.currentLevel);
  const Icon = config.icon;
  
  const levels: UserLevel[] = ['Student', 'Scholar', 'Expert', 'Master'];
  const currentLevelIndex = levels.indexOf(data.currentLevel);
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : 'Master';
  
  const nextLevelInfo = getLevelInfo(nextLevel);

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
            {data.currentLevel}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data.totalXP.toLocaleString()} XP • Level {currentLevelIndex + 1}
          </p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900">
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </motion.div>

      {showDetails && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Progress to {data.currentLevel === 'Master' ? 'Max Level' : nextLevelInfo.name}
              </span>
              <span className="text-xs text-gray-900 dark:text-white">
                {Math.round(data.levelProgress)}%
              </span>
            </div>
            
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.levelProgress}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gray-900 dark:bg-white"
              />
            </div>
          </div>

          {data.currentLevel !== 'Master' && nextLevelInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-3 border-t border-gray-100 dark:border-gray-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Rank</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-gray-50 dark:bg-gray-900">
                      {React.createElement(getLevelConfig(nextLevel).icon, { 
                        className: cn('w-3 h-3', getLevelConfig(nextLevel).color) 
                      })}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {nextLevelInfo.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Required</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {nextLevelInfo.minXP.toLocaleString()} XP
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelDisplay;