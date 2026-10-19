'use client';

import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import focusStyles from '@/components/HomeworkFormFocus.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HugeIcon } from '@/lib/huge-icon-map';
import { getPriorityIndicator } from '@/components/HomeworkPriorityIndicator';

import { useClassContext } from '@/context/ClassContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { usePathname } from 'next/navigation';
import { getDashboardClassIconColor, getNewHomeClassColor } from '@/lib/class-display-colors';
import { useHomeworkContext, RecurringHomework } from '@/context/HomeworkContext';
import { useToast } from '@/context/ToastContext';
import { useMainApp } from '@/context/MainAppContext';
import { HomeworkLinkInput } from '@/components/HomeworkLinkInput';
import { QuickFillInput } from '@/components/main-app/QuickFillInput';
import { RecurringOptions } from '@/components/RecurringOptions';
import {
  GoogleClassroomImport,
  type ClassroomImportApplicationResult,
} from '@/components/main-app/GoogleClassroomImport';
import {
  matchGoogleClassroomCourse,
  type ParsedGoogleClassroomAssignment,
} from '@/lib/google-classroom-import';

type Priority = 'low' | 'medium' | 'high';
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;
type HomeworkEntryMode = 'normal' | 'quick-fill' | 'classroom';
type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

type HomeworkDraft = {
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  classId: string;
  links: HomeworkLink[];
};

type AutoFillResponse = {
  title?: unknown;
  description?: unknown;
  dueDate?: unknown;
  priority?: unknown;
  className?: unknown;
  links?: unknown;
};

export const AddHomeworkModal = () => {
  const { showAddHomework, setShowAddHomework, classIdForAddHomework, setClassIdForAddHomework } = useMainApp();
  const { classes } = useClassContext();
  const { isDark } = useDarkMode();
  const pathname = usePathname();
  const { addHomework, addRecurringHomework } = useHomeworkContext();
  const { success } = useToast();

  const [newHomework, setNewHomework] = useState<HomeworkDraft>({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium' as Priority,
    classId: '',
    links: [] as HomeworkLink[],
  });
  
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState<RecurringHomework>({
    frequency: 'weekly'
  });

  const [autoFillText, setAutoFillText] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [entryMode, setEntryMode] = useState<HomeworkEntryMode>('normal');
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalTop, setModalTop] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!showAddHomework) {
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
  }, [showAddHomework]);

  // Initialize classId when modal opens or classes load
  useEffect(() => {
    if (showAddHomework) {
      if (classIdForAddHomework) {
        setNewHomework(prev => ({ ...prev, classId: classIdForAddHomework }));
      } else if (classes.length > 0 && !newHomework.classId) {
        setNewHomework(prev => ({ ...prev, classId: classes[0].id }));
      }
    }
  }, [showAddHomework, classIdForAddHomework, classes, newHomework.classId]);

  const handleAutoFill = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const classNames = classes.map(c => c.name).join(', ');
      const today = format(new Date(), 'yyyy-MM-dd');
      const dayOfWeek = format(new Date(), 'EEEE');
      // Build compact 14-day reference so the AI doesn't do calendar math
      const dateRef = (() => {
        const now = new Date();
        const lines: string[] = [];
        for (let i = 0; i <= 13; i++) {
          const d = addDays(now, i);
          const label = i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : '';
          lines.push(`${format(d, 'EEE MMM d')} = ${format(d, 'yyyy-MM-dd')}${label ? ` (${label})` : ''}`);
        }
        return lines.join(', ');
      })();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are helping a student fill out a homework form. Today is ${dayOfWeek}, ${today}.

Date reference (use these exact dates): ${dateRef}

Available classes: ${classNames}
Priority options: low, medium, high

The student wrote or dictated: "${inputText}"

Return ONLY a JSON object with whichever fields you can determine:
- "title": string (the homework title/name)
- "description": string (any extra details)
- "dueDate": string (use the date reference above to pick the correct yyyy-MM-dd date)
- "priority": "low" | "medium" | "high"
- "className": string (must exactly match one of the available classes)
- "links": array of objects [{"title": "Platform Name (e.g., Google Docs, Canvas)", "url": "https://example.com"}] (if the user provides links, smartly infer the title based on the website domain or known service, rather than something generic)

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
          const data = JSON.parse(line.slice(6)) as { response?: unknown };
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

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Quick Fill returned no homework details.');
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AutoFillResponse;
        const updates: Partial<HomeworkDraft> = {};

        if (typeof parsed.title === 'string' && parsed.title) updates.title = parsed.title;
        if (typeof parsed.description === 'string' && parsed.description) updates.description = parsed.description;
        if (parsed.priority === 'low' || parsed.priority === 'medium' || parsed.priority === 'high') {
          updates.priority = parsed.priority;
        }
        if (typeof parsed.dueDate === 'string') {
          const d = new Date(parsed.dueDate + 'T12:00:00');
          if (!isNaN(d.getTime())) updates.dueDate = d;
        }
        if (typeof parsed.className === 'string') {
          const parsedClassName = parsed.className;
          const matchedClass = classes.find(c =>
            c.name.toLowerCase() === parsedClassName.toLowerCase()
          );
          if (matchedClass) updates.classId = matchedClass.id;
        }
        if (Array.isArray(parsed.links)) {
          updates.links = parsed.links.flatMap((link, index): HomeworkLink[] => {
            if (!link || typeof link !== 'object') return [];
            const { title, url } = link as Record<string, unknown>;
            if (typeof title !== 'string' || typeof url !== 'string' || !title || !url) return [];
            return [{ id: `autofill-${Date.now()}-${index}`, title, url }];
          });
        }

        if (Object.keys(updates).length > 0) {
          setNewHomework(prev => ({ ...prev, ...updates }));
          setAutoFillText('');
          setEntryMode('normal');
        } else {
          throw new Error('No homework details found.');
        }
      }
    } catch (error) {
      console.error('Autofill error:', error);
      throw error;
    } finally {
      setIsAutoFilling(false);
    }
  }, [isAutoFilling, classes]);

  const handleClassroomImport = useCallback((assignment: ParsedGoogleClassroomAssignment): ClassroomImportApplicationResult => {
    const matchedClass = matchGoogleClassroomCourse(assignment, classes);
    const importedLinks: HomeworkLink[] = [];
    const seenUrls = new Set<string>();

    const addImportedLink = (url: string | undefined, title: string) => {
      if (!url || seenUrls.has(url)) return;
      seenUrls.add(url);
      importedLinks.push({
        id: `classroom-${Date.now()}-${importedLinks.length}`,
        url,
        title,
      });
    };

    addImportedLink(assignment.sourceUrl, 'Google Classroom assignment');
    assignment.attachments.forEach(attachment => addImportedLink(attachment.url, attachment.name));

    const populatedFields: string[] = [];
    if (assignment.title) populatedFields.push('title');
    if (assignment.dueDate) populatedFields.push('due date');
    if (assignment.description) populatedFields.push('description');
    if (importedLinks.length > 0) populatedFields.push(importedLinks.length === 1 ? 'link' : 'links');
    if (matchedClass) populatedFields.push('class');

    setNewHomework(previous => {
      const existingUrls = new Set(previous.links.map(link => link.url));
      const newLinks = importedLinks.filter(link => !existingUrls.has(link.url));
      return {
        ...previous,
        ...(assignment.title ? { title: assignment.title } : {}),
        ...(assignment.description ? { description: assignment.description } : {}),
        ...(assignment.dueDate ? { dueDate: assignment.dueDate } : {}),
        ...(matchedClass ? { classId: matchedClass.id } : {}),
        links: [...previous.links, ...newLinks],
      };
    });
    setIsRecurringEnabled(false);
    setEntryMode('normal');

    return {
      populatedFields,
      matchedClassName: matchedClass?.name,
    };
  }, [classes]);

  const handleAddHomework = async () => {
    if (!newHomework.title.trim() || !newHomework.classId) return;

    try {
      if (isRecurringEnabled) {
        await addRecurringHomework(
          newHomework.classId,
          newHomework.title,
          newHomework.dueDate,
          newHomework.priority as Priority,
          newHomework.links,
          recurringConfig,
          newHomework.description
        );

        success(
          `✅ ${newHomework.title} recurring homework added!`,
          `First instance created. Future instances will be generated automatically.`
        );
      } else {
        await addHomework(
          newHomework.classId,
          newHomework.title,
          newHomework.dueDate,
          newHomework.priority as Priority,
          newHomework.links,
          newHomework.description
        );

        success(
          `✅ ${newHomework.title} added!`,
          `Due on ${format(newHomework.dueDate, 'MMM do')}`
        );
      }

      setNewHomework({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium' as Priority,
        classId: classes[0]?.id || '',
        links: [],
      });
      setIsRecurringEnabled(false);
      setRecurringConfig({ frequency: 'weekly' });
      setEntryMode('normal');
      setShowAddHomework(false);
    } catch (error) {
      console.error('Error adding homework:', error);
    }
  };

  if (!showAddHomework) return null;

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
            onValueChange={(value) => setEntryMode(value as HomeworkEntryMode)}
            className="flex flex-col flex-1 min-h-0 gap-0"
          >
            <div className="flex items-center gap-2 px-6 py-4 border-b border-sky-100/80 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
              <h2 className="flex-1 min-w-0 text-base font-bold text-sky-900 dark:text-white">
                Add New Homework
              </h2>
              <TabsList aria-label="Homework entry mode" className="flex h-9 shrink-0 gap-0.5 rounded-lg bg-sky-50/90 dark:bg-gray-800/80 p-0.5 text-sky-500 dark:text-sky-400">
                {([
                  { value: 'normal', label: 'Manual entry', icon: 'PencilEdit01' },
                  { value: 'quick-fill', label: 'Quick Fill', icon: 'Zap' },
                  { value: 'classroom', label: 'Google Classroom', icon: 'School01' },
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
                        layoutId="homework-active-tab"
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
                onClick={() => {
                  setShowAddHomework(false);
                  setIsRecurringEnabled(false);
                  setRecurringConfig({ frequency: 'weekly' });
                  setEntryMode('normal');
                }}
                aria-label="Close add homework modal"
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
                      Describe your homework. We’ll fill in the details.
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

              <TabsContent value="classroom" className="m-0 px-6 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GoogleClassroomImport onImport={handleClassroomImport} />
                </motion.div>
              </TabsContent>

              <TabsContent value="normal" className="m-0 px-6 py-4">
                <motion.div
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="space-y-4">
                    {/* Title Input - Large & Prominent */}
                    <div className="space-y-1.5">
                      <Label htmlFor="homeworkTitle" className="text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
                        Title<span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input
                        id="homeworkTitle"
                        type="text"
                        value={newHomework.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHomework({ ...newHomework, title: e.target.value })}
                        placeholder="Name this side quest..."
                        className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sm text-sky-900 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 rounded-xl hover:border-sky-200 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all font-normal outline-none"
                      />
                    </div>

                    {/* Metadata Grid - Compact & Efficient */}
                    <div className="grid grid-cols-12 gap-2.5">
                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="class" className="text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
                          Class<span className="text-red-500 ml-0.5">*</span>
                        </Label>
                        <Select
                          value={newHomework.classId}
                          onValueChange={(value) => setNewHomework({ ...newHomework, classId: value })}
                        >
                          <SelectTrigger hideIcon={Boolean(newHomework.classId)} className="[&_svg:not([class*='text-'])]:!text-sky-500 w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-sky-50/50 dark:hover:bg-sky-500/5 hover:border-sky-200 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                            <SelectValue placeholder="Class" className="min-w-0" />
                          </SelectTrigger>
                          <SelectContent className={`${focusStyles.scope} [&_svg:not([class*='text-'])]:!text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 p-1 min-w-48 max-w-[calc(100vw-2rem)]`} position="popper" sideOffset={4}>
                            {classes.map((cls, index) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id}
                                className="text-sky-900 dark:text-sky-100 focus:bg-sky-50 dark:focus:bg-sky-500/15 focus:text-sky-950 dark:focus:text-white text-sm rounded-lg py-2 px-2.5 cursor-pointer transition-colors outline-none"
                              >
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
                        <Label htmlFor="priority" className="text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
                          Priority
                        </Label>
                        <Select
                          value={newHomework.priority}
                          onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as Priority })}
                        >
                          <SelectTrigger hideIcon={Boolean(newHomework.priority)} className="[&_svg:not([class*='text-'])]:!text-sky-500 w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-sky-50/50 dark:hover:bg-sky-500/5 hover:border-sky-200 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                            <SelectValue placeholder="Priority" className="min-w-0" />
                          </SelectTrigger>
                          <SelectContent className={`${focusStyles.scope} [&_svg:not([class*='text-'])]:!text-sky-500 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 p-1 min-w-[var(--radix-select-trigger-width)]`} position="popper" sideOffset={4}>
                            {priorityOptions.map(({ value, label }) => (
                              <SelectItem key={value} value={value} className="text-sky-900 dark:text-sky-100 focus:bg-sky-50 dark:focus:bg-sky-500/15 focus:text-sky-950 dark:focus:text-white text-sm rounded-lg py-2 px-2.5 cursor-pointer transition-colors outline-none">
                                <span className="inline-flex max-w-full min-w-0 items-center gap-1.5" title={label}>
                                  <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">{getPriorityIndicator(value, false)}</span>
                                  <span className="truncate">{label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4 space-y-1.5">
                        <Label htmlFor="dueDate" className="text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
                          Due date<span className="text-red-500 ml-0.5">*</span>
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
                              <span className="text-left truncate">{format(newHomework.dueDate, 'MMM d')}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={`${focusStyles.scope} w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 overflow-hidden`} align="end" sideOffset={4}>
                            <Calendar
                              mode="single"
                              selected={newHomework.dueDate}
                              onSelect={(date) => date && setNewHomework({ ...newHomework, dueDate: date })}
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
                                    setNewHomework(previous => ({ ...previous, dueDate: addDays(new Date(), days) }));
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

                    {/* Description Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="homeworkDescription" className="text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
                        Description
                      </Label>
                      <textarea
                        id="homeworkDescription"
                        value={newHomework.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewHomework({ ...newHomework, description: e.target.value })}
                        placeholder="Drop the lore"
                        rows={2}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl text-sky-800 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 hover:border-sky-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/30 focus:border-[#d4e88e] text-sm resize-none transition-all"
                      />
                    </div>

                    <HomeworkLinkInput
                      links={newHomework.links}
                      onChange={(links) => setNewHomework({ ...newHomework, links })}
                    />

                    {/* Recurring Section */}
                    <div className="pt-1 space-y-3">
                      <div className="flex items-center gap-2.5 p-1">
                        <Checkbox
                          id="recurringHomework"
                          checked={isRecurringEnabled}
                          onCheckedChange={(checked) => setIsRecurringEnabled(checked as boolean)}
                          className="size-5 rounded-md border-2 border-sky-200 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-600 data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-lime-400/40 outline-none"
                        />
                        <Label
                          htmlFor="recurringHomework"
                          className="text-xs font-medium text-sky-700 dark:text-sky-300 cursor-pointer select-none"
                        >
                          Make this recurring
                        </Label>
                      </div>

                      {isRecurringEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RecurringOptions
                            recurring={recurringConfig}
                            onChange={setRecurringConfig}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100/80 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={() => {
                setShowAddHomework(false);
                setIsRecurringEnabled(false);
                setRecurringConfig({ frequency: 'weekly' });
                setEntryMode('normal');
              }}
              className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={entryMode === 'normal' ? handleAddHomework : () => setEntryMode('normal')}
              disabled={entryMode === 'normal' && (!newHomework.title.trim() || !newHomework.classId)}
              className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {entryMode === 'normal' ? 'Add Homework' : 'Review details'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
