'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { IconHanger } from '@tabler/icons-react';
import { PixelCat } from '@/components/PixelCat';
import { useCatFriendship, feedCatTreat } from '@/lib/catTreats';
import { SHOP_ITEMS, ShopItem, useCatShop, buyShopItem, toggleEquipItem } from '@/lib/catShop';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function CatShopPage() {
  const { authenticated } = useRequireAuth();
  const { getContainerClass } = useWideLayout();
  const { catData } = useCatFriendship();
  const { unlocked, equipped } = useCatShop();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hats' | 'eyewear' | 'accessories'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!authenticated) return null;

  const triggerFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleBuy = (item: ShopItem) => {
    const res = buyShopItem(item);
    if (res.success) {
      triggerFeedback(res.message, 'success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      triggerFeedback(res.message, 'error');
    }
  };

  const handleEquip = (itemId: string) => {
    toggleEquipItem(itemId);
  };

  const handleFeed = () => {
    const res = feedCatTreat();
    if (res.success) {
      triggerFeedback('💖 Om nom nom! +15 XP', 'success');
    } else {
      triggerFeedback('No treats left! Complete tasks to earn 🐟 treats.', 'error');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  // Compute live props for PixelCat preview
  const is100PercentDone = equipped.includes('crown');
  const isNightStudy = equipped.includes('glasses');
  const isHeadphones = equipped.includes('headphones');
  const isWizard = equipped.includes('wizard');
  const isBowtie = equipped.includes('bowtie');
  const isSunglasses = equipped.includes('sunglasses');
  const isGraduation = equipped.includes('graduation');

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative selection:bg-sky-100 dark:selection:bg-sky-900/30">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 space-y-8">
      
      {/* Top Navigation & Feedback Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
            Cat Wardrobe
          </h1>
          <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 font-medium">
            Spend your earned 🐟 Fish Treats to unlock royal crowns, wizard hats, studio headphones, and cool shades!
          </p>
        </div>

        {/* Balance & Level Pill */}
        <div className="flex items-center gap-3 bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[20px] p-3 shadow-sm self-start sm:self-auto">
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl drop-shadow-sm">🐟</span>
            <div>
              <div className="text-[11px] text-sky-700/60 dark:text-sky-300/60 font-bold uppercase tracking-wider">Fish Treats</div>
              <div className="text-lg font-black text-amber-500">{catData.treats}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-sky-200/50 dark:bg-sky-800/30" />
          <div className="px-2">
            <div className="text-[11px] text-sky-700/60 dark:text-sky-300/60 font-bold uppercase tracking-wider">Friendship</div>
            <div className="text-sm font-bold text-sky-500 dark:text-sky-400 mt-0.5">Lv.{catData.level} {catData.levelTitle}</div>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-sm ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Dressing Room Preview + Shop Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Cat Dressing Room (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-between min-h-[460px]">
            <div className="w-full flex items-center justify-between border-b border-sky-100 dark:border-sky-900/20 pb-3">
              <span className="text-xs font-bold text-sky-600/70 dark:text-sky-400/70 uppercase tracking-wider flex items-center gap-1.5">
                <IconHanger className="w-4 h-4 text-sky-500" />
                Dressing Room Preview
              </span>
              <span className="text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-full border border-sky-100 dark:border-sky-500/20 shadow-sm">
                {equipped.length} Equipped
              </span>
            </div>

            {/* Live Cat Display */}
            <div className="relative py-8 flex items-center justify-center my-auto">
              <PixelCat
                size={340}
                is100PercentDone={is100PercentDone}
                isNightStudy={isNightStudy}
                isHeadphones={isHeadphones}
                isWizard={isWizard}
                isBowtie={isBowtie}
                isSunglasses={isSunglasses}
                isGraduation={isGraduation}
              />
            </div>

            {/* Action Bar Under Preview */}
            <div className="w-full pt-4 border-t border-sky-100 dark:border-sky-900/20 flex items-center justify-between gap-3">
              <div className="text-xs text-sky-600/80 dark:text-sky-400/80">
                <span className="font-bold text-sky-800 dark:text-sky-200">Felix</span> the Cat
              </div>
              <button
                onClick={handleFeed}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-[14px] transition-transform active:scale-95 shadow-md shadow-amber-500/20"
              >
                Feed 🐟 (+15 XP)
              </button>
            </div>
          </div>

          {/* How to Earn Treats Info Card */}
          <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[20px] p-5 flex items-start gap-3">
            <HugeIcon name="LightBulb02" size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-800 dark:text-sky-200 leading-relaxed">
              <strong className="block font-bold mb-1">How to earn more Fish Treats 🐟:</strong>
              <span className="text-sky-600/80 dark:text-sky-400/80 font-medium">Completing any homework assignment, study task, or test automatically awards +1 Fish Treat!</span>
            </div>
          </div>
        </div>

        {/* Right Column: Shop Items & Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'all', label: 'All Items 🎒' },
              { id: 'hats', label: 'Hats & Caps 👑' },
              { id: 'eyewear', label: 'Glasses 👓' },
              { id: 'accessories', label: 'Accessories 🎧' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 border ${
                  selectedCategory === tab.id
                    ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400 border-transparent'
                    : 'text-sky-600/90 dark:text-sky-400/90 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const isUnlocked = unlocked.includes(item.id);
              const isEquipped = equipped.includes(item.id);
              const canAfford = catData.treats >= item.price;

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-zinc-900/60 border rounded-[20px] p-5 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                    isEquipped
                      ? 'border-sky-400 dark:border-sky-500 ring-2 ring-sky-400/20 dark:ring-sky-500/20'
                      : 'border-sky-200/40 dark:border-sky-800/20 hover:border-sky-300 dark:hover:border-sky-700/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-[#f5f9fc] dark:bg-zinc-800/80 rounded-[14px] border border-sky-100 dark:border-sky-800/30">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-sky-900 dark:text-white">
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-bold text-sky-600/70 dark:text-sky-400/70 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Status / Price Badge */}
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-500/20 shadow-sm flex items-center gap-1">
                          <span className="text-sm">🐟</span> {item.price}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-sky-700 dark:text-sky-300 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-sky-100 dark:border-sky-900/20 flex items-center justify-between">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item.id)}
                        className={`w-full py-2.5 rounded-[12px] text-xs font-bold transition-all ${
                          isEquipped
                            ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30'
                            : 'bg-sky-800 dark:bg-sky-100 text-white dark:text-sky-900 hover:opacity-90 shadow-sm'
                        }`}
                      >
                        {isEquipped ? 'Equipped ✓' : 'Equip Outfit'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-[12px] text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                            : 'bg-[#f5f9fc] dark:bg-zinc-800/80 text-sky-400 dark:text-sky-600/50 cursor-not-allowed border border-sky-100 dark:border-sky-900/20'
                        }`}
                      >
                        {canAfford ? `Unlock for 🐟 ${item.price}` : `Need 🐟 ${item.price - catData.treats} More`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
      </div>
    </div>
  );
}
