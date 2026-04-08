'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useData } from '@/context/DataContext';
import { Slider } from '@/components/ui/slider';

interface TimerProps {
  trigger?: React.ReactNode;
  onComplete?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMinimizedInfo?: (info: { isMinimized: boolean; isRunning: boolean; timeLeft: number; totalTime: number; formattedTime: string; progress: number }) => void;
  onRestore?: () => void;
  restoreSignal?: number;
}

type TimerStep = 'task-selection' | 'timer' | 'completion-check' | 'progress-tracking' | 'productivity-reflection' | 'next-session-suggestion';

interface TimerSession {
  taskId: string | null;
  taskTitle: string;
  duration: number;
  startTime: Date | null;
  endTime: Date | null;
}

export function StudyTimer({ trigger, onComplete, isOpen: externalIsOpen, onOpenChange, onMinimizedInfo, restoreSignal }: TimerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [isMinimized, setIsMinimized] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // New state for productive timers feature
  const [currentStep, setCurrentStep] = useState<TimerStep>('task-selection');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [customTaskName, setCustomTaskName] = useState('');
  const [taskCompleted, setTaskCompleted] = useState<boolean | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(50);
  const [focusQuality, setFocusQuality] = useState(5);
  const [productivityNotes, setProductivityNotes] = useState('');
  const [suggestedNextDuration, setSuggestedNextDuration] = useState(25);
  const [currentSession, setCurrentSession] = useState<TimerSession>({
    taskId: null,
    taskTitle: '',
    duration: 0,
    startTime: null,
    endTime: null
  });

  const { homework, deleteHomework } = useData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    const savedTimer = getCookie('studyTimer');
    if (savedTimer) {
      try {
        const timerData = JSON.parse(savedTimer);
        if (timerData && typeof timerData === 'object') {
          setHours(timerData.hours || 0);
          setMinutes(timerData.minutes || 25);
          setSeconds(timerData.seconds || 0);
          setIsRunning(timerData.isRunning || false);
          setIsPaused(timerData.isPaused || false);

          if (timerData.timeLeft !== undefined && timerData.timeLeft > 0) {
            setTimeLeft(timerData.timeLeft);
            setTotalTime(timerData.totalTime || 0);
          } else {
            const totalSeconds = (timerData.hours || 0) * 3600 + (timerData.minutes || 25) * 60 + (timerData.seconds || 0);
            setTotalTime(totalSeconds);
            setTimeLeft(totalSeconds);
          }

          // Restore session data if exists
          if (timerData.currentSession) {
            setCurrentSession(timerData.currentSession);
            setCurrentStep('timer');
          }
        }
      } catch {
        // Silent fail
      }
    }
  }, []);

  useEffect(() => {
    if (totalTime > 0) {
      const timeoutId = setTimeout(() => {
        const timerState = {
          hours,
          minutes,
          seconds,
          isRunning,
          isPaused,
          timeLeft,
          totalTime,
          currentSession
        };
        setCookie('studyTimer', JSON.stringify(timerState));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [hours, minutes, seconds, isRunning, isPaused, timeLeft, totalTime, currentSession]);

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTotalTime(totalSeconds);
    if (!isRunning) {
      setTimeLeft(totalSeconds);
    }
  }, [hours, minutes, seconds, isRunning]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      audioRef.current?.play().catch(() => { });

      // Update session end time
      setCurrentSession(prev => ({
        ...prev,
        endTime: new Date()
      }));

      // Move to completion check
      setCurrentStep('completion-check');
      setIsMinimized(false);

      onComplete?.();
    }
  }, [timeLeft, isRunning, onComplete]);

  // Dynamic page title
  useEffect(() => {
    if (isRunning && isMinimized) {
      const formattedTime = formatTime(timeLeft);
      const taskName = currentSession.taskTitle || 'Study Timer';
      document.title = `${formattedTime} - ${taskName}`;
    } else {
      document.title = 'TaskTornado';
    }

    return () => {
      document.title = 'TaskTornado';
    };
  }, [isRunning, isMinimized, timeLeft, currentSession.taskTitle]);

  const clearTimerCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'studyTimer=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const handleTaskSelection = (taskId: string | null, taskTitle: string) => {
    setSelectedTask(taskId);
    setCurrentSession({
      taskId,
      taskTitle,
      duration: totalTime,
      startTime: null,
      endTime: null
    });
    setCurrentStep('timer');
  };

  const startTimer = () => {
    if (totalTime > 0) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(totalTime);
      setCurrentSession(prev => ({
        ...prev,
        startTime: new Date(),
        duration: totalTime
      }));
    }
  };

  const pauseTimer = () => setIsPaused(!isPaused);

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    clearTimerCookie();
  };

  const endTimerEarly = () => {
    setIsRunning(false);
    setIsPaused(false);
    audioRef.current?.play().catch(() => { });

    // Update session end time
    setCurrentSession(prev => ({
      ...prev,
      endTime: new Date()
    }));

    // Move to completion check
    setCurrentStep('completion-check');
    setIsMinimized(false);

    onComplete?.();
  };

  const handleCompletionCheck = (completed: boolean) => {
    setTaskCompleted(completed);
    if (completed) {
      setCurrentStep('productivity-reflection');
    } else {
      setCurrentStep('progress-tracking');
    }
  };

  const handleProgressTracking = () => {
    // Calculate suggested next duration based on unit rate of work
    const remainingWork = 100 - progressPercentage;
    const timeSpentMinutes = currentSession.duration / 60;

    // Calculate work rate: percentage completed per minute
    const workRate = progressPercentage / timeSpentMinutes;

    // Calculate time needed for remaining work at the same rate
    const estimatedRemainingTime = Math.ceil(remainingWork / workRate);

    // Suggest a reasonable session duration (cap at 120 minutes, minimum 1 minute)
    const suggested = Math.min(Math.max(1, estimatedRemainingTime), 120);
    setSuggestedNextDuration(suggested);

    setCurrentStep('productivity-reflection');
  };

  const handleProductivityReflection = () => {
    setCurrentStep('next-session-suggestion');
  };

  const handleStartNewSession = () => {
    // Reset for new session
    setMinutes(suggestedNextDuration);
    setHours(0);
    setSeconds(0);
    setTaskCompleted(null);
    setProgressPercentage(50);
    setFocusQuality(5);
    setProductivityNotes('');
    setCurrentStep('task-selection');
  };

  const handleFinishSession = () => {
    // Reset everything
    setCurrentStep('task-selection');
    setSelectedTask(null);
    setCustomTaskName('');
    setTaskCompleted(null);
    setProgressPercentage(50);
    setFocusQuality(5);
    setProductivityNotes('');
    setMinutes(25);
    setHours(0);
    setSeconds(0);
    setCurrentSession({
      taskId: null,
      taskTitle: '',
      duration: 0,
      startTime: null,
      endTime: null
    });
    clearTimerCookie();
    setIsOpen(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;

  // Report minimized state to parent
  useEffect(() => {
    onMinimizedInfo?.({
      isMinimized,
      isRunning,
      timeLeft,
      totalTime,
      formattedTime: formatTime(timeLeft),
      progress,
    });
  }, [isMinimized, isRunning, timeLeft, totalTime]);

  // Un-minimize when parent signals restore
  useEffect(() => {
    if (restoreSignal && restoreSignal > 0) {
      setIsMinimized(false);
    }
  }, [restoreSignal]);

  // Step titles for the header
  const getStepTitle = () => {
    switch (currentStep) {
      case 'task-selection': return 'Study Timer';
      case 'timer': return 'Focus Session';
      case 'completion-check': return 'Session Complete';
      case 'progress-tracking': return 'Track Progress';
      case 'productivity-reflection': return 'Reflection';
      case 'next-session-suggestion': return 'Great Work!';
      default: return 'Study Timer';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'task-selection': return 'Select a task to focus on';
      case 'timer': return currentSession.taskTitle || 'Stay focused';
      case 'completion-check': return 'How did it go?';
      case 'progress-tracking': return 'How much did you complete?';
      case 'productivity-reflection': return 'Rate your focus quality';
      case 'next-session-suggestion': return 'Ready for another round?';
      default: return '';
    }
  };

  // Render different steps
  const renderContent = () => {
    switch (currentStep) {
      case 'task-selection':
        return (
          <motion.div
            key="task-selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-4"
          >
            {/* Custom task input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Custom Task
              </label>
              <div className="relative flex items-center">
                <input
                  placeholder="Enter task name..."
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTaskName.trim()) {
                      handleTaskSelection(null, customTaskName);
                    }
                  }}
                  className="w-full h-11 pl-3 pr-12 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400/50 dark:placeholder-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
                {customTaskName.trim() && (
                  <button
                    onClick={() => handleTaskSelection(null, customTaskName)}
                    className="absolute right-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500/25 transition-colors"
                  >
                    <HugeIcon name="ArrowRight01" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Homework tasks */}
            {homework.filter(hw => !hw.completed).length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Your Tasks
                </label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {homework.filter(hw => !hw.completed).slice(0, 8).map((task) => (
                    <motion.button
                      key={task.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleTaskSelection(task.id, task.title)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-xl hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/15 transition-colors">
                        <HugeIcon name="Target01" className="w-4 h-4 text-sky-500" />
                      </div>
                      <span className="text-sm font-medium text-sky-900 dark:text-white truncate">{task.title}</span>
                      <HugeIcon name="ArrowRight01" className="w-4 h-4 text-sky-300 dark:text-sky-600 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {homework.filter(hw => !hw.completed).length === 0 && !customTaskName && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-3">
                  <HugeIcon name="Target01" className="w-5 h-5 text-sky-400" />
                </div>
                <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center">
                  No pending tasks.<br />Enter a custom task above.
                </p>
              </div>
            )}
          </motion.div>
        );

      case 'timer':
        const presetDurations = [
          { label: '5', minutes: 5 },
          { label: '10', minutes: 10 },
          { label: '15', minutes: 15 },
          { label: '25', minutes: 25 },
          { label: '30', minutes: 30 },
          { label: '45', minutes: 45 },
          { label: '60', minutes: 60 },
        ];

        const setPresetDuration = (mins: number) => {
          setMinutes(mins);
          setHours(0);
          setSeconds(0);
        };

        const currentTotalMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0);

        const handleChangeTask = () => {
          setCurrentStep('task-selection');
        };

        const handleRemoveTask = () => {
          setCurrentSession({
            taskId: null,
            taskTitle: '',
            duration: totalTime,
            startTime: null,
            endTime: null
          });
          setSelectedTask(null);
          setCustomTaskName('');
        };

        // Calculate the SVG circle parameters
        const circleSize = 200;
        const strokeWidth = 4;
        const radius = (circleSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference * (1 - progress / 100);

        return (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-6"
          >
            {/* Task name chip */}
            {currentSession.taskTitle && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-full">
                  <button
                    onClick={handleChangeTask}
                    className="flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white transition-colors group"
                  >
                    <HugeIcon name="Target01" className="w-3 h-3" />
                    <span className="max-w-[180px] truncate">{currentSession.taskTitle}</span>
                  </button>
                  <button
                    onClick={handleRemoveTask}
                    className="p-0.5 rounded-full hover:bg-sky-200/50 dark:hover:bg-sky-500/20 transition-colors"
                    title="Remove task"
                  >
                    <HugeIcon name="Cancel01" className="w-3 h-3 text-sky-400 hover:text-sky-600 dark:hover:text-sky-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Circular Timer Display */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-sky-100 dark:text-gray-800"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-sky-500 dark:text-sky-400 transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extralight tracking-tight text-sky-900 dark:text-white tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                  {isRunning && (
                    <span className="text-[10px] text-sky-500 dark:text-sky-400 uppercase tracking-[0.2em] font-semibold mt-1">
                      {isPaused ? 'paused' : 'focusing'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Duration Selection - Only show when not running */}
            {!isRunning && (
              <div className="space-y-4">
                <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-center">
                  Duration
                </label>

                {/* Preset Duration Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {presetDurations.map((preset) => (
                    <button
                      key={preset.minutes}
                      onClick={() => setPresetDuration(preset.minutes)}
                      className={`h-11 text-sm font-semibold rounded-xl border transition-all ${currentTotalMinutes === preset.minutes
                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                        : 'bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 text-sky-700 dark:text-sky-300 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                        }`}
                    >
                      {preset.label}
                      <span className="text-[10px] ml-0.5 opacity-60">m</span>
                    </button>
                  ))}

                  {/* Custom time button */}
                  <button
                    onClick={() => {
                      const customMins = parseInt(prompt('Enter custom duration in minutes (1-180):', '25') || '25');
                      if (customMins && customMins > 0 && customMins <= 180) {
                        setPresetDuration(customMins);
                      }
                    }}
                    className="h-11 text-sm font-semibold rounded-xl border bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 text-sky-500 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>

                {/* Quick adjust */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      const newMins = Math.max(1, currentTotalMinutes - 5);
                      setPresetDuration(newMins);
                    }}
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                  >
                    <span className="text-lg leading-none">−</span>
                  </button>

                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-semibold text-sky-900 dark:text-white">{currentTotalMinutes} min</p>
                  </div>

                  <button
                    onClick={() => {
                      const newMins = Math.min(180, currentTotalMinutes + 5);
                      setPresetDuration(newMins);
                    }}
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  disabled={totalTime === 0}
                  className="h-14 w-14 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-30 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all flex items-center justify-center"
                >
                  <HugeIcon name="Play" className="w-5 h-5 ml-0.5" />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseTimer}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                  >
                    {isPaused ? <HugeIcon name="Play" className="w-4 h-4 ml-0.5" /> : <HugeIcon name="Pause" className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-sky-400 dark:text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                  >
                    <HugeIcon name="Rotate01" className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={endTimerEarly}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-emerald-500 bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                    title="End early"
                  >
                    <HugeIcon name="CheckmarkCircle02" className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMinimized(true)}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-sky-400 dark:text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                  >
                    <HugeIcon name="ArrowDown01" className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        );

      case 'completion-check':
        return (
          <motion.div
            key="completion-check"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-4"
          >
            {/* Completion illustration */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center"
              >
                <HugeIcon name="Star" className="w-7 h-7 text-emerald-500" />
              </motion.div>
            </div>

            <div className="text-center mb-2">
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50">Did you finish the task?</p>
            </div>

            <div className="space-y-2.5">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCompletionCheck(true)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left bg-white dark:bg-gray-900 border border-emerald-200/80 dark:border-emerald-600/20 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/15 transition-colors">
                  <HugeIcon name="CheckmarkCircle02" className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-sky-900 dark:text-white text-sm">Yes, I completed it</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/40">Task is done!</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCompletionCheck(false)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-xl hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/15 transition-colors">
                  <HugeIcon name="CancelCircle" className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="font-semibold text-sky-900 dark:text-white text-sm">No, still in progress</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/40">Let me track my progress</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        );

      case 'progress-tracking':
        return (
          <motion.div
            key="progress-tracking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-5"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Progress
                </label>
                <span className="text-2xl font-bold text-sky-900 dark:text-white tabular-nums">{progressPercentage}%</span>
              </div>
              <Slider
                value={[progressPercentage]}
                onValueChange={(value: number[]) => setProgressPercentage(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-sky-500/40 dark:text-sky-400/40 font-medium">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Footer action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleProgressTracking}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors flex items-center gap-2"
              >
                Continue
                <HugeIcon name="ArrowRight01" className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      case 'productivity-reflection':
        return (
          <motion.div
            key="productivity-reflection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-5"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeIcon name="Brain" className="w-3 h-3" />
                  Focus Quality
                </label>
                <span className="text-lg font-bold text-sky-900 dark:text-white tabular-nums">{focusQuality}/10</span>
              </div>
              <Slider
                value={[focusQuality]}
                onValueChange={(value: number[]) => setFocusQuality(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-sky-500/40 dark:text-sky-400/40 font-medium">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Notes <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
              </label>
              <textarea
                placeholder="Any thoughts on this session?"
                value={productivityNotes}
                onChange={(e) => setProductivityNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400/50 dark:placeholder-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none transition-colors"
              />
            </div>

            {/* Footer action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleProductivityReflection}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors flex items-center gap-2"
              >
                Continue
                <HugeIcon name="ArrowRight01" className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      case 'next-session-suggestion':
        return (
          <motion.div
            key="next-session-suggestion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 space-y-5"
          >
            {/* Celebration */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center"
              >
                <HugeIcon name="Star" className="w-7 h-7 text-amber-500" />
              </motion.div>
            </div>

            {!taskCompleted && (
              <div className="p-4 bg-sky-50/60 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-800/30 rounded-xl space-y-2 text-center">
                <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Suggested Next Session</p>
                <p className="text-3xl font-bold text-sky-500 dark:text-sky-400 tabular-nums">{suggestedNextDuration} min</p>
                <p className="text-xs text-sky-600/40 dark:text-sky-400/40">
                  Based on {progressPercentage}% completion — {100 - progressPercentage}% remaining
                </p>
              </div>
            )}

            {/* Actions in footer style */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={handleFinishSession}
                className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
              >
                Finish for Now
              </button>
              <button
                onClick={handleStartNewSession}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors"
              >
                Start Another Session
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const showModal = isOpen && !isMinimized;

  // Handle external trigger click
  const handleTriggerClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger — only renders when not externally controlled */}
      {externalIsOpen === undefined ? (
        trigger ? (
          <div onClick={handleTriggerClick}>
            {trigger}
          </div>
        ) : (
          <button
            onClick={handleTriggerClick}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeIcon name="Timer01" className="w-4 h-4" />
            Timer
          </button>
        )
      ) : (
        // When externally controlled, render the trigger without click handler
        trigger
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100/60 dark:border-gray-800 rounded-t-[28px] z-10">
                <div>
                  <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                    {getStepTitle()}
                  </h2>
                  <p className="text-xs text-sky-500/60 dark:text-sky-400/40 mt-0.5 max-w-[240px] truncate">
                    {getStepSubtitle()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (isRunning) {
                      setIsMinimized(true);
                    } else {
                      handleFinishSession();
                    }
                  }}
                  className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  {isRunning ? <HugeIcon name="ArrowDown01" className="h-5 w-5" /> : <HugeIcon name="Cancel01" className="h-5 w-5" />}
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>

              <audio
                ref={audioRef}
                preload="none"
                src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhEUOlwOi6bxhW"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}