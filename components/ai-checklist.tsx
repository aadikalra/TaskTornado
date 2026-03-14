'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClassContext } from '@/context/ClassContext';
import { useUpgrade } from '@/context/UpgradeContext';
import confetti from 'canvas-confetti';

interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

interface AIChecklistProps {
    initialTitle: string;
    initialItems: string[];
    onComplete?: () => void;
}

export function AIChecklist({ initialTitle, initialItems, onComplete }: AIChecklistProps) {
    const { addClass, addHomework } = useClassContext();
    const { handlePlanLimitError } = useUpgrade();
    const [title, setTitle] = useState(initialTitle);
    const [items, setItems] = useState<ChecklistItem[]>(
        initialItems.map((text, i) => ({ id: `item-${Date.now()}-${i}`, text, checked: false }))
    );
    const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
    const [isHovered, setIsHovered] = useState(false);

    const handleFinish = async () => {
        setStatus('accepted');

        try {
            // 1. Create the class
            // Use a default icon since we can't easily ask for one here, or infer? 
            // 'BookOpen' is a safe default for a generic study plan.
            const className = title;

            // Check if class already exists to avoid duplicates? 
            // For now, let's just create it as requested.
            // But adding a class is async. We assume it creates a new ID.
            // Wait, addClass doesn't return the ID... it returns Promise<void>.
            // The context handles optimistic updates with a temp ID.
            // Refetching the class list to find the one we just added is tricky with the temp ID logic.
            // However, addClass implementation generates a temp ID and swaps it.
            // Without the ID returned, I can't immediately add homework to it reliably in the same tick if I need the *real* ID.
            // But typically optimistic ID works if the context handles it.
            // Actually, looking at ClassContext, addClass is void. 
            // But I can try to find the class by name after adding it.
            // This is a race condition risk. 
            // HACK: I will modify ClassContext later if needed, but for now I'll try to find it.

            await addClass(className, 'BookOpen');

            // We need to wait for the state to update to get the new class ID.
            // Since we can't easily wait for the *exact* new class ID from a void function without a refetch or return value,
            // I'll assume I can find it by name immediately if the optimistic update works.

            // Small delay to allow optimistic update to propagate to 'classes' state? 
            // Actually, 'classes' comes from context props.
            // Let's assume we can't reliably get it immediately without a return.
            // I'll check ClassContext again. It uses setClasses(prev => [...prev, optimisticClass]).
            // So the local 'classes' array in THIS component won't update until next render.

            // Ideally I should update ClassContext to return the ID. 
            // But I can't do that easily without ensuring I don't break other things (though I can just change return type).
            // Let's check ClassContext lines 630-677. It returns Promise<void>.
            // It DOES create a tempId.

            // PLAN B: Use the `useClasses` context to get the *latest* classes, but I can't await state updates.
            // I'll rely on a finding strategy or...
            // Let's modify ClassContext to return the ID. It is safer.

        } catch (e) {
            console.error("Failed to create class/homework", e);
            // Revert status on error?
            setStatus('pending');
        }
    };

    // Wait, I can't modify ClassContext easily in this step without re-reading it all or doing a rigorous edit.
    // Actually, I can use a known trick: pass a pre-generated ID? No, addClass generates it.

    // Let's pause and think.
    // If I can't get the ID, I can't add homework.
    // I WILL MODIFY ClassContext to return the class ID. It's a small change.
    // wait, I can just do a multi-file edit strategy.

    // For now, let's write the component assuming `addClass` returns the ID (I will ensure I allow for it).
    // If it doesn't, I'll update ClassContext in the next step.
    // Actually, I'll do the ClassContext update FIRST or essentially now.

    // Let's update the component to handle the logic. 

    const handleAddItem = () => {
        setItems([...items, { id: `item-${Date.now()}`, text: '', checked: true }]);
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleTextChange = (id: string, newText: string) => {
        setItems(items.map(i => i.id === id ? { ...i, text: newText } : i));
    };

    const handleToggle = (id: string) => {
        const item = items.find(i => i.id === id);
        if (item && !item.checked) {
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { y: 0.8 },
                colors: ['#165df9', '#3B82F6', '#60A5FA'],
                gravity: 1.2,
                ticks: 200,
            });
        }
        setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const getPathAnimate = (isChecked: boolean) => ({
        pathLength: isChecked ? 1 : 0,
        opacity: isChecked ? 1 : 0,
    });

    const getPathTransition = (isChecked: boolean): Transition => ({
        pathLength: { duration: 0.5, ease: 'easeInOut' },
        opacity: {
            duration: 0.01,
            delay: isChecked ? 0 : 0.5,
        },
    });

    if (status === 'declined') {
        return (
            <div className="p-4 rounded-[24px] bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-center text-sm text-red-600 dark:text-red-400">
                Checklist declined
            </div>
        );
    }

    if (status === 'accepted') {
        return (
            <div className="p-4 rounded-[24px] bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-center text-sm text-green-600 dark:text-green-400">
                <Check className="w-5 h-5 mx-auto mb-2" />
                Added to Dashboard
            </div>
        );
    }

    return (
        <div
            className="my-4 rounded-[24px] border border-zinc-200/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden transition-all hover:shadow-md"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-4 border-b border-zinc-100/50 dark:border-zinc-800/50 flex items-center justify-between bg-white/20 dark:bg-zinc-800/20">
                <Input
                    className="border-none bg-transparent shadow-none h-auto p-0 text-base font-semibold text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Checklist Title"
                />
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        onClick={() => setStatus('declined')}
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            <div className="p-2 space-y-1">
                <AnimatePresence initial={false}>
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="group flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="relative flex-1 group/item">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "flex-shrink-0 w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all duration-300",
                                            item.checked
                                                ? "bg-[#165df9] border-[#165df9] text-white scale-110 shadow-sm shadow-[#165df9]/20"
                                                : "border-zinc-300 dark:border-zinc-600 bg-transparent hover:border-[#165df9]/50"
                                        )}
                                        onClick={() => handleToggle(item.id)}
                                    >
                                        {item.checked && <Check size={12} strokeWidth={4} />}
                                    </div>

                                    <Input
                                        className={cn(
                                            "flex-1 border-none bg-transparent shadow-none h-auto p-0 text-sm focus-visible:ring-0 transition-all duration-300",
                                            item.checked ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"
                                        )}
                                        value={item.text}
                                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                                        placeholder="Add a task..."
                                    />

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>

                                <motion.svg
                                    width="100%"
                                    height="24"
                                    viewBox="0 0 300 24"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-[calc(100%-48px)] overflow-visible"
                                    preserveAspectRatio="none"
                                >
                                    <motion.path
                                        d="M 2 12 s 40 -8 60 -8 c 15 0 -30 10 -20 15 c 8 4 80 -18 85 -12 c 5 6 -20 14 3 15 c 15 1 25 -14 60 -14"
                                        vectorEffect="non-scaling-stroke"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        initial={false}
                                        animate={getPathAnimate(item.checked)}
                                        transition={getPathTransition(item.checked)}
                                        className="stroke-[#165df9] opacity-60"
                                    />
                                </motion.svg>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-zinc-500 hover:text-primary hover:bg-primary/5 h-8 px-2 rounded-xl mt-1"
                    onClick={handleAddItem}
                >
                    <Plus size={14} className="mr-2" />
                    Add Item
                </Button>
            </div>

            <div className="p-3 bg-zinc-50/30 dark:bg-zinc-900/30 border-t border-zinc-100/50 dark:border-zinc-800/50 flex justify-end gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus('declined')}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                >
                    Decline
                </Button>
                <Button
                    size="sm"
                    onClick={async () => {
                        setStatus('accepted');
                        try {
                            // Logic to be injected via prop or context modification
                            // Since I can't easily access the modified context return value here without updating context first,
                            // I will pass the logic up or assume context is updated.
                            // Actually, I can create a custom handler in AIAssistant that manages this logic?
                            // No, `useClasses` is best used here.

                            // Optimistic: using a random ID or assuming addClass returns ID.
                            // For now, I'll disable the actual call or use a callback prop to let parent handle it?
                            // Parent (AIAssistant) handling it is cleaner if I don't want to touch Context file.
                            // But ChecklistWidget needs access to context.

                            if (onComplete) onComplete();

                            // Proposed Context Change Pattern:
                            // const newClassId = await addClass(title, 'BookOpen');
                            // items.filter(i => i.checked).forEach(i => addHomework(newClassId, i.text, new Date(), 'medium'));

                            // For this specific step, I'll allow the error (it won't return ID yet)
                            // and I will FIX ClassContext in the next tool call IMMEDIATELY.

                            const newClassId = await addClass(title, 'BookOpen');

                            if (newClassId) {
                                const today = new Date();
                                // Add items sequentially to preserve order
                                for (const item of items) {
                                    await addHomework(newClassId, item.text, today, 'medium', [], '', item.checked);
                                }
                            }

                        } catch (e: any) {
                            if (!handlePlanLimitError(e)) {
                                console.error(e);
                            }
                        }
                    }}
                    className="bg-[#165df9] hover:bg-[#165df9]/90 text-white shadow-md shadow-[#165df9]/20 rounded-lg"
                >
                    Finish & Add
                </Button>
            </div>
        </div>
    );
}
