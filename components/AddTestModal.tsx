import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
import { useClassContext } from '../context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useUpgrade } from '@/context/UpgradeContext';
import { HugeIcon } from '@/lib/huge-icon-map';
import { format, addDays } from 'date-fns';

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

export const AddTestModal = ({ isOpen, onClose, defaultClassId }: AddTestModalProps) => {
  const { classes, addTest } = useClassContext();
  const { success, error: toastError } = useToast();
  const { handlePlanLimitError } = useUpgrade();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testType, setTestType] = useState('Quiz');
  const [testTime, setTestTime] = useState('');
  const [description, setDescription] = useState('');
  const [studyMaterials, setStudyMaterials] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // AI Autofill state
  const [autoFillText, setAutoFillText] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleAutoFill = useCallback(async () => {
    if (!autoFillText.trim() || isAutoFilling) return;
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

The student typed: "${autoFillText}"

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

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) {
          setDescription(parsed.description);
          setShowAdvanced(true);
        }
        if (parsed.testTime) {
          setTestTime(parsed.testTime);
          setShowAdvanced(true);
        }
        if (parsed.testType && ['ALPHA', 'BETA', 'Quiz', 'Midterm', 'Final', 'Other'].includes(parsed.testType)) {
          setTestType(parsed.testType);
        }
        if (parsed.testDate) {
          const d = new Date(parsed.testDate + 'T12:00:00');
          if (!isNaN(d.getTime())) setTestDate(d);
        }
        if (parsed.className) {
          const matchedClass = classes.find((c: any) =>
            c.name.toLowerCase() === parsed.className.toLowerCase()
          );
          if (matchedClass) setClassId(matchedClass.id);
        }

        setAutoFillText('');
      }
    } catch (error) {
      console.error('Autofill error:', error);
    } finally {
      setIsAutoFilling(false);
    }
  }, [autoFillText, isAutoFilling, classes]);

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
    setStudyMaterials('');
    setTestType('Quiz');
    setTestTime('');
    setTestDate(new Date());
    setClassId(classes[0]?.id || '');
    setShowAdvanced(false);
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
      .split('\n')
      .filter((s) => s.trim() !== '');

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

  return (
    <AnimatePresence>
      {isOpen && (
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
                Add New Test
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
              >
                <HugeIcon name="Cancel01" size={20} className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* AI Autofill */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <HugeIcon name="AiMagic" size={14} className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Quick Fill</span>
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
                    placeholder='e.g., "Biology midterm next friday at 10am"'
                    className="w-full h-11 pl-3 pr-12 text-sm bg-sky-50/50 dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400/50 dark:placeholder-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                  />
                  <button
                    onClick={handleAutoFill}
                    disabled={!autoFillText.trim() || isAutoFilling}
                    className="absolute right-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
              {/* Class Selection */}
              <div>
                <Label htmlFor="testClass" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Class
                </Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.id}
                        value={cls.id}
                        className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg"
                      >
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title Input */}
              <div>
                <Label htmlFor="testTitle" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Test Title
                </Label>
                <Input
                  id="testTitle"
                  type="text"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="e.g., Biology Midterm"
                  className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Date and Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="testDate" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Test Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 hover:border-sky-500 rounded-xl"
                      >
                        <HugeIcon name="Calendar02" size={16} className="mr-2 h-4 w-4 text-sky-500" />
                        {testDate ? format(testDate, 'PPP') : <span className="text-sky-400">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5">
                      <Calendar
                        mode="single"
                        selected={testDate}
                        onSelect={setTestDate}
                        initialFocus
                        className="text-sky-900 dark:text-white rounded-2xl"
                        classNames={{
                          today: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-md data-[selected=true]:rounded-none",
                          weekday: "text-sky-500 dark:text-sky-400 rounded-md flex-1 font-medium text-[0.8rem] select-none",
                          caption_label: "text-sky-900 dark:text-white font-semibold text-sm select-none",
                          button_previous: "text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg",
                          button_next: "text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="testType" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Test Type
                  </Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                      <SelectItem value="ALPHA" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">ALPHA</SelectItem>
                      <SelectItem value="BETA" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">BETA</SelectItem>
                      <SelectItem value="Quiz" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Quiz</SelectItem>
                      <SelectItem value="Midterm" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Midterm</SelectItem>
                      <SelectItem value="Final" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Final</SelectItem>
                      <SelectItem value="Other" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                  <HugeIcon name="ArrowDown01" size={16} className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Test Time */}
                    <div>
                      <Label htmlFor="testTime" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                        Test Time <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <HugeIcon name="Timer01" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 dark:text-sky-500" />
                        <Input
                          id="testTime"
                          type="time"
                          value={testTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestTime(e.target.value)}
                          className="w-full h-11 pl-10 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                        Description <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                      </Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="Enter a brief description..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                      />
                    </div>

                    {/* Study Materials */}
                    <div>
                      <Label htmlFor="studyMaterials" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                        Study Materials / Topics <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                      </Label>
                      <textarea
                        id="studyMaterials"
                        value={studyMaterials}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStudyMaterials(e.target.value)}
                        placeholder="Enter topics or paste links, one per line..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                      />
                      <p className="mt-1.5 text-xs text-sky-500 dark:text-sky-400">
                        Add links or topics, one per line. Links will be clickable in the test view.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
              <button
                onClick={handleClose}
                className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !classId || !testDate}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add Test
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};