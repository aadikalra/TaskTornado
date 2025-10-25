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
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

type AddTestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddTestModal = ({ isOpen, onClose }: AddTestModalProps) => {
  const { classes, addTest } = useClassContext();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testType, setTestType] = useState('Test');
  const [studyMaterials, setStudyMaterials] = useState('');

  useEffect(() => {
    if (isOpen && !classId && classes.length > 0) {
      setClassId(classes[0].id);
    }
  }, [isOpen, classes, classId]);

  const resetForm = () => {
    setTitle('');
    setStudyMaterials('');
    setTestType('Test');
    setTestDate(new Date());
    setClassId(classes[0]?.id || '');
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

    // Map UI strings to TestType values
    let mappedTestType: 'exam' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation';
    switch (testType) {
      case 'Test':
        mappedTestType = 'exam';
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
        mappedTestType = 'project'; // Default to project for "Other"
        break;
      default:
        mappedTestType = 'exam'; // Default fallback
    }

    try {
      await addTest(classId, title, testDate, mappedTestType, {
        studyMaterials: materialsList
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
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Add New Test
            </h2>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="testTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Test Title
                </Label>
                <Input
                  id="testTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Biology Midterm"
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                />
              </div>

              <div>
                <Label
                  htmlFor="testClass"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Class
                </Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id="testClass" className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" position="popper" sideOffset={4}>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.id}
                        value={cls.id}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="testDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Test Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {testDate ? (
                          format(testDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Calendar
                        mode="single"
                        selected={testDate}
                        onSelect={setTestDate}
                        initialFocus
                        className="text-gray-900 dark:text-gray-100"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label
                    htmlFor="testType"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Test Type
                  </Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger id="testType" className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" position="popper" sideOffset={4}>
                      <SelectItem value="ALPHA" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">ALPHA</SelectItem>
                      <SelectItem value="BETA" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">BETA</SelectItem>
                      <SelectItem value="Quiz" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">Quiz</SelectItem>
                      <SelectItem value="Other" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="studyMaterials"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Study Materials / Topics (Optional)
                </Label>
                <Textarea
                  id="studyMaterials"
                  value={studyMaterials}
                  onChange={(e) => setStudyMaterials(e.target.value)}
                  placeholder="Enter topics, one per line..."
                  rows={4}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-4 h-9 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !classId || !testDate}
                className="bg-[#264f84] hover:bg-[#1f3f6b] text-white px-4 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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