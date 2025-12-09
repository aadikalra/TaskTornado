'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useClassContext, TestType, Priority as ContextPriority, TestStatus } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, X, Save, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TestTimePicker } from '@/components/TestTimePicker';

type StudyMaterial = string | { url: string; title?: string };
type Priority = 'low' | 'medium' | 'high' | 'critical';

export default function EditTestPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { tests, classes, updateTest } = useClassContext();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [testTime, setTestTime] = useState('');
  const [testType, setTestType] = useState('Quiz');
  const [description, setDescription] = useState('');
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [weight, setWeight] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TestStatus>('not_started');
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(100);
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [createdAt, setCreatedAt] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setTestDate(new Date(test.testDate));
      setTestTime(test.testTime || '');
      setTestType(test.testType || 'Quiz');
      setDescription(test.description || '');
      setStudyMaterials(test.studyMaterials || []);
      setWeight(test.weight || 0);
      setLocation(test.location || '');
      setDuration(test.duration || 60);
      setPriority((test.priority as Priority) || 'medium');
      setStatus((test.status as TestStatus) || 'not_started');
      setScore(test.score ?? null);
      setMaxScore(test.maxScore ?? 100);
      setGrade(test.grade || '');
      setNotes(test.notes || '');
      // Use snake_case to match the database schema
      setCompletedAt(test.completed_at ? new Date(test.completed_at) : null);
      setCreatedAt(test.created_at ? new Date(test.created_at) : new Date());
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, tests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !classId || !testDate) {
      toastError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const priorityForUpdate: ContextPriority = priority === 'critical' ? 'high' : priority;

      await updateTest(id, {
        title,
        classId,
        testDate: testDate.toISOString().split('T')[0],
        testTime: testTime || null,
        testType: testType as TestType,
        description: description || null,
        studyMaterials: studyMaterials.map(m => typeof m === 'string' ? m : m.url),
        weight: weight || null,
        location: location || null,
        duration: duration || null,
        priority: priorityForUpdate,
        status: status as TestStatus,
        score: score || null,
        maxScore: maxScore || 100,
        grade: grade || null,
        notes: notes || null,
        completed_at: completedAt ? completedAt.toISOString() : null
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <div className="relative flex items-center justify-center mb-8 py-2">
          <Link href="/dashboard" className="absolute left-0 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Edit Test</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter test title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Room 205"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v: TestStatus) => setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxScore ?? ''}
                  onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  step="0.01"
                  value={score ?? ''}
                  onChange={(e) => setScore(e.target.value ? Number(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={grade}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completedAt">Completed At</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completedAt ? format(completedAt, 'PPP') : 'Not completed'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={completedAt || undefined}
                      onSelect={(date) => setCompletedAt(date || null)}
                      initialFocus
                      required={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Additional notes about the test..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Created At</Label>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {format(createdAt, 'PPPpp')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={classId} onValueChange={setClassId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {testDate ? format(testDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={testDate}
                      onSelect={(date) => setTestDate(date || new Date())}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time (Optional)</Label>
                <TestTimePicker
                  value={testTime || undefined}
                  onChange={(value) => setTestTime(value)}
                  placeholder="Add specific time"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pick an exact time or leave blank if unknown.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Midterm">Midterm</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="ALPHA">ALPHA</SelectItem>
                    <SelectItem value="BETA">BETA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter test description"
                rows={4}
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Study Materials (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStudyMaterial}
                >
                  Add Material
                </Button>
              </div>

              <div className="space-y-3">
                {studyMaterials.map((material, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Title (optional)"
                        value={typeof material === 'object' ? material.title || '' : ''}
                        onChange={(e) => updateStudyMaterial(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={typeof material === 'object' ? material.url : material}
                        onChange={(e) => updateStudyMaterial(index, 'url', e.target.value)}
                        type="url"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStudyMaterial(index)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/tests/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
