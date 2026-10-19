'use client';

import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import focusStyles from '@/components/HomeworkFormFocus.module.css';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassContext } from '../context/ClassContext';
import { useTestContext } from '../context/TestContext';
import { useToast } from '@/context/ToastContext';
import { useUpgrade } from '@/context/UpgradeContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { getDashboardClassIconColor, getNewHomeClassColor } from '@/lib/class-display-colors';
import { HugeIcon } from '@/lib/huge-icon-map';
import { HomeworkLinkInput } from './HomeworkLinkInput';
import { TestTimePicker } from './TestTimePicker';
import { QuickFillInput } from '@/components/main-app/QuickFillInput';
import { format, addDays } from 'date-fns';

type StudyMaterialLink = { id: string; url: string; title?: string };
type TestEntryMode = 'normal' | 'quick-fill';

const TEST_TYPES = ['ALPHA', 'BETA', 'Quiz', 'Midterm', 'Final', 'Other'];

// Build a compact date reference so the AI doesn't have to do calendar math
function getDateReference(): string {
  const now = new Date();
  const lines: string[] = [];
  for (let i = 0; i <= 13; i++) {
    const d = addDays(now, i);
    const label = i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : '';
    lines.push(`${format(d, 'EEE MMM d')} = ${format(d, 'yyyy-MM-dd')}${label ? ` (${label})` : ''}`);
  }
  return lines.join(', ');
}

type AddTestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
};

const labelClass = 'text-xs font-medium text-sky-700 dark:text-sky-300 ml-1';
const triggerClass = "[&_svg:not([class*='text-'])]:!text-sky-500 w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-sky-50/50 dark:hover:bg-sky-500/5 hover:border-sky-200 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none";
const itemClass = 'text-sky-900 dark:text-sky-100 focus:bg-sky-50 dark:focus:bg-sky-500/15 focus:text-sky-950 dark:focus:text-white text-sm rounded-lg py-2 px-2.5 cursor-pointer transition-colors outline-none';
const contentClass = `${focusStyles.scope} [&_svg:not([class*='text-'])]:!text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 p-1`;

export const AddTestModal = ({ isOpen, onClose, defaultClassId }: AddTestModalProps) => {
  const { classes } = useClassContext();
  const { addTest } = useTestContext();
  const { success, error: toastError } = useToast();
  const { handlePlanLimitError } = useUpgrade();
  const { isDark } = useDarkMode();
  const pathname = usePathname();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testType, setTestType] = useState('Quiz');
  const [testTime, setTestTime] = useState('');
  const [description, setDescription] = useState('');
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialLink[]>([]);
  const [entryMode, setEntryMode] = useState<TestEntryMode>('normal');
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);

  const [autoFillText, setAutoFillText] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const [modalTop, setModalTop] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setModalTop(null);
      return;
    }

    // Center the opening height once; later content changes grow downward.
    const openingHeight = modalRef.current?.offsetHeight || 0;
    const updatePosition = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      setModalTop(Math.max(16, (viewportHeight - Math.min(openingHeight, viewportHeight - 32)) / 2));
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.visualViewport?.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleAutoFill = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const classNames = classes.map((c: any) => c.name).join(', ');
      const today = format(new Date(), 'yyyy-MM-dd');
      const dayOfWeek = format(new Date(), 'EEEE');
      const dateRef = getDateReference();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are helping a student fill out a test/exam form. Today is ${dayOfWeek}, ${today}.

Date reference (use these exact dates): ${dateRef}

Available classes: ${classNames}
Test type options: ALPHA, BETA, Quiz, Midterm, Final, Other

The student typed: "${inputText}"

Return ONLY a JSON object with whichever fields you can determine:
- "title": string (the test title/name)
- "className": string (must exactly match one of the available classes)
- "testDate": string (use the date reference above to pick the correct yyyy-MM-dd date)
- "testType": "ALPHA" | "BETA" | "Quiz" | "Midterm" | "Final" | "Other"
- "testTime": string (24h format like "10:30")
- "description": string (any extra details)

Only include fields you are confident about. Omit unknown fields.
Return ONLY valid JSON, no explanation, no markdown.`,
          action: 'generate',
          model: 'gemini-2.5-flash-lite'
        })
      });

      if (!response.ok) throw new Error('Quick Fill request failed.');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Quick Fill returned no response.');
      const decoder = new TextDecoder();
      let text = '';
      let pending = '';
      const readLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        try {
          const data = JSON.parse(line.slice(6));
          if (typeof data.response === 'string') text += data.response;
        } catch { }
      };
      while (true) {
        const { done, value } = await reader.read();
        pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
        const lines = pending.split('\n');
        pending = lines.pop() || '';
        lines.forEach(readLine);
        if (done) {
          if (pending) readLine(pending);
          break;
        }
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Quick Fill returned no test details.');
      const parsed = JSON.parse(jsonMatch[0]);
      let filled = false;

      if (parsed.title) { setTitle(parsed.title); filled = true; }
      if (parsed.description) { setDescription(parsed.description); filled = true; }
      if (parsed.testTime) { setTestTime(parsed.testTime); filled = true; }
      if (parsed.testType && TEST_TYPES.includes(parsed.testType)) {
        setTestType(parsed.testType);
        filled = true;
      }
      if (parsed.testDate) {
        const d = new Date(parsed.testDate + 'T12:00:00');
        if (!isNaN(d.getTime())) { setTestDate(d); filled = true; }
      }
      if (parsed.className) {
        const matchedClass = classes.find((c: any) =>
          c.name.toLowerCase() === String(parsed.className).toLowerCase()
        );
        if (matchedClass) { setClassId(matchedClass.id); filled = true; }
      }

      if (!filled) throw new Error('No test details found.');
      setAutoFillText('');
      setEntryMode('normal');
    } catch (error) {
      console.error('Autofill error:', error);
      throw error;
    } finally {
      setIsAutoFilling(false);
    }
  }, [isAutoFilling, classes]);

  useEffect(() => {
    if (isOpen) {
      if (defaultClassId) {
        setClassId(defaultClassId);
      } else if (!classId && classes.length > 0) {
        setClassId(classes[0].id);
      }
    }
  }, [isOpen, classes, classId, defaultClassId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStudyMaterials([]);
    setTestType('Quiz');
    setTestTime('');
    setTestDate(new Date());
    setClassId(classes[0]?.id || '');
    setEntryMode('normal');
    setAutoFillText('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !classId || !testDate) {
      toastError('Missing fields', 'Please fill out all required fields.');
      return;
    }

    const materialsList = studyMaterials
      .filter((m) => m.url.trim() !== '')
      .map((m) => ({ url: m.url.trim(), title: m.title?.trim() }));

    // Format the date with time if provided
    let testDateTime = new Date(testDate);
    if (testTime) {
      const [hours, minutes] = testTime.split(':').map(Number);
      testDateTime.setHours(hours, minutes);
    }

    // Map UI strings to TestType values
    let mappedTestType: 'ALPHA' | 'BETA' | 'Quiz' | 'Other' | 'exam' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation';
    switch (testType) {
      case 'ALPHA':
        mappedTestType = 'ALPHA';
        break;
      case 'BETA':
        mappedTestType = 'BETA';
        break;
      case 'Quiz':
        mappedTestType = 'quiz';
        break;
      case 'Midterm':
        mappedTestType = 'midterm';
        break;
      case 'Final':
        mappedTestType = 'final';
        break;
      case 'Other':
        mappedTestType = 'project';
        break;
      default:
        mappedTestType = 'exam';
    }

    try {
      await addTest(classId, title, testDateTime, mappedTestType, {
        description: description.trim() || undefined,
        studyMaterials: materialsList.length > 0 ? materialsList : undefined
      });

      success('✅ Test Added!', `Good luck studying for your ${title}.`);
      handleClose();
    } catch (err: any) {
      console.error('Error adding test:', err);
      if (!handlePlanLimitError(err)) {
        toastError('Failed to add test', 'Please try again later.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-start justify-center px-4 pb-4 z-[100] fixed-padding-adjust" style={{ paddingTop: modalTop ?? 16 }}>
        <motion.div
          ref={modalRef}
          style={modalTop === null ? undefined : { maxHeight: `calc(100dvh - ${modalTop + 16}px)` }}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`${focusStyles.scope} bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-950/10 dark:shadow-black/60 w-full max-w-md relative border border-sky-100 dark:border-gray-800 flex flex-col max-h-[90dvh] overflow-hidden origin-top`}
        >
          <Tabs
            value={entryMode}
            onValueChange={(value) => setEntryMode(value as TestEntryMode)}
            className="flex flex-col flex-1 min-h-0 gap-0"
          >
            <div className="flex items-center gap-2 px-6 py-4 border-b border-sky-100/80 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
              <h2 className="flex-1 min-w-0 text-base font-bold text-sky-900 dark:text-white">
                Add New Test
              </h2>
              <TabsList aria-label="Test entry mode" className="flex h-9 shrink-0 gap-0.5 rounded-lg bg-sky-50/90 dark:bg-gray-800/80 p-0.5 text-sky-500 dark:text-sky-400">
                {([
                  { value: 'normal', label: 'Manual entry', icon: 'PencilEdit01' },
                  { value: 'quick-fill', label: 'Quick Fill', icon: 'Zap' },
                ] as const).map(({ value, label, icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    aria-label={label}
                    title={label}
                    className="relative size-8 flex-none rounded-md p-0 text-sky-900 dark:text-sky-100 opacity-40 transition-[opacity,background-color] hover:opacity-70 focus-visible:opacity-100 data-[state=active]:opacity-100 data-[state=active]:!bg-transparent data-[state=active]:shadow-none data-[state=active]:text-sky-900 dark:data-[state=active]:!bg-transparent dark:data-[state=active]:text-sky-100"
                  >
                    {entryMode === value && (
                      <motion.span
                        layoutId="test-active-tab"
                        transition={{ type: 'spring', stiffness: 500, damping: 34, mass: 0.7 }}
                        className="absolute inset-0 rounded-md bg-white dark:bg-gray-900"
                        aria-hidden="true"
                      />
                    )}
                    <HugeIcon name={icon} size={16} className="relative z-10 size-4" aria-hidden="true" />
                  </TabsTrigger>
                ))}
              </TabsList>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close add test modal"
                className="size-8 shrink-0 flex items-center justify-center text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <HugeIcon name="Cancel01" size={16} className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <TabsContent value="quick-fill" className="m-0 px-6 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-3 space-y-1">
                    <h3 className="text-sm font-semibold text-sky-900 dark:text-white">Quick Fill</h3>
                    <p className="text-xs leading-5 text-sky-600/70 dark:text-sky-400/70">
                      Describe your test. We’ll fill in the details.
                    </p>
                  </div>

                  <QuickFillInput
                    value={autoFillText}
                    onChange={setAutoFillText}
                    onFill={handleAutoFill}
                    isFilling={isAutoFilling}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="normal" className="m-0 px-6 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Label htmlFor="testTitle" className={labelClass}>
                        Title<span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input
                        id="testTitle"
                        type="text"
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="Name this boss fight..."
                        className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sm text-sky-900 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 rounded-xl hover:border-sky-200 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all font-normal outline-none"
                      />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-12 gap-2.5">
                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="class" className={labelClass}>
                          Class<span className="text-red-500 ml-0.5">*</span>
                        </Label>
                        <Select value={classId} onValueChange={setClassId}>
                          <SelectTrigger hideIcon={Boolean(classId)} className={triggerClass}>
                            <SelectValue placeholder="Class" className="min-w-0" />
                          </SelectTrigger>
                          <SelectContent className={`${contentClass} min-w-48 max-w-[calc(100vw-2rem)]`} position="popper" sideOffset={4}>
                            {classes.map((cls: any, index: number) => (
                              <SelectItem key={cls.id} value={cls.id} className={itemClass}>
                                <span className="inline-flex max-w-full min-w-0 items-center gap-1.5" title={cls.name}>
                                  <span className="flex shrink-0 items-center" style={{ color: pathname?.startsWith('/newhome') ? getNewHomeClassColor(cls, index) : getDashboardClassIconColor(index, isDark) }} aria-hidden="true">
                                    <HugeIcon name={cls.icon || 'School'} size={16} className="size-4 text-inherit" />
                                  </span>
                                  <span className="truncate">{cls.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="testType" className={labelClass}>
                          Type
                        </Label>
                        <Select value={testType} onValueChange={setTestType}>
                          <SelectTrigger hideIcon={Boolean(testType)} className={triggerClass}>
                            <SelectValue placeholder="Type" className="min-w-0" />
                          </SelectTrigger>
                          <SelectContent className={`${contentClass} min-w-[var(--radix-select-trigger-width)]`} position="popper" sideOffset={4}>
                            {TEST_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className={itemClass}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="testDate" className={labelClass}>
                          Date<span className="text-red-500 ml-0.5">*</span>
                        </Label>
                        <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              hoverScale={1}
                              tapScale={1}
                              className="w-full justify-start px-3 font-normal h-9 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 hover:border-sky-200 dark:hover:border-gray-700 rounded-xl transition-all outline-none"
                            >
                              <HugeIcon name="Calendar02" size={14} className="mr-2 h-3.5 w-3.5 text-sky-500 shrink-0" />
                              <span className="text-left truncate">{testDate ? format(testDate, 'MMM d') : 'Pick'}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={`${focusStyles.scope} w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 overflow-hidden`} align="end" sideOffset={4}>
                            <Calendar
                              mode="single"
                              selected={testDate}
                              onSelect={setTestDate}
                              initialFocus
                              className="text-sky-900 dark:text-white rounded-xl"
                            />
                            <div className="flex gap-2 border-t border-sky-100 dark:border-gray-800 p-3">
                              {[
                                { label: 'Today', days: 0 },
                                { label: 'Tomorrow', days: 1 },
                                { label: 'Next week', days: 7 },
                              ].map(({ label, days }) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => {
                                    setTestDate(addDays(new Date(), days));
                                    setDueDatePopoverOpen(false);
                                  }}
                                  className="h-8 rounded-lg bg-sky-50 dark:bg-gray-800 px-3 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-1.5">
                      <Label htmlFor="testTime" className={labelClass}>
                        Time
                      </Label>
                      <TestTimePicker
                        value={testTime || undefined}
                        onChange={(value) => setTestTime(value)}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className={labelClass}>
                        Description
                      </Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="What's on the exam?"
                        rows={2}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl text-sky-800 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 hover:border-sky-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/30 focus:border-[#d4e88e] text-sm resize-none transition-all"
                      />
                    </div>

                    <HomeworkLinkInput
                      links={studyMaterials}
                      onChange={(links) => setStudyMaterials(links)}
                    />
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100/80 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={entryMode === 'normal' ? handleSubmit : () => setEntryMode('normal')}
              disabled={entryMode === 'normal' && (!title.trim() || !classId || !testDate)}
              className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {entryMode === 'normal' ? 'Add Test' : 'Review details'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};