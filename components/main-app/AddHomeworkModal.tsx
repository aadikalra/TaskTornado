'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { HugeIcon } from '@/lib/huge-icon-map';

import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext, RecurringHomework } from '@/context/HomeworkContext';
import { useToast } from '@/context/ToastContext';
import { useMainApp } from '@/context/MainAppContext';
import { HomeworkLinkInput } from '@/components/HomeworkLinkInput';
import { RecurringOptions } from '@/components/RecurringOptions';

type Priority = 'low' | 'medium' | 'high';
type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

export const AddHomeworkModal = () => {
  const { showAddHomework, setShowAddHomework } = useMainApp();
  const { classes } = useClassContext();
  const { addHomework, addRecurringHomework } = useHomeworkContext();
  const { success } = useToast();

  const [newHomework, setNewHomework] = useState({
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

  // Initialize classId when classes load
  useEffect(() => {
    if (classes.length > 0 && !newHomework.classId) {
      setNewHomework(prev => ({ ...prev, classId: classes[0].id }));
    }
  }, [classes, newHomework.classId]);

  const handleAutoFill = useCallback(async () => {
    if (!autoFillText.trim() || isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const classNames = classes.map((c: any) => c.name).join(', ');
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

The student typed: "${autoFillText}"

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

      const reader = response.body?.getReader();
      let text = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.response) text += data.response;
              } catch (e) { }
            }
          }
        }
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updates: any = {};

        if (parsed.title) updates.title = parsed.title;
        if (parsed.description) updates.description = parsed.description;
        if (parsed.priority && ['low', 'medium', 'high'].includes(parsed.priority)) {
          updates.priority = parsed.priority;
        }
        if (parsed.dueDate) {
          const d = new Date(parsed.dueDate + 'T12:00:00');
          if (!isNaN(d.getTime())) updates.dueDate = d;
        }
        if (parsed.className) {
          const matchedClass = classes.find((c: any) =>
            c.name.toLowerCase() === parsed.className.toLowerCase()
          );
          if (matchedClass) updates.classId = matchedClass.id;
        }
        if (parsed.links && Array.isArray(parsed.links)) {
          updates.links = parsed.links.filter((l: any) => l.title && l.url);
        }

        if (Object.keys(updates).length > 0) {
          setNewHomework(prev => ({ ...prev, ...updates }));
          setAutoFillText('');
        }
      }
    } catch (error) {
      console.error('Autofill error:', error);
    } finally {
      setIsAutoFilling(false);
    }
  }, [autoFillText, isAutoFilling, classes]);

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
      setShowAddHomework(false);
    } catch (error) {
      console.error('Error adding homework:', error);
    }
  };

  if (!showAddHomework) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
            <h2 className="text-lg font-bold text-sky-900 dark:text-white">
              Add New Homework
            </h2>
            <button
              onClick={() => {
                setShowAddHomework(false);
                setIsRecurringEnabled(false);
                setRecurringConfig({ frequency: 'weekly' });
              }}
              className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
            >
              <HugeIcon name="Cancel01" size={16} className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* AI Autofill */}
            <div className="relative">
              <div className="flex items-center gap-1.5 ml-1 mb-1.5">
                <HugeIcon name="AiMagic" size={12} className="h-3 w-3 text-sky-500/60 dark:text-sky-400/60" />
                <Label className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest">
                  Quick Fill
                </Label>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={autoFillText}
                  onChange={(e) => setAutoFillText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && autoFillText.trim()) {
                      e.preventDefault();
                      handleAutoFill();
                    }
                  }}
                  placeholder='e.g., "Math ch5 exercises due friday high priority"'
                  className="w-full h-9 pl-3 pr-12 text-sm bg-sky-50/50 dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400/50 dark:placeholder-sky-500/50 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] focus:bg-white dark:focus:bg-gray-900 transition-colors"
                />
                <button
                  onClick={handleAutoFill}
                  disabled={!autoFillText.trim() || isAutoFilling}
                  className="absolute right-1 h-7 w-7 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Fill fields with AI"
                >
                  {isAutoFilling ? (
                    <HugeIcon name="LoaderPinwheel" size={14} className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <HugeIcon name="ArrowUp02" size={14} className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="border-t border-sky-100/60 dark:border-gray-800" />

            <div className="space-y-4">
              {/* Title Input - Large & Prominent */}
              <div className="space-y-1.5">
                <Label htmlFor="homeworkTitle" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                  <span className="tracking-widest">Title</span><span className="text-red-500">*</span>
                </Label>
                <Input
                  id="homeworkTitle"
                  type="text"
                  value={newHomework.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHomework({ ...newHomework, title: e.target.value })}
                  placeholder="Homework title..."
                  className="w-full h-9 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sm text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all font-normal outline-none"
                />
              </div>

              {/* Metadata Grid - Compact & Efficient */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 space-y-1.5">
                  <Label htmlFor="class" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                    <span className="tracking-widest">Class</span><span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newHomework.classId}
                    onValueChange={(value) => setNewHomework({ ...newHomework, classId: value })}
                  >
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-[#ebf6b5]/10 hover:border-[#d4e88e] focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl" position="popper" sideOffset={4}>
                      {classes.map((cls: any) => (
                        <SelectItem
                          key={cls.id}
                          value={cls.id}
                          className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg"
                        >
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 space-y-1.5">
                  <Label htmlFor="priority" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1">
                    Priority
                  </Label>
                  <Select
                    value={newHomework.priority}
                    onValueChange={(value) => setNewHomework({ ...newHomework, priority: value as Priority })}
                  >
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 text-sm rounded-xl hover:bg-[#ebf6b5]/10 hover:border-[#d4e88e] focus-visible:ring-2 focus-visible:ring-[#ebf6b5]/40 focus-visible:border-[#d4e88e] transition-all outline-none">
                      <SelectValue placeholder="Prio" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl" position="popper" sideOffset={4}>
                      <SelectItem value="low" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">Low</SelectItem>
                      <SelectItem value="medium" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">Medium</SelectItem>
                      <SelectItem value="high" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 space-y-1.5">
                  <Label htmlFor="dueDate" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase ml-1">
                    <span className="tracking-widest">Due Date</span><span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        hoverScale={1}
                        tapScale={1}
                        className="w-full justify-start px-3 font-normal h-9 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-900 dark:text-sky-100 hover:bg-[#ebf6b5]/10 dark:hover:bg-[#ebf6b5]/5 hover:border-[#d4e88e] rounded-xl transition-all"
                      >
                        <HugeIcon name="Calendar02" size={14} className="mr-2 h-3.5 w-3.5 text-sky-500" />
                        <span className="text-left truncate">{format(newHomework.dueDate, 'MMM d')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5">
                      <Calendar
                        mode="single"
                        selected={newHomework.dueDate}
                        onSelect={(date) => date && setNewHomework({ ...newHomework, dueDate: date })}
                        initialFocus
                        className="text-sky-900 dark:text-white rounded-2xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <HomeworkLinkInput
                links={newHomework.links}
                onChange={(links) => setNewHomework({ ...newHomework, links })}
              />

              {/* Description Input */}
              <div className="space-y-1.5">
                <Label htmlFor="homeworkDescription" className="text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1">
                  Description
                </Label>
                <textarea
                  id="homeworkDescription"
                  value={newHomework.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewHomework({ ...newHomework, description: e.target.value })}
                  placeholder="Add some details..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/30 focus:border-[#d4e88e] text-sm resize-none transition-all"
                />
              </div>
            </div>

            {/* Recurring and Links - More Compact Footer Section */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-2.5 p-1">
                <Checkbox
                  id="recurringHomework"
                  checked={isRecurringEnabled}
                  onCheckedChange={(checked) => setIsRecurringEnabled(checked as boolean)}
                  className="size-5 rounded-md border-2 border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-600 data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-lime-400/40 outline-none"
                />
                <Label
                  htmlFor="recurringHomework"
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest cursor-pointer select-none"
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

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
            <button
              type="button"
              onClick={() => {
                setShowAddHomework(false);
                setIsRecurringEnabled(false);
                setRecurringConfig({ frequency: 'weekly' });
              }}
              className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddHomework}
              disabled={!newHomework.title.trim() || !newHomework.classId}
              className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Homework
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
