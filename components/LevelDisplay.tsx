import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Crown, Zap, BookOpen, Sparkles } from 'lucide-react';
import { useGamification, UserLevel } from '@/context/GamificationContext';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  className?: string;
  showDetails?: boolean;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ className, showDetails = true }) => {
  const { data, getLevelInfo } = useGamification();
  const [particles, setParticles] = React.useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number; }[]>([]);

  React.useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2
    }));
    setParticles(newParticles);
  }, []);

  const getLevelConfig = (level: UserLevel) => {
    const configs: Record<UserLevel, {
        icon: React.ElementType;
        gradient: string;
        glow: string;
        accent: string;
        bg: string;
        particle: string;
    }> = {
      Master: {
        icon: Crown,
        gradient: 'from-amber-400 via-yellow-500 to-orange-500',
        glow: 'shadow-amber-500/50',
        accent: 'text-amber-400',
        bg: 'from-amber-500/20 to-orange-500/20',
        particle: 'bg-amber-400'
      },
      Expert: {
        icon: Award,
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
        glow: 'shadow-purple-500/50',
        accent: 'text-purple-400',
        bg: 'from-violet-500/20 to-fuchsia-500/20',
        particle: 'bg-purple-400'
      },
      Scholar: {
        icon: BookOpen,
        gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
        glow: 'shadow-blue-500/50',
        accent: 'text-blue-400',
        bg: 'from-cyan-500/20 to-indigo-500/20',
        particle: 'bg-blue-400'
      },
      Student: {
        icon: TrendingUp,
        gradient: 'from-emerald-400 via-green-500 to-teal-500',
        glow: 'shadow-green-500/50',
        accent: 'text-emerald-400',
        bg: 'from-emerald-500/20 to-teal-500/20',
        particle: 'bg-green-400'
      }
    };
    return configs[level] || configs.Student;
  };

  if (!data) {
    return <div>Loading...</div>; // Or a skeleton loader
  }
  
  const config = getLevelConfig(data.currentLevel);
  const Icon = config.icon;
  
  const levels: UserLevel[] = ['Student', 'Scholar', 'Expert', 'Master'];
  const currentLevelIndex = levels.indexOf(data.currentLevel);
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : 'Master';
  
  const nextLevelInfo = getLevelInfo(nextLevel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        'bg-white/80 dark:bg-[#1e2938] backdrop-blur-md',
        'border border-gray-200 dark:border-white/10',
        'shadow-sm dark:shadow-none',
        className
      )}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={cn('absolute rounded-full opacity-20', config.particle)}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Gradient orb background */}
      <motion.div
        className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 dark:opacity-25 bg-gradient-to-br', config.gradient)}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Level Badge with 3D effect */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative"
            >
              <motion.div
                className={cn(
                  'relative w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  config.gradient,
                  config.glow
                )}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Corner accent for Master */}
                {data.currentLevel === 'Master' && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" fill="currentColor" />
                  </motion.div>
                )}
              </motion.div>

              {/* Floating ring animation */}
              <motion.div
                className={cn('absolute inset-0 rounded-2xl border-2 opacity-40', config.accent.replace('text-', 'border-'))}
                animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <motion.h3
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                {data.currentLevel}
              </motion.h3>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-1.5"
              >
                <Zap className={cn('w-3 h-3', config.accent)} fill="currentColor" />
                <p className="text-[10px] text-gray-700 dark:text-white/80 font-medium">
                  {data.totalXP.toLocaleString()} <span className="text-[9px] text-gray-500 dark:text-white/60">XP</span>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Streak indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Level {currentLevelIndex + 1}</span>
            </div>
          </motion.div>
        </div>

        {showDetails && (
          <>
            {/* Modern Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {/* Progress stats */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-white/70">Progress to {data.currentLevel === 'Master' ? 'Max Level' : nextLevelInfo.name}</span>
                <span className={cn('text-lg font-bold', config.accent)}>
                  {Math.round(data.levelProgress)}%
                </span>
              </div>

              {/* Modern progress bar with segments */}
              <div className="relative h-3 bg-gray-200 dark:bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-gray-200 dark:border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.levelProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                  className={cn('h-full rounded-full bg-gradient-to-r relative', config.gradient)}
                >
                  {/* Animated shine */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.div>
              </div>

              {/* Next level card */}
              {data.currentLevel !== 'Master' && nextLevelInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center', getLevelConfig(nextLevel).gradient)}>
                      {React.createElement(getLevelConfig(nextLevel).icon, { className: 'w-5 h-5 text-white', strokeWidth: 2.5 })}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/50 font-medium">Next Rank</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{nextLevelInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-white/50">Required</p>
                    <p className={cn('text-sm font-bold', getLevelConfig(nextLevel).accent)}>
                      {nextLevelInfo.minXP.toLocaleString()} XP
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default LevelDisplay;