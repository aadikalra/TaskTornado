'use client';

import React, { useState } from 'react';
import { PixelCat } from '@/components/PixelCat';

export default function ImagesTestPage() {
  const [size, setSize] = useState<number>(320);
  const [showCrown, setShowCrown] = useState<boolean>(false);
  const [showGlasses, setShowGlasses] = useState<boolean>(false);
  const [showHeadphones, setShowHeadphones] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showBowtie, setShowBowtie] = useState<boolean>(true);
  const [showSunglasses, setShowSunglasses] = useState<boolean>(false);
  const [showGraduation, setShowGraduation] = useState<boolean>(false);

  const [bgColor, setBgColor] = useState<string>('light');

  const bgClasses: Record<string, string> = {
    light: 'bg-white text-slate-900 border-slate-200 shadow-sm',
    soft: 'bg-slate-100 text-slate-900 border-slate-200',
    dark: 'bg-slate-900 text-white border-slate-800',
    checkerboard: 'bg-slate-50 text-slate-900 border-slate-200 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-sky-600">
              🐾 PixelCat SVG Test Bench
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Preview, inspect, and test all SVG variations, accessories, and scale states of the geometric cat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white text-slate-700 font-mono px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              /images
            </span>
          </div>
        </div>

        {/* Interactive Playground & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
              🎛️ Live Controls
            </h2>

            {/* Accessory Toggles */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Accessories
              </label>
              
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">👑 Golden Crown</span>
                <input
                  type="checkbox"
                  checked={showCrown}
                  onChange={(e) => setShowCrown(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">👓 Study Glasses & Coffee</span>
                <input
                  type="checkbox"
                  checked={showGlasses}
                  onChange={(e) => setShowGlasses(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">🎧 Gamer Headphones</span>
                <input
                  type="checkbox"
                  checked={showHeadphones}
                  onChange={(e) => setShowHeadphones(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">🧙‍♂️ Wizard Hat</span>
                <input
                  type="checkbox"
                  checked={showWizard}
                  onChange={(e) => setShowWizard(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">🎀 Red Bowtie</span>
                <input
                  type="checkbox"
                  checked={showBowtie}
                  onChange={(e) => setShowBowtie(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">🕶️ Cool Sunglasses</span>
                <input
                  type="checkbox"
                  checked={showSunglasses}
                  onChange={(e) => setShowSunglasses(e.target.checked)}
                  className="w-4 h-4 accent-zinc-800 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">🎓 Graduation Cap</span>
                <input
                  type="checkbox"
                  checked={showGraduation}
                  onChange={(e) => setShowGraduation(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Display Size</span>
                <span className="text-sky-600 font-mono text-sm">{size}px</span>
              </div>
              <input
                type="range"
                min="80"
                max="640"
                step="20"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Background Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Canvas Background
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(bgClasses).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBgColor(key)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      bgColor === key
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Display */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center min-h-[440px]">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full text-left">
              Live Preview
            </h2>
            
            <div className={`p-8 rounded-2xl border ${bgClasses[bgColor]} flex items-center justify-center my-auto transition-all`}>
              <PixelCat
                size={size}
                is100PercentDone={showCrown}
                isNightStudy={showGlasses}
                isHeadphones={showHeadphones}
                isWizard={showWizard}
                isBowtie={showBowtie}
                isSunglasses={showSunglasses}
                isGraduation={showGraduation}
              />
            </div>

            <div className="w-full text-center text-xs text-slate-400 font-mono">
              ViewBox: 185 40 760 1054 • Animated Blinking: Active (~3.8s)
            </div>
          </div>

        </div>

        {/* Preset Gallery */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            🖼️ Preset Variations & Ideas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Base Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Cat</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} is100PercentDone={false} isNightStudy={false} />
              </div>
              <p className="text-xs text-slate-500 text-center">Clean base geometric cat</p>
            </div>

            {/* Scholar Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Scholar Cat 👓</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} is100PercentDone={false} isNightStudy={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Night study glasses + Coffee mug</p>
            </div>

            {/* Royal Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Royal Cat 👑</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} is100PercentDone={true} isNightStudy={false} />
              </div>
              <p className="text-xs text-slate-500 text-center">100% Homework done crown</p>
            </div>

            {/* Gamer Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">Gamer Cat 🎧</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} isHeadphones={true} isBowtie={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Cyan over-ear headphones</p>
            </div>

            {/* Wizard Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Wizard Cat 🧙‍♂️</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} isWizard={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Indigo magic wizard hat with stars</p>
            </div>

            {/* Cool Shades Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Cool Cat 🕶️</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} isSunglasses={true} isBowtie={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Dark wayfarer sunglasses</p>
            </div>

            {/* Graduate Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Graduate Cat 🎓</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} isGraduation={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Mortarboard graduation cap</p>
            </div>

            {/* Ultimate Cat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Ultimate Cat ✨</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center w-full min-h-[190px]">
                <PixelCat size={160} is100PercentDone={true} isNightStudy={true} isBowtie={true} />
              </div>
              <p className="text-xs text-slate-500 text-center">Crown + Glasses + Coffee + Bowtie</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
