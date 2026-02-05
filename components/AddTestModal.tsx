import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useClassContext } from '../context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { X, Calendar as CalendarIcon, ChevronDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

type AddTestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
};

export const AddTestModal = ({ isOpen, onClose, defaultClassId }: AddTestModalProps) => {
  const { classes, addTest } = useClassContext();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testType, setTestType] = useState('Quiz');
  const [testTime, setTestTime] = useState('');
  const [description, setDescription] = useState('');
  const [studyMaterials, setStudyMaterials] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    } catch (err) {
      console.error('Error adding test:', err);
      toastError('Failed to add test', 'Please try again later.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl z-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Test
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Title Input */}
              <div>
                <Label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Title
                </Label>
                <Input
                  id="testTitle"
                  type="text"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="e.g., Biology Midterm"
                  className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                />
              </div>

              {/* Class Selection */}
              <div>
                <Label htmlFor="testClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class
                </Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.id}
                        value={cls.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg"
                      >
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="testDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#264f84] rounded-lg"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        {testDate ? format(testDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <Calendar
                        mode="single"
                        selected={testDate}
                        onSelect={setTestDate}
                        initialFocus
                        className="text-gray-900 dark:text-white rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="testType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Type
                  </Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                      <SelectItem value="ALPHA" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">ALPHA</SelectItem>
                      <SelectItem value="BETA" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">BETA</SelectItem>
                      <SelectItem value="Quiz" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Quiz</SelectItem>
                      <SelectItem value="Midterm" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Midterm</SelectItem>
                      <SelectItem value="Final" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Final</SelectItem>
                      <SelectItem value="Other" className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm rounded-lg">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-[#264f84] dark:text-blue-400 hover:text-[#1f3f6b] dark:hover:text-blue-300 transition-colors"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
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
                      <Label htmlFor="testTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test Time <span className="text-gray-400 font-normal">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="testTime"
                          type="time"
                          value={testTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestTime(e.target.value)}
                          className="w-full h-11 pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description <span className="text-gray-400 font-normal">(Optional)</span>
                      </Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="Enter a brief description..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84] text-sm resize-none"
                      />
                    </div>

                    {/* Study Materials */}
                    <div>
                      <Label htmlFor="studyMaterials" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Study Materials / Topics <span className="text-gray-400 font-normal">(Optional)</span>
                      </Label>
                      <textarea
                        id="studyMaterials"
                        value={studyMaterials}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStudyMaterials(e.target.value)}
                        placeholder="Enter topics or paste links, one per line..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84] text-sm resize-none"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Add links or topics, one per line. Links will be clickable in the test view.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-10 px-4 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !classId || !testDate}
                className="h-10 px-6 text-sm bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Test
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};