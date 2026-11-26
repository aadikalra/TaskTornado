'use client';

import { useState } from 'react';
import { AuroraAvatar } from '@/components/ai-assistant/AuroraAvatar';
import {
  AURORA_EXPRESSIONS,
  AURORA_EYES,
  AURORA_PALETTES,
  AURORA_SHAPES,
  DEFAULT_AURORA_APPEARANCE,
  saveAuroraAppearance,
  useAuroraAppearance,
  type AuroraExpression,
} from '@/components/ai-assistant/aurora-appearance';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const choiceClass = 'cursor-pointer border border-sky-100 bg-white font-medium text-sky-900 hover:bg-sky-50 has-checked:border-sky-400 has-checked:bg-sky-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-500 dark:border-gray-700 dark:bg-gray-900 dark:text-sky-100 dark:hover:bg-sky-500/10 dark:has-checked:border-sky-400 dark:has-checked:bg-sky-500/15';
const avatarChoiceClass = `${choiceClass} flex min-w-0 flex-col items-center justify-center rounded-lg px-0.5 pb-1.5 pt-0.5 text-[11px]`;

export function AuroraAppearanceSettings() {
  const appearance = useAuroraAppearance();
  const [draft, setDraft] = useState(appearance);
  const [expression, setExpression] = useState<AuroraExpression>('idle');
  const [open, setOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(appearance);
      setExpression('idle');
      setSaveError(false);
    }
    setOpen(nextOpen);
  }

  function handleSave() {
    try {
      saveAuroraAppearance(draft);
      setOpen(false);
    } catch {
      setSaveError(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div id="aurora-avatar" className="flex items-center justify-between gap-3 rounded-xl px-1 py-3.5 transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-2 text-[14px] font-medium text-sky-900 dark:text-sky-100">
          <AuroraAvatar className="size-6" motionEnabled={false} />
          Aurora Avatar
        </div>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Customize Aurora avatar"
            className="rounded-xl border border-sky-200/60 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800/40 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:bg-sky-900/50"
          >
            Customize
          </button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[28px] border-sky-100 bg-white p-0 dark:border-gray-800 dark:bg-gray-900 sm:max-w-xl motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none">
        <div className="border-b border-sky-100 px-5 py-4 pr-12 dark:border-gray-800 sm:px-6">
          <DialogTitle className="text-base font-bold leading-snug text-sky-950 dark:text-white">
            Aurora Avatar
          </DialogTitle>
          <DialogDescription className="sr-only">
            Customize Aurora’s shape, color, eyes, and blinking. Try each chat expression in the preview.
          </DialogDescription>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-6">
          <div className="self-start rounded-2xl border border-sky-100 bg-[#f5f9fc] p-3 dark:border-gray-800 dark:bg-slate-950/65">
            <div className="grid min-h-28 place-items-center">
              <AuroraAvatar appearance={draft} expression={expression} className="size-28" />
            </div>
            <fieldset className="grid grid-cols-3 gap-1 border-t border-sky-100 pt-2 dark:border-gray-800 sm:grid-cols-2">
              <legend className="sr-only">Preview expression</legend>
              {AURORA_EXPRESSIONS.map(option => (
                <label key={option.id} className={`${choiceClass} flex min-h-8 items-center justify-center rounded-lg px-1 text-center text-[11px]`}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="aurora-preview-expression"
                    value={option.id}
                    checked={expression === option.id}
                    onChange={() => setExpression(option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          </div>

          <div className="min-w-0 space-y-4 text-sm text-sky-950 dark:text-sky-100">
            <fieldset className="grid grid-cols-4 gap-1.5">
              <legend className="mb-2 font-semibold">Shape</legend>
              {AURORA_SHAPES.map(option => (
                <label key={option.id} className={avatarChoiceClass}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="aurora-avatar-shape"
                    value={option.id}
                    checked={draft.shape === option.id}
                    onChange={() => setDraft(previous => ({ ...previous, shape: option.id }))}
                  />
                  <AuroraAvatar appearance={{ ...draft, shape: option.id }} motionEnabled={false} className="size-8" />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <fieldset className="flex flex-wrap gap-2">
              <legend className="mb-2 font-semibold">Color</legend>
              {AURORA_PALETTES.map(option => (
                <label key={option.id} title={option.label} className={`${choiceClass} grid size-9 place-items-center rounded-full`}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="aurora-avatar-color"
                    value={option.id}
                    checked={draft.palette === option.id}
                    onChange={() => setDraft(previous => ({ ...previous, palette: option.id }))}
                  />
                  <span aria-hidden="true" className="size-5 rounded-full" style={{ backgroundColor: option.body }} />
                  <span className="sr-only">{option.label}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="grid grid-cols-4 gap-1.5">
              <legend className="mb-2 font-semibold">Eyes</legend>
              {AURORA_EYES.map(option => (
                <label key={option.id} className={avatarChoiceClass}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="aurora-avatar-eyes"
                    value={option.id}
                    checked={draft.eyes === option.id}
                    onChange={() => setDraft(previous => ({ ...previous, eyes: option.id }))}
                  />
                  <AuroraAvatar appearance={{ ...draft, eyes: option.id }} motionEnabled={false} className="size-8" />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <label className="flex items-center justify-between gap-3 border-t border-sky-100 pt-3 dark:border-gray-800">
              <span className="font-medium">Blink</span>
              <Switch
                aria-label="Blink"
                checked={draft.blink}
                onCheckedChange={blink => setDraft(previous => ({ ...previous, blink }))}
              />
            </label>
          </div>
        </div>

        {saveError && (
          <p role="alert" className="px-5 pb-3 text-xs text-rose-700 dark:text-rose-300 sm:px-6">
            This browser couldn’t save your avatar.
          </p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-sky-100 px-5 py-3 dark:border-gray-800 sm:px-6">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_AURORA_APPEARANCE)}
            className="rounded-lg px-2 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#275085] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:text-slate-950 dark:hover:bg-sky-300"
          >
            Save avatar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
