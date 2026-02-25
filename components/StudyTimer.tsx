'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause,  Minimize2,  CheckCircle2, Circle, ChevronRight,  X, Check, Timer } from 'lucide-react';
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

  // Render different steps
  const renderContent = () => {
    switch (currentStep) {
      case 'task-selection':
        return (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">What are you working on?</h3>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/40">Select a task to focus on</p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto px-4">
              {/* Custom task option */}
              <div className="space-y-2 mb-4">
                <input
                  placeholder="Enter custom task name..."
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder:text-sky-600/30 outline-none focus:ring-2 focus:ring-sky-400/30"
                />
                {customTaskName && (
                  <button
                    onClick={() => handleTaskSelection(null, customTaskName)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left border border-sky-100 dark:border-gray-700 rounded-xl hover:bg-sky-500/[0.03] transition-colors"
                  >
                    <Circle className="w-4 h-4 text-sky-400/50 shrink-0" />
                    <span className="text-sm font-medium text-sky-900 dark:text-white truncate">{customTaskName}</span>
                  </button>
                )}
              </div>

              {/* Homework tasks */}
              {homework.filter(hw => !hw.completed).slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskSelection(task.id, task.title)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border border-sky-100 dark:border-gray-700 rounded-xl hover:bg-sky-500/[0.03] transition-colors"
                >
                  <Circle className="w-4 h-4 text-sky-400/50 shrink-0" />
                  <span className="text-sm font-medium text-sky-900 dark:text-white truncate">{task.title}</span>
                </button>
              ))}

              {homework.filter(hw => !hw.completed).length === 0 && !customTaskName && (
                <p className="text-sm text-sky-600/40 dark:text-sky-400/40 text-center py-4">
                  No pending tasks. Enter a custom task above.
                </p>
              )}
            </div>
          </div>
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

        return (
          <div className="py-6 space-y-6">
            {/* Task name - now clickable */}
            {currentSession.taskTitle && (
              <div className="px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleChangeTask}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-sky-500/[0.04] transition-colors"
                  >
                    <p className="text-[10px] text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider">Working on</p>
                    <p className="text-sm font-semibold text-sky-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors max-w-[200px] truncate">
                      {currentSession.taskTitle}
                    </p>
                    <ChevronRight className="w-3 h-3 text-sky-400/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={handleRemoveTask}
                    className="p-1 rounded-full hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                    title="Remove task"
                  >
                    <span className="text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 text-sm">×</span>
                  </button>
                </div>
              </div>
            )}

            {/* Timer Display */}
            <div className="text-center">
              <div className="text-7xl font-extralight tracking-tight text-sky-900 dark:text-white tabular-nums">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4">
              <div className="w-full h-1 bg-sky-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Duration Selection - Only show when not running */}
            {!isRunning && (
              <div className="px-4 space-y-4">
                <div className="text-center">
                  <p className="text-[10px] text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider mb-3">Duration</p>
                </div>

                {/* Preset Duration Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {presetDurations.map((preset) => (
                    <button
                      key={preset.minutes}
                      onClick={() => setPresetDuration(preset.minutes)}
                      className={`h-11 text-sm font-semibold rounded-xl border transition-all ${currentTotalMinutes === preset.minutes
                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                        : 'border-sky-100 dark:border-gray-700 text-sky-700 dark:text-sky-300 hover:bg-sky-500/[0.04]'
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
                    className="h-11 text-sm font-semibold rounded-xl border border-sky-100 dark:border-gray-700 text-sky-500 hover:bg-sky-500/[0.04] transition-all"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>

                {/* Quick adjust buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const newMins = Math.max(1, currentTotalMinutes - 5);
                      setPresetDuration(newMins);
                    }}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span className="text-lg">−</span>
                  </button>

                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-semibold text-sky-900 dark:text-white">{currentTotalMinutes} min</p>
                  </div>

                  <button
                    onClick={() => {
                      const newMins = Math.min(180, currentTotalMinutes + 5);
                      setPresetDuration(newMins);
                    }}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  disabled={totalTime === 0}
                  className="w-14 h-14 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-30 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all flex items-center justify-center"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseTimer}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sky-400/50 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={endTimerEarly}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                    title="End early"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sky-400/50 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Status */}
            {isRunning && (
              <div className="text-center">
                <span className="text-[10px] text-sky-600/40 dark:text-sky-400/40 uppercase tracking-[0.2em] font-medium">
                  {isPaused ? 'paused' : 'focus'}
                </span>
              </div>
            )}
          </div>
        );

      case 'completion-check':
        return (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">Timer Complete!</h3>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/40">Did you finish the task?</p>
            </div>

            <div className="px-4 space-y-3">
              <button
                onClick={() => handleCompletionCheck(true)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left border border-[#d4e88e] bg-[#ebf6b5]/20 rounded-xl hover:bg-[#ebf6b5]/40 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sky-900 dark:text-white text-sm">Yes, I completed it</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/40">Task is done!</p>
                </div>
              </button>

              <button
                onClick={() => handleCompletionCheck(false)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left border border-sky-100 dark:border-gray-700 rounded-xl hover:bg-sky-500/[0.03] transition-colors"
              >
                <Circle className="w-5 h-5 text-sky-400/40 shrink-0" />
                <div>
                  <p className="font-semibold text-sky-900 dark:text-white text-sm">No, still in progress</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/40">Let me track my progress</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 'progress-tracking':
        return (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">Track Your Progress</h3>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/40">How much of the task did you complete?</p>
            </div>

            <div className="px-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-sky-600/50 dark:text-sky-400/50">Progress</span>
                  <span className="text-2xl font-bold text-sky-900 dark:text-white">{progressPercentage}%</span>
                </div>
                <Slider
                  value={[progressPercentage]}
                  onValueChange={(value: number[]) => setProgressPercentage(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-sky-600/30 dark:text-sky-400/30">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <button
                onClick={handleProgressTracking}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'productivity-reflection':
        return (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">Productivity Reflection</h3>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/40">How was your focus quality?</p>
            </div>

            <div className="px-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-sky-600/50 dark:text-sky-400/50">Focus Quality</span>
                  <span className="text-lg font-bold text-sky-900 dark:text-white">{focusQuality}/10</span>
                </div>
                <Slider
                  value={[focusQuality]}
                  onValueChange={(value: number[]) => setFocusQuality(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-sky-600/30 dark:text-sky-400/30">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium">Notes (optional)</label>
                <textarea
                  placeholder="Any thoughts on this session?"
                  value={productivityNotes}
                  onChange={(e) => setProductivityNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder:text-sky-600/30 outline-none focus:ring-2 focus:ring-sky-400/30 resize-none"
                />
              </div>

              <button
                onClick={handleProductivityReflection}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'next-session-suggestion':
        return (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">Great Work!</h3>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/40">Ready for another session?</p>
            </div>

            <div className="px-6 space-y-4">
              {!taskCompleted && (
                <div className="p-4 bg-[#ebf6b5]/20 dark:bg-sky-500/5 border border-[#d4e88e]/50 dark:border-sky-800/30 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-sky-900 dark:text-white">Suggested Next Session</p>
                  <p className="text-2xl font-bold text-sky-500 dark:text-sky-400">{suggestedNextDuration} minutes</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/40">
                    Based on {progressPercentage}% completion, you have about {100 - progressPercentage}% remaining
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleStartNewSession}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                >
                  Start Another Session
                </button>
                <button
                  onClick={handleFinishSession}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-sky-600/60 dark:text-sky-400/60 border border-sky-100 dark:border-gray-700 rounded-xl hover:bg-sky-500/[0.03] transition-colors"
                >
                  Finish for Now
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isMinimized} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Timer className="w-4 h-4" />
              Timer
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-md border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5 bg-[#fffaf4]/98 dark:bg-gray-950/98 backdrop-blur-xl">
          <DialogTitle className="sr-only">Study Timer</DialogTitle>
          {renderContent()}

          <audio
            ref={audioRef}
            preload="none"
            src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhEUOlwOi6bxhW"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}