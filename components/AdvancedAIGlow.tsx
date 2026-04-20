'use client';

import React, { useState, useEffect } from 'react';
import MiniAIAssistant from './MiniAIAssistant';

interface AdvancedAIGlowProps {
  enabled: boolean;
}

export default function AdvancedAIGlow({ enabled }: AdvancedAIGlowProps) {
  const [intensity, setIntensity] = useState(0);
  const [isGlowOn, setIsGlowOn] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIntensity = localStorage.getItem('novaGlowIntensity');
      const savedGlowState = localStorage.getItem('novaGlowOn');

      if (savedIntensity) setIntensity(Number(savedIntensity));
      if (savedGlowState) setIsGlowOn(savedGlowState === 'true');
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novaGlowIntensity', intensity.toString());
      localStorage.setItem('novaGlowOn', isGlowOn.toString());
    }
  }, [intensity, isGlowOn]);

  // Toggle glow with cmd-/ shortcut
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsGlowOn(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  const currentOpacity = isGlowOn ? (0.3 + (intensity / 150) * 0.7) : 0;
  const currentSpread = isGlowOn ? (1.0 + (intensity / 150) * 0.5) : 1;

  if (!enabled) return null;

  return (
    <>
      {/* Dedicated blur layer behind the glow */}
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-700 ease-in-out blur-[40px]"
        style={{ 
          opacity: currentOpacity
        }}
      />

      {/* Mini AI Assistant input */}
      <MiniAIAssistant enabled={isGlowOn} />

      <style>{`
        .nova-b-t1 { top: -20px; left: 5%; width: 50%; height: 150px; animation: nova-move-h 3s infinite alternate ease-in-out; }
        .nova-b-t2 { top: -15px; right: 5%; width: 45%; height: 130px; animation: nova-move-h-rev 4s infinite alternate ease-in-out; }
        .nova-b-r1 { top: 10%; right: -20px; width: 150px; height: 50%; animation: nova-move-v 3.5s infinite alternate ease-in-out; }
        .nova-b-r2 { bottom: 10%; right: -15px; width: 130px; height: 45%; animation: nova-move-v-rev 2.75s infinite alternate ease-in-out; }
        .nova-b-b1 { bottom: -20px; left: 10%; width: 50%; height: 150px; animation: nova-move-h 3.75s infinite alternate ease-in-out; }
        .nova-b-b2 { bottom: -15px; right: 5%; width: 45%; height: 140px; animation: nova-move-h-rev 3s infinite alternate ease-in-out; }
        .nova-b-l1 { top: 15%; left: -20px; width: 140px; height: 45%; animation: nova-move-v-rev 3.25s infinite alternate ease-in-out; }
        .nova-b-l2 { bottom: 10%; left: -15px; width: 130px; height: 50%; animation: nova-move-v 4.25s infinite alternate ease-in-out; }
        .nova-b-tl { top: -20px; left: -20px; width: 200px; height: 200px; animation: nova-move-corner-tl 3s infinite alternate ease-in-out; }
        .nova-b-tr { top: -20px; right: -20px; width: 190px; height: 210px; animation: nova-move-corner-tr 3.5s infinite alternate ease-in-out; }
        .nova-b-bl { bottom: -20px; left: -20px; width: 210px; height: 190px; animation: nova-move-corner-bl 4s infinite alternate ease-in-out; }
        .nova-b-br { bottom: -20px; right: -20px; width: 190px; height: 200px; animation: nova-move-corner-br 2.75s infinite alternate ease-in-out; }

        @keyframes nova-move-h {
            0% { transform: translate(0, 0) scaleY(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            100% { transform: translate(40px, 10px) scaleY(1.4) scaleX(1.1); border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%; }
        }
        @keyframes nova-move-h-rev {
            0% { transform: translate(0, 0) scaleY(1); border-radius: 50% 50% 50% 50%; }
            100% { transform: translate(-40px, 15px) scaleY(1.3) scaleX(0.9); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
        @keyframes nova-move-v {
            0% { transform: translate(0, 0) scaleX(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            100% { transform: translate(-15px, 40px) scaleX(1.5) scaleY(1.1); border-radius: 70% 30% 40% 60% / 60% 40% 50% 50%; }
        }
        @keyframes nova-move-v-rev {
            0% { transform: translate(0, 0) scaleX(1); border-radius: 50%; }
            100% { transform: translate(-10px, -40px) scaleX(1.4); border-radius: 30% 70% 50% 50% / 50% 50% 70% 30%; }
        }
        @keyframes nova-move-corner-tl {
            0% { transform: translate(0,0) scale(1) rotate(0deg); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            100% { transform: translate(15px, 15px) scale(1.3) rotate(20deg); border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
        }
        @keyframes nova-move-corner-tr {
            0% { transform: translate(0,0) scale(1) rotate(0deg); border-radius: 50% 50% 40% 60%; }
            100% { transform: translate(-15px, 15px) scale(1.4) rotate(-20deg); border-radius: 30% 70% 60% 40%; }
        }
        @keyframes nova-move-corner-bl {
            0% { transform: translate(0,0) scale(1) rotate(0deg); border-radius: 60% 40% 50% 50%; }
            100% { transform: translate(15px, -15px) scale(1.35) rotate(15deg); border-radius: 40% 60% 70% 30%; }
        }
        @keyframes nova-move-corner-br {
            0% { transform: translate(0,0) scale(1) rotate(0deg); border-radius: 40% 60% 30% 70%; }
            100% { transform: translate(-15px, -15px) scale(1.25) rotate(-15deg); border-radius: 50% 50% 60% 40%; }
        }
      `}</style>

      {/* Full screen glow effect */}
      <div 
        className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-700 ease-in-out blur-[30px] backdrop-blur-[30px]"
        style={{ 
          opacity: currentOpacity,
          transform: `scale(${currentSpread})` 
        }}
      >
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-tl bg-blue-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-tr bg-blue-600"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-bl bg-blue-400"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-br bg-blue-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-t1 bg-blue-400"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-t2 bg-sky-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-r1 bg-blue-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-r2 bg-blue-400"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-b1 bg-blue-600"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-b2 bg-blue-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-l1 bg-sky-500"></div>
        <div className="absolute blur-[65px] rounded-full transition-all duration-300 nova-b-l2 bg-blue-600"></div>
      </div>
    </>
  );
}
