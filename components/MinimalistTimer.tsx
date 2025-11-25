'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Minus } from 'lucide-react';

interface MinimalistTimerProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onSettingsClick?: () => void;
}

type TimerCookieState = {
  isRunning: boolean;
  isPaused: boolean;
  totalTime: number;
  timeLeft: number;
  endTime: number | null;
};

export function MinimalistTimer({ isVisible, onClose, onComplete }: MinimalistTimerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(`${minutes}:${seconds.toString().padStart(2, '0')}`);

  const COOKIE_NAME = 'minimalist_timer_state_v1';

  const setCookie = (name: string, value: string, days = 7) => {
    const maxAge = days * 24 * 60 * 60;
    const opts = `path=/; max-age=${maxAge}; SameSite=Lax`;
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; ${opts}`;
    } catch (err) {
      console.warn('Failed to write cookie', err);
    }
  };

  const getCookie = (name: string): string | null => {
    const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
    if (!match) return null;
    return match.split('=')[1];
  };

  const deleteCookie = (name: string) => {
    try {
      document.cookie = `${name}=; path=/; max-age=0`;
    } catch (err) {
      console.warn('Failed to delete cookie', err);
    }
  };

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTotalTime(totalSeconds);
    if (!isRunning && !isEditingTime) {
      setTimeLeft(totalSeconds);
    }
  }, [hours, minutes, seconds, isRunning, isEditingTime]);

  useEffect(() => {
    if (!isEditingTime) {
      setTimeInput(formatTime(timeLeft));
    }
  }, [timeLeft, isEditingTime]);

  useEffect(() => {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as TimerCookieState;
      const tt = parsed.totalTime ?? parsed.timeLeft ?? (hours * 3600 + minutes * 60 + seconds);
      setHours(Math.floor(tt / 3600));
      setMinutes(Math.floor((tt % 3600) / 60));
      setSeconds(tt % 60);
      setTotalTime(tt);

      if (parsed.isRunning) {
        if (parsed.isPaused) {
          setIsRunning(true);
          setIsPaused(true);
          setTimeLeft(parsed.timeLeft);
          updateAppTitle(parsed.timeLeft);
        } else {
          if (parsed.endTime) {
            const remaining = Math.max(0, Math.ceil((parsed.endTime - Date.now()) / 1000));
            if (remaining > 0) {
              setIsRunning(true);
              setIsPaused(false);
              setTimeLeft(remaining);
              updateAppTitle(remaining);
            } else {
              setIsRunning(false);
              setIsPaused(false);
              setTimeLeft(0);
              updateAppTitle(0);
              deleteCookie(COOKIE_NAME);
            }
          } else {
            setIsRunning(true);
            setIsPaused(false);
            setTimeLeft(parsed.timeLeft);
            updateAppTitle(parsed.timeLeft);
          }
        }
      } else {
        setIsRunning(false);
        setIsPaused(false);
        setTimeLeft(parsed.timeLeft ?? tt);
        updateAppTitle(parsed.timeLeft ?? tt);
      }
    } catch (err) {
      console.warn('Failed to parse timer cookie', err);
    }
  }, []);

  useEffect(() => {
    const cookieState: TimerCookieState = {
      isRunning,
      isPaused,
      totalTime,
      timeLeft,
      endTime: isRunning && !isPaused ? Date.now() + timeLeft * 1000 : null,
    };

    try {
      setCookie(COOKIE_NAME, JSON.stringify(cookieState), 7);
    } catch (err) {
      console.warn('Failed to save timer cookie', err);
    }
  }, [isRunning, isPaused, timeLeft, totalTime]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
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

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      playCompletionSound();
      updateAppTitle(totalTime);
      deleteCookie(COOKIE_NAME);
      onComplete?.();
    } else {
      if (isRunning) updateAppTitle(timeLeft);
    }
  }, [timeLeft, isRunning, totalTime, onComplete]);

  const playCompletionSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.warn('Audio playback failed', err);
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
    setIsPaused(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    updateAppTitle(totalTime);
    deleteCookie(COOKIE_NAME);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
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

  const updateAppTitle = (remainingSeconds: number) => {
    const timeString = formatTime(remainingSeconds);
    document.title = `${timeString} - TaskTornado`;
  };

  const parseTimeString = (raw: string): number | null => {
    const s = raw.trim();
    if (s === '') return null;

    const parts = s.split(':').map(p => p.trim());

    if (parts.length === 1) {
      const mm = Number(parts[0]);
      if (Number.isNaN(mm) || mm < 0) return null;
      return Math.floor(mm) * 60;
    }

    if (parts.length === 2) {
      const mm = Number(parts[0]);
      const ss = Number(parts[1]);
      if (Number.isNaN(mm) || Number.isNaN(ss) || mm < 0 || ss < 0) return null;
      return Math.floor(mm) * 60 + Math.floor(ss);
    }

    if (parts.length === 3) {
      const hh = Number(parts[0]);
      const mm = Number(parts[1]);
      const ss = Number(parts[2]);
      if (Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(ss) || hh < 0 || mm < 0 || ss < 0) return null;
      return Math.floor(hh) * 3600 + Math.floor(mm) * 60 + Math.floor(ss);
    }

    return null;
  };

  const commitTimeInput = () => {
    const parsed = parseTimeString(timeInput);
    if (parsed === null) {
      setTimeInput(formatTime(timeLeft));
      setIsEditingTime(false);
      return;
    }

    const totalSeconds = parsed;
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;

    setHours(hh);
    setMinutes(mm);
    setSeconds(ss);

    setTotalTime(totalSeconds);
    setTimeLeft(totalSeconds);
    updateAppTitle(totalSeconds);
    setIsEditingTime(false);
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Minimized View */}
      {isMinimized && (
        <button
          onClick={toggleMinimize}
          className="group flex items-center gap-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-full pl-4 pr-5 py-2.5 transition-all duration-200"
        >
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#262626"
                strokeWidth="2"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 - (progress / 100) * 2 * Math.PI * 14}
                className="transition-all duration-1000"
              />
            </svg>
            {isRunning && !isPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <span className="font-mono text-lg text-white tracking-wide">
            {formatTime(timeLeft)}
          </span>
        </button>
      )}

      {/* Full View */}
      {!isMinimized && (
        <div className="w-80 bg-neutral-950 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          {/* Minimize Button */}
          <button
            onClick={toggleMinimize}
            className="absolute top-4 right-4 p-2 text-neutral-600 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Timer Ring */}
          <div className="relative w-56 h-56 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90">
              {/* Background Ring */}
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="#171717"
                strokeWidth="4"
              />
              {/* Progress Ring */}
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 - (progress / 100) * 2 * Math.PI * 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={timeInput}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^\d:]/g, '');
                  setTimeInput(filtered);
                }}
                onFocus={() => setIsEditingTime(true)}
                onBlur={() => commitTimeInput()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitTimeInput();
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === 'Escape') {
                    setTimeInput(formatTime(timeLeft));
                    setIsEditingTime(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="bg-transparent text-center text-5xl font-light text-white tracking-wider w-44 outline-none font-mono selection:bg-green-500/20"
                aria-label="Timer"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-all"
              aria-label="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              disabled={totalTime === 0}
              className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-white text-sm font-medium tracking-widest rounded-full transition-all"
            >
              {isRunning ? (isPaused ? 'RESUME' : 'PAUSE') : 'START'}
            </button>

            <div className="w-11" /> {/* Spacer for balance */}
          </div>
        </div>
      )}
    </div>
  );
}