'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';
import { RefreshCcw, Calendar, Trash2, Plus, X } from 'lucide-react';
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
                <p className="text-xl leading-[1.6] text-sky-700/80 dark:text-sky-300/80 mb-8 font-serif italic text-center px-8 border-l-4 border-sky-500">
                    &quot;Don&apos;t waste time logging the same tasks every day. Set it once, and let TaskTornado handle the rest.&quot;
                </p>

                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    In school, many tasks are repetitive—reading logs, weekly vocab, or daily practice. Instead of manually adding these every single time, you can use <b>Recurring Homework</b> to automate your schedule.
                </p>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">How to Identify Recurring Tasks</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    When you look at your homework list, recurring items are marked with a special <b>circular arrow icon</b> <RefreshCcw className="inline-block w-4 h-4 text-sky-500" /> next to their due date. This tells you that this task is part of a larger series.
                </p>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Setting Up Automation</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    When adding a new homework item, you&apos;ll see a &quot;Make Recurring&quot; toggle. You can choose from:
                </p>
                <div className="mb-12">
                    <PracticeAddButton />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">Daily</h4>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">The task repeats every single day. Perfect for reading logs or quick review.</p>
                    </div>
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">Weekly</h4>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">The task repeats on the same day every week. Ideal for weekly quizzes or problem sets.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">The Multi-Choice Delete</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Deleting recurring homework is different because TaskTornado gives you more control. When you click delete on a recurring item, you&apos;ll be asked:
                </p>
                <ul className="space-y-6 mb-12">
                    <li className="flex gap-4">
                        <div className="mt-1 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400 h-fit">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">Delete this instance</h4>
                            <p className="text-sky-800/60 dark:text-sky-300/60">Only removes the specific homework item for today. Future tasks in the series will remain untouched.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="mt-1 bg-red-600 p-2 rounded-lg text-white h-fit">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">Delete whole series</h4>
                            <p className="text-sky-800/60 dark:text-sky-300/60">Removes this task and <b>all future instances</b>. Use this when the recurring assignment is permanently finished or cancelled.</p>
                        </div>
                    </li>
                </ul>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-sky-800 dark:text-sky-200 mb-6">Interactive Practice Zone</h2>
                    <p className="text-lg text-sky-800/70 dark:text-sky-300/70 mb-8 font-medium">
                        Try managing these recurring items. Notice the icons and try deleting them to see the choice menu.
                    </p>
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 p-8 rounded-[24px] border border-sky-200/40 dark:border-sky-800/30">
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
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const modal = mounted && isOpen ? (
        <AnimatePresence>
            <div
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] text-base"
                onClick={() => setIsOpen(false)}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                        <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                            Add New Homework
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                        {/* Class Selection */}
                        <div>
                            <Label htmlFor="class" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                Class
                            </Label>
                            <Select>
                                <SelectTrigger className="h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
                                    <SelectItem value="class1" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Physics 101</SelectItem>
                                    <SelectItem value="class2" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">English Literature</SelectItem>
                                    <SelectItem value="class3" className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm rounded-lg">Math 10</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title Input */}
                        <div>
                            <Label htmlFor="homeworkTitle" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                Title
                            </Label>
                            <Input
                                id="homeworkTitle"
                                type="text"
                                placeholder="e.g., Chapter 5 Exercises"
                                className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Description Input */}
                        <div>
                            <Label htmlFor="homeworkDescription" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                Description <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                            </Label>
                            <textarea
                                id="homeworkDescription"
                                placeholder="Add any additional details..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm resize-none"
                            />
                        </div>

                        {/* Due Date and Priority */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                    Due Date
                                </Label>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 hover:border-sky-500 rounded-xl"
                                >
                                    <Calendar className="mr-2 h-4 w-4 text-sky-500" />
                                    {format(new Date(), 'PPP')}
                                </Button>
                            </div>

                            <div>
                                <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                    Priority
                                </Label>
                                <Select defaultValue="medium">
                                    <SelectTrigger className="w-full !h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white text-sm hover:border-sky-500 rounded-xl">
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

                        {/* Recurring Homework Section */}
                        <div className="pt-2 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-gray-800 rounded-xl border border-sky-100 dark:border-gray-700">
                                <Checkbox
                                    id="practice-recurring"
                                    checked={isRecurring}
                                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                                    className="size-5 rounded-md bg-sky-200 dark:bg-gray-700 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white"
                                />
                                <Label
                                    htmlFor="practice-recurring"
                                    className="text-sm font-semibold text-sky-800 dark:text-sky-300 cursor-pointer select-none"
                                >
                                    Make this a recurring homework
                                </Label>
                            </div>

                            {isRecurring && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
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
                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors"
                        >
                            Add Homework
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    ) : null;

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="w-full h-16 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg shadow-lg shadow-sky-500/20 group"
            >
                <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" />
                Open Practice Modal
            </Button>

            {mounted && modal && ReactDOM.createPortal(modal, document.body)}
        </>
    );
}

