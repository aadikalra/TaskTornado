'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { AnimateIcon } from './animate-ui/animate-icon';
import { Timer } from './animate-ui/icons/timer';

interface TimerProps {
  trigger?: React.ReactNode;
  onComplete?: () => void;
}

export function StudyTimer({ trigger, onComplete }: TimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cookie management with better debugging
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;
        console.log(`Loaded cookie ${name}:`, cookieValue);
        return cookieValue;
      }
      return null;
    } catch (e) {
      console.error('Error reading cookie:', e);
      return null;
    }
  };

  const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
      document.cookie = cookieString;
      console.log(`Saved cookie ${name}:`, value);
    } catch (e) {
      console.error('Error setting cookie:', e);
    }
  };

  // Load timer state from cookies on mount
  useEffect(() => {
    const savedTimer = getCookie('studyTimer');
    if (savedTimer) {
      try {
        const timerData = JSON.parse(savedTimer);
        console.log('Parsed timer data:', timerData);

        // Validate the data
        if (timerData && typeof timerData === 'object') {
          // Restore the timer settings
          setHours(timerData.hours || 0);
          setMinutes(timerData.minutes || 25);
          setSeconds(timerData.seconds || 0);
          setIsRunning(timerData.isRunning || false);
          setIsPaused(timerData.isPaused || false);

          // Use saved timeLeft if available, otherwise calculate from total
          if (timerData.timeLeft !== undefined && timerData.timeLeft > 0) {
            setTimeLeft(timerData.timeLeft);
            setTotalTime(timerData.totalTime || 0);
            console.log('Restored timer with timeLeft:', timerData.timeLeft);
          } else {
            // Fallback: calculate from inputs
            const totalSeconds = (timerData.hours || 0) * 3600 + (timerData.minutes || 25) * 60 + (timerData.seconds || 0);
            setTotalTime(totalSeconds);
            setTimeLeft(totalSeconds);
            console.log('Calculated timer from inputs:', totalSeconds);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved timer:', e);
      }
    } else {
      console.log('No saved timer found');
    }
  }, []);

  // Save timer state to cookies when timer state changes (debounced)
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
          totalTime
        };
        setCookie('studyTimer', JSON.stringify(timerState));
      }, 500); // Debounce saves by 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [hours, minutes, seconds, isRunning, isPaused, timeLeft, totalTime]);

  // Initialize total time when inputs change
  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTotalTime(totalSeconds);
    if (!isRunning) {
      setTimeLeft(totalSeconds);
    }
  }, [hours, minutes, seconds, isRunning]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      playCompletionSound();
      updateAppTitle(totalTime);
      clearTimerCookie(); // Clear cookie when timer completes
      onComplete?.();
    }
  }, [timeLeft, isRunning, totalTime, onComplete]);

  const updateAppTitle = (remainingSeconds: number) => {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const timeString = hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.title = `⏰ ${timeString} - TaskTornado`;
  };

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const clearTimerCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'studyTimer=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('Cleared timer cookie');
    }
  };

  const startTimer = () => {
    if (totalTime > 0) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(totalTime);
      updateAppTitle(totalTime);
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    updateAppTitle(totalTime);
    clearTimerCookie(); // Clear cookie when resetting
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
          <Timer/>
            Study Timer
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer animateOnHover />
            Study Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Input */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Set Timer Duration</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours" className="text-sm">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center"
                  disabled={isRunning}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes" className="text-sm">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center"
                  disabled={isRunning}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seconds" className="text-sm">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center"
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-primary">
              {formatTime(timeLeft)}
            </div>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button onClick={startTimer} disabled={totalTime === 0} className="gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}

            <Button onClick={resetTimer} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Status */}
          <div className="text-center text-sm text-muted-foreground">
            {isRunning && !isPaused ? (
              <span className="text-green-600">Timer running...</span>
            ) : isPaused ? (
              <span className="text-yellow-600">Timer paused</span>
            ) : timeLeft === 0 && totalTime > 0 ? (
              <span className="text-blue-600">Timer completed!</span>
            ) : (
              <span>Ready to start</span>
            )}
          </div>
        </div>

        {/* Hidden audio element for completion sound */}
        <audio
          ref={audioRef}
          preload="none"
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhEUOlwOi6bxhW"
        />
      </DialogContent>
    </Dialog>
  );
}
