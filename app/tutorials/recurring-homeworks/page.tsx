'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';
import { RefreshCcw, Calendar, Trash2, Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecurringOptions } from '@/components/RecurringOptions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function RecurringHomeworkTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Recurring Homework"
            category="Features"
            description="Save time by learning how to set up assignments that repeat daily or weekly, ensuring you never miss a routine task."
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <p className="text-xl leading-[1.6] text-gray-800 dark:text-gray-200 mb-8 font-serif italic text-center px-8 border-l-4 border-emerald-600">
                    "Don't waste time logging the same tasks every day. Set it once, and let TaskTornado handle the rest."
                </p>

                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    In school, many tasks are repetitive—reading logs, weekly vocab, or daily practice. Instead of manually adding these every single time, you can use <b>Recurring Homework</b> to automate your schedule.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">How to Identify Recurring Tasks</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    When you look at your homework list, recurring items are marked with a special <b>circular arrow icon</b> <RefreshCcw className="inline-block w-4 h-4 text-emerald-500" /> next to their due date. This tells you that this task is part of a larger series.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Setting Up Automation</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    When adding a new homework item, you'll see a "Make Recurring" toggle. You can choose from:
                </p>
                <div className="mb-12">
                    <PracticeAddButton />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">Daily</h4>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">The task repeats every single day. Perfect for reading logs or quick review.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Weekly</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">The task repeats on the same day every week. Ideal for weekly quizzes or problem sets.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">The Multi-Choice Delete</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Deleting recurring homework is different because TaskTornado gives you more control. When you click delete on a recurring item, you'll be asked:
                </p>
                <ul className="space-y-6 mb-12">
                    <li className="flex gap-4">
                        <div className="mt-1 bg-red-100 p-2 rounded-lg text-red-600 dark:bg-red-900/40 dark:text-red-400 h-fit">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Delete this instance</h4>
                            <p className="text-gray-600 dark:text-gray-400">Only removes the specific homework item for today. Future tasks in the series will remain untouched.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="mt-1 bg-red-600 p-2 rounded-lg text-white h-fit">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Delete whole series</h4>
                            <p className="text-gray-600 dark:text-gray-400">Removes this task and <b>all future instances</b>. Use this when the recurring assignment is permanently finished or cancelled.</p>
                        </div>
                    </li>
                </ul>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Interactive Practice Zone</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">
                        Try managing these recurring items. Notice the icons and try deleting them to see the choice menu.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-inner">
                        <RecurringPracticeList />
                    </div>
                </div>
            </motion.section>
        </TutorialArticleTemplate>
    );
}

function RecurringPracticeList() {
    const [items, setItems] = React.useState<any[]>([
        {
            id: 'rec-1',
            text: 'Daily Vocabulary Review',
            completed: false,
            subtext: 'Due today',
            priority: 'medium',
            className: 'English',
            classColor: '#EC4899',
            dueDateIcon: <RefreshCcw className="w-3.5 h-3.5" />,
            isRecurringInstance: true,
            parentRecurringId: 'parent-1'
        },
        {
            id: 'rec-2',
            text: 'Weekly Math Reflection',
            completed: false,
            subtext: 'Due in 3 days',
            priority: 'low',
            className: 'Math',
            classColor: '#3B82F6',
            dueDateIcon: <RefreshCcw className="w-3.5 h-3.5" />,
            isRecurringInstance: true,
            parentRecurringId: 'parent-2'
        }
    ]);

    const handleToggle = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const handlePinToggle = (id: string, pinned: boolean) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, pinned } : item
        ));
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        console.log('Single instance deleted');
    };

    const handleDeleteSeries = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        alert('The entire recurring series has been removed.');
    };

    const itemsWithHandlers = items.map(item => ({
        ...item,
        onDelete: () => handleDelete(item.id),
        onDeleteSeries: () => handleDeleteSeries(item.id)
    }));

    return (
        <PlayfulHomeworkList
            items={itemsWithHandlers}
            onItemToggle={handleToggle}
            onPinToggle={handlePinToggle}
        />
    );
}

function PracticeAddButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isRecurring, setIsRecurring] = React.useState(true);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 group"
            >
                <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" />
                Open Practice Modal
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust" onClick={() => setIsOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl z-10">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Add New Homework
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Title Input */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title
                                    </Label>
                                    <Input
                                        placeholder="e.g., Chapter 5 Exercises"
                                        className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
                                    />
                                </div>

                                {/* Description Input */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description <span className="text-gray-400 font-normal">(Optional)</span>
                                    </Label>
                                    <textarea
                                        placeholder="Add any additional details..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84] text-sm resize-none"
                                    />
                                </div>

                                {/* Due Date and Priority */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Due Date
                                        </Label>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#264f84] rounded-lg"
                                        >
                                            <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            {format(new Date(), 'PPP')}
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Priority
                                        </Label>
                                        <Select defaultValue="medium">
                                            <SelectTrigger className="w-full !h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Class Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Class
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm hover:border-[#264f84] rounded-lg">
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                                            <SelectItem value="class1">Physics 101</SelectItem>
                                            <SelectItem value="class2">English History</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Highlighted Recurring Section */}
                                <div className="pt-2 space-y-4 p-4 -mx-4 rounded-xl relative transition-all duration-500 bg-emerald-50/30 dark:bg-emerald-900/10 border-2 border-emerald-500/20 shadow-sm animate-pulse-subtle">
                                    <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm z-20">
                                        Recurring Settings
                                    </div>

                                    <div className="flex items-center space-x-2.5 pt-2">
                                        <Checkbox
                                            id="practice-recurring"
                                            checked={isRecurring}
                                            onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-[#264f84] data-[state=checked]:bg-[#264f84] data-[state=checked]:border-[#264f84] hover:border-[#264f84]"
                                        />
                                        <Label
                                            htmlFor="practice-recurring"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                        >
                                            Make this a recurring homework
                                        </Label>
                                    </div>

                                    {isRecurring && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pl-7 overflow-hidden"
                                        >
                                            <RecurringOptions
                                                recurring={{ frequency: 'weekly' }}
                                                onChange={() => { }}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-[#264f84] hover:bg-[#1a3a63] text-white rounded-lg"
                                >
                                    Create Assignment
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes pulse-subtle {
                    0% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.1); }
                    50% { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 15px 0 rgba(16, 185, 129, 0.2); }
                    100% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.1); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s infinite ease-in-out;
                }
            `}</style>
        </>
    );
}

