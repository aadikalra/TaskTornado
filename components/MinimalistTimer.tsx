'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, RotateCcw, Play, Pause, Settings } from 'lucide-react';

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
  endTime: number | null; // timestamp in ms when the timer should end (only when running & not paused)
};

// Helper function to interpolate between two hex colors.
// Defined outside the component so it's not recreated on every render.
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  // Ensure factor is between 0 and 1
  const normalizedFactor = Math.max(0, Math.min(1, factor));

  const hex = (c: number) => Math.round(c).toString(16).padStart(2, '0');

  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = r1 + normalizedFactor * (r2 - r1);
  const g = g1 + normalizedFactor * (g2 - g1);
  const b = b1 + normalizedFactor * (b2 - b1);

  return `#${hex(r)}${hex(g)}${hex(b)}`;
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

  // use number | null so this is compatible with browsers (setInterval returns number)
  const intervalRef = useRef<number | null>(null);

  // Inline editable time input states
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(`${minutes}:${seconds.toString().padStart(2, '0')}`);

  // Cookie name
  const COOKIE_NAME = 'minimalist_timer_state_v1';

  // Cookie helpers (simple, client-only)
  const setCookie = (name: string, value: string, days = 7) => {
    const maxAge = days * 24 * 60 * 60;
    const opts = `path=/; max-age=${maxAge}; SameSite=Lax`;
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; ${opts}`;
    } catch (err) {
      // ignore cookie write errors
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
      // expire immediately
      document.cookie = `${name}=; path=/; max-age=0`;
    } catch (err) {
      console.warn('Failed to delete cookie', err);
    }
  };

  // Initialize total time when hours/minutes/seconds inputs change (or editing state)
  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTotalTime(totalSeconds);
    // only overwrite timeLeft when not running and not actively editing the time text
    if (!isRunning && !isEditingTime) {
      setTimeLeft(totalSeconds);
    }
  }, [hours, minutes, seconds, isRunning, isEditingTime]);

  // Keep the displayed text in sync with timeLeft when not editing
  useEffect(() => {
    if (!isEditingTime) {
      setTimeInput(formatTime(timeLeft));
    }
  }, [timeLeft, isEditingTime]);

  // Read cookie on mount and restore timer state
  useEffect(() => {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as TimerCookieState;

      // If cookie has totalTime, use that to set hours/minutes/seconds for UI consistency
      const tt = parsed.totalTime ?? parsed.timeLeft ?? (hours * 3600 + minutes * 60 + seconds);
      setHours(Math.floor(tt / 3600));
      setMinutes(Math.floor((tt % 3600) / 60));
      setSeconds(tt % 60);
      setTotalTime(tt);

      if (parsed.isRunning) {
        // If paused, restore paused state and the saved timeLeft
        if (parsed.isPaused) {
          setIsRunning(true);
          setIsPaused(true);
          setTimeLeft(parsed.timeLeft);
          updateAppTitle(parsed.timeLeft);
        } else {
          // running and not paused => try to compute remaining from endTime
          if (parsed.endTime) {
            const remaining = Math.max(0, Math.ceil((parsed.endTime - Date.now()) / 1000));
            if (remaining > 0) {
              setIsRunning(true);
              setIsPaused(false);
              setTimeLeft(remaining);
              updateAppTitle(remaining);
            } else {
              // timer already expired while away
              setIsRunning(false);
              setIsPaused(false);
              setTimeLeft(0);
              updateAppTitle(0);
              deleteCookie(COOKIE_NAME);
            }
          } else {
            // fallback if endTime missing: use stored timeLeft
            setIsRunning(true);
            setIsPaused(false);
            setTimeLeft(parsed.timeLeft);
            updateAppTitle(parsed.timeLeft);
          }
        }
      } else {
        // not running — just restore the saved timeLeft (or total)
        setIsRunning(false);
        setIsPaused(false);
        setTimeLeft(parsed.timeLeft ?? tt);
        updateAppTitle(parsed.timeLeft ?? tt);
      }
    } catch (err) {
      console.warn('Failed to parse timer cookie', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Persist timer state to cookie whenever relevant state changes
  useEffect(() => {
    // Build cookie state
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

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      // clear existing interval if any, then start a fresh one
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

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      playCompletionSound();
      updateAppTitle(totalTime);
      deleteCookie(COOKIE_NAME); // clear cookie on completion
      onComplete?.();
    } else {
      // update title while running
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
      // ignore audio errors
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
    deleteCookie(COOKIE_NAME); // clear cookie when resetting
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
    document.title = `⏰ ${timeString} - TaskTornado`;
  };

  // --- Parsing & committing the editable input ---
  const parseTimeString = (raw: string): number | null => {
    const s = raw.trim();
    if (s === '') return null;

    // Keep only digits and colons (we already filter on change too)
    const cleaned = s;
    const parts = cleaned.split(':').map(p => p.trim());

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
      // invalid input — revert to current display
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

    // Keep running state as-is; if running, the timer will continue from the new value
    setIsEditingTime(false);
  };
  
  // --- Progress and Color Calculation ---
  const percentDone = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  const BASE_INNER_COLOR = '#333333';
  const BASE_OUTER_COLOR = '#222222';
  const TARGET_COLOR = '#22c55e'; // Green
  
  const currentInnerColor = interpolateColor(BASE_INNER_COLOR, TARGET_COLOR, percentDone / 100);
  const currentOuterColor = interpolateColor(BASE_OUTER_COLOR, TARGET_COLOR, percentDone / 100);

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'}`}>
      {/* Minimized Pill View */}
      {isMinimized && (
        <div
          className="bg-gray-900/95 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl border border-gray-700/50 cursor-pointer hover:bg-gray-800/95 transition-all duration-300"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm">{formatTime(timeLeft)}</span>
          </div>
          {isRunning && (
            <div className="w-20 h-1 bg-gray-700/60 rounded overflow-hidden border border-gray-600 relative">
              <div
                className="absolute left-0 top-0 bottom-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 transition-all"
                style={{ width: `${Math.max(percentDone, 3)}%` }}
              />
            </div>
          )}
        </div>
      )}


      {/* Full Timer View */}
      {!isMinimized && (
        <div className="timer-app-container animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Timer Rings */}
          <div className="timer-rings">
            <div className="inner-ring"></div>
            <div className="outer-ring"></div>
          </div>

          {/* Timer Display */}
          <div className="timer-display">
            {/* Editable time input */}
            <input
              ref={inputRef}
              className="time-input"
              value={timeInput}
              onChange={(e) => {
                // allow only digits and colon (no spaces). User can delete characters as-needed.
                const filtered = e.target.value.replace(/[^\d:]/g, '');
                setTimeInput(filtered);
              }}
              onFocus={() => {
                setIsEditingTime(true);
                // NOTE: intentionally do NOT auto-select the whole value so the user can press Delete/backspace repeatedly
              }}
              onBlur={() => {
                commitTimeInput();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitTimeInput();
                  // blur so that the input returns to display mode
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === 'Escape') {
                  // Cancel edit and revert
                  setTimeInput(formatTime(timeLeft));
                  setIsEditingTime(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              inputMode="numeric"
              aria-label="Edit timer"
            />
          </div>
          <div className="controls">
            <button className="icon-button" onClick={resetTimer}>
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              className="start-button"
              onClick={isRunning ? pauseTimer : startTimer}
              disabled={totalTime === 0}
            >
              {isRunning ? (isPaused ? 'RESUME' : 'PAUSE') : 'START'}
            </button>

            <button className="icon-button" onClick={toggleMinimize}>
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>

          <style jsx>{`
            .timer-app-container {
              width: 350px;
              height: 350px;
              background-color: #111111;
              border-radius: 40px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              padding: 40px 20px;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }

            .timer-rings div {
              position: absolute;
              top: 45%; /* Moved up from 50% to center around time text */
              left: 50%;
              transform: translate(-50%, -50%);
              border-radius: 50%;
              transition: border-color 0.5s linear; /* Add transition for smooth color change */
            }

            .inner-ring {
              width: 230px;
              height: 230px;
              border: 1px solid ${currentInnerColor};
            }

            .outer-ring {
              width: 280px;
              height: 280px;
              border: 1px solid ${currentOuterColor};
            }

            .timer-display {
              text-align: center;
              color: #FFFFFF;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
              z-index: 10;
              margin-top: 20px; /* Reduced from 30px */
            }

            .time-input {
              font-size: 80px;
              font-weight: 600;
              margin: 0;
              letter-spacing: 2px;
              font-family: 'Courier New', monospace;
              background: transparent;
              border: none;
              color: #FFFFFF;
              outline: none;
              text-align: center;
              padding: 0;
              width: 260px; /* keep a stable width so layout doesn't jump */
            }
            
            .controls {
              width: 100%;
              display: flex;
              justify-content: space-around;
              align-items: center;
              z-index: 10;
              margin-top: 10px; /* Add some space above controls */
            }

            .start-button {
              background-color: #333333;
              color: #FFFFFF;
              border: none;
              padding: 15px 50px;
              font-size: 16px;
              font-weight: bold;
              border-radius: 30px;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }

            .start-button:hover {
              background-color: #444444;
            }

            .start-button:disabled {
              background-color: #222222;
              cursor: not-allowed;
            }

            .icon-button {
              background: none;
              border: none;
              color: #888;
              cursor: pointer;
              padding: 8px;
              border-radius: 50%;
              transition: color 0.2s ease, background-color 0.2s ease;
            }

            .icon-button:hover {
              color: #FFFFFF;
              background-color: rgba(255, 255, 255, 0.1);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}