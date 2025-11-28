'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import { Timer } from './animate-ui/icons/timer';

interface TimerProps {
  trigger?: React.ReactNode;
  onComplete?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudyTimer({ trigger, onComplete, isOpen: externalIsOpen, onOpenChange }: TimerProps) {
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
        }
      } catch {
        // Silent fail
      }
    }
  }, []);

  useEffect(() => {
    if (totalTime > 0) {
      const timeoutId = setTimeout(() => {
        const timerState = { hours, minutes, seconds, isRunning, isPaused, timeLeft, totalTime };
        setCookie('studyTimer', JSON.stringify(timerState));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [hours, minutes, seconds, isRunning, isPaused, timeLeft, totalTime]);

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
      audioRef.current?.play().catch(() => {});
      clearTimerCookie();
      onComplete?.();
    }
  }, [timeLeft, isRunning, onComplete]);

  // Dynamic page title
  useEffect(() => {
    if (isRunning && isMinimized) {
      const formattedTime = formatTime(timeLeft);
      document.title = `${formattedTime} - Study Timer`;
    } else {
      document.title = 'TaskTornado';
    }

    return () => {
      document.title = 'TaskTornado';
    };
  }, [isRunning, isMinimized, timeLeft]);

  const clearTimerCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'studyTimer=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const startTimer = () => {
    if (totalTime > 0) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(totalTime);
    }
  };

  const pauseTimer = () => setIsPaused(!isPaused);

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    clearTimerCookie();
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

  // Floating pill component
  const FloatingPill = () => {
    if (!isMinimized || !isRunning) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 bg-background/95 backdrop-blur-xl border border-border rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
           onClick={() => setIsMinimized(false)}>
        <Timer className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground tabular-nums">
          {formatTime(timeLeft)}
        </span>
        <div className="w-1 h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-1000 ease-linear"
            style={{ height: `${progress}%` }}
          />
        </div>
        <Maximize2 className="w-3 h-3 text-muted-foreground" />
      </div>
    );
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

        <DialogContent className="sm:max-w-xs border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
          <DialogTitle className="sr-only">Study Timer</DialogTitle>
          <div className="py-8 space-y-8">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-7xl font-extralight tracking-tight text-foreground tabular-nums">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4">
              <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground/60 transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Time Input */}
            {!isRunning && (
              <div className="flex justify-center gap-6 px-4">
                {[
                  { value: hours, setter: setHours, max: 23, label: 'h' },
                  { value: minutes, setter: setMinutes, max: 59, label: 'm' },
                  { value: seconds, setter: setSeconds, max: 59, label: 's' },
                ].map(({ value, setter, max, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max={max}
                      value={value || ''}
                      onChange={(e) => setter(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
                      className="w-14 h-10 text-center text-lg font-light border-0 bg-muted/50 rounded-lg focus-visible:ring-1 focus-visible:ring-foreground/20"
                    />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <Button 
                  onClick={startTimer} 
                  disabled={totalTime === 0}
                  size="lg"
                  className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={pauseTimer}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-12 rounded-full hover:bg-muted"
                  >
                    {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={resetTimer}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-12 rounded-full hover:bg-muted"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => setIsMinimized(true)}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-12 rounded-full hover:bg-muted"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Status */}
            {isRunning && (
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  {isPaused ? 'paused' : 'focus'}
                </span>
              </div>
            )}
          </div>

          <audio
            ref={audioRef}
            preload="none"
            src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhEUOlwOi6bxhW"
          />
        </DialogContent>
      </Dialog>
      <FloatingPill />
    </>
  );
}