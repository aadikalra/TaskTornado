'use client';

import { useParams, useRouter } from 'next/navigation';
import { useClassContext } from '@/context/ClassContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconMap } from '@/lib/icon-map';
import { motion } from 'framer-motion';

export default function EditHomeworkPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { homeworks, classes, updateHomework } = useClassContext();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    classId: '',
    completed: false,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date>();
  const [openCalendar, setOpenCalendar] = useState(false);

  useEffect(() => {
    const homework = homeworks.find(h => h.id === id);
    if (homework) {
      const dueDate = new Date(homework.dueDate);
      setFormData({
        title: homework.title,
        description: homework.description || '',
        dueDate: homework.dueDate,
        classId: homework.classId,
        completed: homework.completed || false,
        priority: homework.priority || 'medium'
      });
      setDate(dueDate);
    }
    setLoading(false);
  }, [id, homeworks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateHomework(id as string, {
        ...formData,
        dueDate: date ? date.toISOString() : formData.dueDate
      });

      router.push(`/homework/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to update homework:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get the class info and its color
  const selectedClass = classes.find(c => c.id === formData.classId);
  const classColors = ['#DC2626', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0D9488', '#475569'];
  const classIndex = classes.findIndex(c => c.id === formData.classId);
  const accentColor = classIndex >= 0 ? classColors[classIndex % classColors.length] : '#0ea5e9';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!formData.title) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-gray-900 rounded-2xl mb-5 border border-sky-100 dark:border-gray-800">
          <BookOpen className="h-7 w-7 text-sky-400 dark:text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">Homework not found</h1>
        <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-6">This assignment may have been deleted or doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>
    );
  }

  const ClassIcon = selectedClass ? (iconMap[selectedClass.icon as keyof typeof iconMap] ?? BookOpen) : BookOpen;

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Back link */}
        <Link
          href={`/homework/${id}`}
          className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homework
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
                Edit Homework
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
                  Title <span className="text-red-400 normal-case">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter homework title"
                  required
                  className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                  Description <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add details about the homework..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                />
              </div>

              {/* Due Date, Class, Priority — responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Due Date */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Due Date <span className="text-red-400 normal-case">*</span>
                  </Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-11 flex items-center gap-2 px-3 text-sm font-normal bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:border-sky-500 rounded-xl transition-colors text-left"
                      >
                        <CalendarIcon className="h-4 w-4 text-sky-500 shrink-0" />
                        {date ? format(date, 'PPP') : <span className="text-sky-400">Pick a date</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
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

                {/* Class */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Class <span className="text-red-400 normal-case">*</span>
                  </Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => handleChange('classId', value)}
                  >
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

                {/* Priority */}
                <div>
                  <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                      <SelectItem value="low" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Low</SelectItem>
                      <SelectItem value="medium" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Medium</SelectItem>
                      <SelectItem value="high" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Completed checkbox */}
              <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-gray-800 rounded-xl border border-sky-100 dark:border-gray-700">
                <Checkbox
                  id="completed"
                  checked={formData.completed}
                  onCheckedChange={(checked) => handleChange('completed', checked as boolean)}
                  className="size-5 rounded-md bg-sky-200 dark:bg-gray-700 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-semibold text-sky-800 dark:text-sky-300 cursor-pointer select-none"
                >
                  Mark as completed
                </Label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 sm:px-8 py-4 border-t border-sky-100/60 dark:border-gray-800">
              <Link href={`/homework/${id}`}>
                <button
                  type="button"
                  disabled={saving}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.title.trim()}
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {saving ? (
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
