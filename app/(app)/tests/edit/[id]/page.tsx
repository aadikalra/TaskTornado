'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useTestContext, TestType, TestStatus, StudyMaterial } from '@/context/TestContext';
import { useToast } from '@/context/ToastContext';
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
import { format } from 'date-fns';
import { parseCalendarDate } from '@/lib/dateUtils';
import { Calendar as CalendarIcon, X, Save, ArrowLeft, Loader2, GraduationCap, Plus, Link as LinkIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TestTimePicker } from '@/components/TestTimePicker';
import { iconMap } from '@/lib/icon-map';
import { motion } from 'framer-motion';
import Link from 'next/link';



export default function EditTestPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { classes } = useClassContext();
  const { tests, updateTest } = useTestContext();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testTime, setTestTime] = useState('');
  const [testType, setTestType] = useState('Quiz');
  const [description, setDescription] = useState('');
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [status, setStatus] = useState<TestStatus>('not_started');
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(100);
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [createdAt, setCreatedAt] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  // Auto-calculate grade when score or maxScore changes
  useEffect(() => {
    if (score !== null && maxScore !== null && maxScore > 0) {
      const percentage = (score / maxScore) * 100;
      let calculatedGrade = '';

      if (percentage >= 90) calculatedGrade = 'A';
      else if (percentage >= 80) calculatedGrade = 'B';
      else if (percentage >= 70) calculatedGrade = 'C';
      else if (percentage >= 60) calculatedGrade = 'D';
      else calculatedGrade = 'F';

      setGrade(calculatedGrade);
    } else {
      setGrade('');
    }
  }, [score, maxScore]);

  useEffect(() => {
    const test = tests.find(t => t.id === id);
    if (test) {
      setTitle(test.title);
      setClassId(test.classId);
      setTestDate(parseCalendarDate(test.testDate));
      setTestTime(test.testTime || '');
      setTestType(test.testType || 'Quiz');
      setDescription(test.description || '');
      setStudyMaterials(test.studyMaterials || []);
      setStatus((test.status as TestStatus) || 'not_started');
      setScore(test.score ?? null);
      setMaxScore(test.maxScore ?? 100);
      setGrade(test.grade || '');
      setNotes(test.notes || '');
      setCompletedAt(test.completed_at ? new Date(test.completed_at) : null);
      setCreatedAt(test.created_at ? new Date(test.created_at) : new Date());
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, tests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateTest(id, {
        title,
        classId,
        testDate: format(testDate!, 'yyyy-MM-dd'),
        testTime: testTime || null,
        testType: testType as TestType,
        description: description || null,
        studyMaterials: studyMaterials.map(m => typeof m === 'string' ? m : m.url),
        status: status as TestStatus,
        score: score,
        maxScore: maxScore,
        grade: grade || null,
        notes: notes || null,
        completed_at: status === 'completed' 
          ? (completedAt ? completedAt.toISOString() : new Date().toISOString()) 
          : null
      });

      success('Test updated successfully');
      router.push(`/tests/${id}`);
    } catch (err) {
      console.error('Error updating test:', err);
      toastError('Failed to update test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStudyMaterial = () => {
    setStudyMaterials([...studyMaterials, { url: '', title: '' }]);
  };

  const updateStudyMaterial = (index: number, field: 'url' | 'title', value: string) => {
    const updatedMaterials = [...studyMaterials];
    if (typeof updatedMaterials[index] === 'string') {
      updatedMaterials[index] = { url: value as string };
    } else {
      updatedMaterials[index] = { ...updatedMaterials[index] as any, [field]: value };
    }
    setStudyMaterials(updatedMaterials);
  };

  const removeStudyMaterial = (index: number) => {
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));
  };

  // Get class info
  const selectedClass = classes.find(c => c.id === classId);
  const classColors = ['#DC2626', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0D9488', '#475569'];
  const classIndex = classes.findIndex(c => c.id === classId);
  const accentColor = classIndex >= 0 ? classColors[classIndex % classColors.length] : '#0ea5e9';
  const ClassIcon = selectedClass ? (iconMap[selectedClass.icon as keyof typeof iconMap] ?? GraduationCap) : GraduationCap;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!title && !loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-gray-900 rounded-2xl mb-5 border border-sky-100 dark:border-gray-800">
          <GraduationCap className="h-7 w-7 text-sky-400 dark:text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">Test not found</h1>
        <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-6">This test may have been deleted or doesn&apos;t exist.</p>
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Back link */}
        <Link
          href={`/tests/${id}`}
          className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Test
        </Link>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <ClassIcon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                Edit Test
              </h1>
              {selectedClass && (
                <p className="text-sm text-sky-600/40 dark:text-sky-400/35 font-medium">{selectedClass.name}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden">
            {/* Form content */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Test Title <span className="text-red-400 normal-case">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter test title"
                  required
                  className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Test Date, Time, Type — responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Test Date */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Test Date <span className="text-red-400 normal-case">*</span>
                  </Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-11 flex items-center gap-2 px-3 text-sm font-normal bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:border-sky-500 rounded-xl transition-colors text-left"
                      >
                        <CalendarIcon className="h-4 w-4 text-sky-500 shrink-0" />
                        {testDate ? format(testDate, 'PPP') : <span className="text-sky-400">Pick a date</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5" align="start">
                      <Calendar
                        mode="single"
                        selected={testDate}
                        onSelect={(date) => {
                          setTestDate(date || new Date());
                          setOpenCalendar(false);
                        }}
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

                {/* Test Time */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Test Time <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                  </Label>
                  <TestTimePicker
                    value={testTime || undefined}
                    onChange={(value) => setTestTime(value)}
                    placeholder="Select time"
                  />
                </div>

                {/* Test Type */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Test Type <span className="text-red-400 normal-case">*</span>
                  </Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                      <SelectValue placeholder="Select test type" />
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

              {/* Class + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Class <span className="text-red-400 normal-case">*</span>
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

                {/* Status */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Status
                  </Label>
                  <Select value={status} onValueChange={(v: TestStatus) => setStatus(v)}>
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                      <SelectItem value="not_started" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Not Started</SelectItem>
                      <SelectItem value="in_progress" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">In Progress</SelectItem>
                      <SelectItem value="completed" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Completed</SelectItem>
                      <SelectItem value="postponed" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Postponed</SelectItem>
                      <SelectItem value="cancelled" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Score / Max Score / Grade — only shown when completed */}
              {status === 'completed' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-sky-50/50 dark:bg-sky-500/5 rounded-2xl border border-sky-100/60 dark:border-sky-800/30">
                  <div>
                    <Label htmlFor="score" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                      Score
                    </Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      step="0.01"
                      value={score ?? ''}
                      onChange={(e) => setScore(e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                      Max Score
                    </Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="0"
                      step="0.01"
                      value={maxScore ?? ''}
                      onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : null)}
                      placeholder="100"
                      className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                      Grade <span className="text-sky-400 font-normal normal-case tracking-normal">(Auto)</span>
                    </Label>
                    <Input
                      id="grade"
                      value={grade}
                      readOnly
                      className="w-full h-11 bg-sky-50/80 dark:bg-gray-800 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white rounded-xl cursor-default font-bold text-center text-lg"
                    />
                  </div>
                </div>
              )}

              {/* Max Score — when NOT completed, still allow editing */}
              {status !== 'completed' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxScore" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                      Max Score <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="0"
                      step="0.01"
                      value={maxScore ?? ''}
                      onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : null)}
                      placeholder="100"
                      className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <Label htmlFor="description" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Description <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about the test..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Notes <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Study reminders, tips, or any extra notes..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                />
              </div>

              {/* Study Materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Study Materials <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                  </Label>
                  <button
                    type="button"
                    onClick={addStudyMaterial}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/60 dark:border-sky-800/40 rounded-full transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                {studyMaterials.length === 0 && (
                  <div className="flex items-center justify-center py-6 px-4 bg-sky-50/40 dark:bg-gray-800/30 rounded-xl border border-dashed border-sky-200/60 dark:border-gray-700/50">
                    <p className="text-sm text-sky-500/50 dark:text-sky-400/30">No study materials added yet</p>
                  </div>
                )}

                <div className="space-y-2.5">
                  {studyMaterials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="shrink-0 w-8 h-8 bg-sky-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <LinkIcon className="h-3.5 w-3.5 text-sky-500/50" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Title (optional)"
                          value={typeof material === 'object' ? material.title || '' : ''}
                          onChange={(e) => updateStudyMaterial(index, 'title', e.target.value)}
                          className="h-9 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                        <Input
                          placeholder="URL"
                          value={typeof material === 'object' ? material.url : material}
                          onChange={(e) => updateStudyMaterial(index, 'url', e.target.value)}
                          type="url"
                          className="h-9 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStudyMaterial(index)}
                        className="shrink-0 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 sm:px-8 py-4 border-t border-sky-100/60 dark:border-gray-800">
              <Link href={`/tests/${id}`}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
