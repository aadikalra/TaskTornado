'use client';

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { motion } from "framer-motion";
import { PlayfulHomeworkList } from "./PlayfulHomeworkList";
import type { Class as ClassType, Homework as HomeworkType, Priority } from "@/context/ClassContext";
import { getDueDateStatus, getDueDateLabel, getDueDateIcon } from "@/lib/dateUtils";
import { 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Trash2, 
  BookOpen, 
  Calculator,
  BookText,
  BookMarkedIcon,
  Video,
  TestTube2,
  BookType,
  Film,
  Microscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Map of icon names to their corresponding Lucide components
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  BookText,
  BookMarked: BookMarkedIcon,
  BookType,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Trash2,
  Calculator,
  Video,
  Film, // For Media Team
  TestTube2, // For Science 8
  Microscope, // Alternative for Science 8
  // Add more icons here as they are used in your application
};

// Define a type for the todo item to be used by PlayfulHomeworkList
type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  subtext: string;
  priority: Priority;
  links?: Array<{
    id: string;
    url: string;
    title?: string;
  }>;
  onDelete?: () => void;
  dueDateIcon: React.ReactNode;
};

type ClassHomeworkListProps = {
  classItem: ClassType;
  homeworks: HomeworkType[];
  onToggle: (id: string) => Promise<void>;
  onDeleteHomework: (id: string) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
};

// Array of nice pastel hex colors, now including dark versions
const pastelColorPairs = [
  { light: '#FFD1DC', dark: '#8c7379' }, // Pastel Pink
  { light: '#B0E0E6', dark: '#6b888c' }, // Powder Blue
  { light: '#98FB98', dark: '#578f57' }, // Pale Green
  { light: '#F0E68C', dark: '#9c955a' }, // Khaki
  { light: '#E6E6FA', dark: '#8a8a96' }, // Lavender
  { light: '#ADD8E6', dark: '#6e8991' }, // Light Blue
  { light: '#F08080', dark: '#a15555' }, // Light Coral
  { light: '#FFA07A', dark: '#a1654d' }, // Light Salmon
  { light: '#FFB6C1', dark: '#a6777e' }, // Light Pink
  { light: '#AFEEEE', dark: '#6d9191' }, // Pale Turquoise
];

const ClassHomeworkListComponent = ({
  classItem,
  homeworks,
  onToggle,
  onDeleteHomework,
  onDeleteClass,
}: ClassHomeworkListProps) => {
  // Use a state hook with a lazy initializer to pick a random color pair only once
  const [randomColorPair] = useState(() => {
    const randomIndex = Math.floor(Math.random() * pastelColorPairs.length);
    return pastelColorPairs[randomIndex];
  });

  // Use local state for optimistic UI updates
  const [localHomeworks, setLocalHomeworks] = useState(homeworks);

  // Sync local state with prop changes from the parent component
  useEffect(() => {
    setLocalHomeworks(homeworks);
  }, [homeworks]);

  // Local handler for toggling completion with optimistic update
  const onToggleLocal = useCallback(async (id: string) => {
    const prevLocalHomeworks = localHomeworks;
    setLocalHomeworks(prev => prev.map(hw =>
      hw.id === id ? { ...hw, completed: !hw.completed } : hw
    ));
    
    try {
      await onToggle(id);
    } catch (error) {
      console.error("Failed to toggle homework, reverting UI:", error);
      setLocalHomeworks(prevLocalHomeworks);
    }
  }, [localHomeworks, onToggle]);

  // Local handler for deleting homework with optimistic update
  const onDeleteHomeworkLocal = useCallback(async (id: string) => {
    const prevLocalHomeworks = localHomeworks;
    setLocalHomeworks(prev => prev.filter(hw => hw.id !== id));
    
    try {
      await onDeleteHomework(id);
    } catch (error) {
      console.error("Failed to delete homework, reverting UI:", error);
      setLocalHomeworks(prevLocalHomeworks);
    }
  }, [localHomeworks, onDeleteHomework]);

  // Memoize the sorting and filtering of local homeworks
  const allHomeworks = useMemo(() => {
    return [...localHomeworks].sort((a, b) => {
      const dateA = typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate;
      const dateB = typeof b.dueDate === 'string' ? new Date(b.dueDate) : b.dueDate;
      return dateA.getTime() - dateB.getTime();
    });
  }, [localHomeworks]);

  // Memoize the homework to TodoItem conversion
  const homeworkToTodoItem = useCallback((hw: HomeworkType): TodoItem => {
    const dueDate = typeof hw.dueDate === 'string' ? new Date(hw.dueDate) : hw.dueDate;
    const IconComponent = getDueDateIcon(dueDate);
    const status = getDueDateStatus(dueDate);

    let links = hw.links;
    if (typeof links === 'string') {
      try {
        links = JSON.parse(links);
      } catch (e) {
        console.error('Error parsing links:', e);
        links = [];
      }
    }

    return {
      id: hw.id,
      text: hw.title,
      completed: hw.completed,
      subtext: getDueDateLabel(dueDate),
      priority: (hw.priority || 'medium') as Priority,
      links: links || [],
      dueDateIcon: (
        <IconComponent
          className="w-4 h-4 text-gray-500 flex-shrink-0"
          aria-label={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
      onDelete: () => onDeleteHomeworkLocal(hw.id),
    };
  }, [onDeleteHomeworkLocal]);
  
  // Handler for deleting a class
  const handleDeleteClass = useCallback(async () => {
    try {
      await onDeleteClass(classItem.id);
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  }, [classItem.id, onDeleteClass]);
  
  // Memoize the converted todo items
  const allTodoItems = useMemo(() => allHomeworks.map(homeworkToTodoItem), [allHomeworks, homeworkToTodoItem]);

  // Always show the class card, even if there are no homeworks
  // Log class information
  console.log('Class Info:', {
    id: classItem.id,
    name: classItem.name,
    icon: classItem.icon,
    iconInMap: classItem.icon in iconMap,
    availableIcons: Object.keys(iconMap)
  });
  
  // Use the icon from classItem, fallback to BookOpen if not found
  const ClassIconComponent = (iconMap[classItem.icon] as LucideIcon) || BookOpen;
  
  // Use the assigned class color from the DB, otherwise use a memoized random color
  const classColor =  randomColorPair.light;
  
  // Use the dark version of the random color for the icon, or a default dark color if no random pair is used
  const iconColor = randomColorPair.dark;
    
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${classColor}`,
              }}
            >
              <ClassIconComponent 
                className="h-4 w-4"
                style={{ color: `${iconColor}` }}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
              <p className="text-sm text-gray-500">{allHomeworks.length} {allHomeworks.length === 1 ? 'assignment' : 'assignments'}</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete class</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the class &quot;{classItem.name}&quot; and all its assignments.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteClass}
                >
                  Delete Class
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      
        <div className="p-4 space-y-6">
          {allTodoItems.length > 0 && (
            <PlayfulHomeworkList 
              items={allTodoItems} 
              onItemToggle={onToggleLocal} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ClassHomeworkList = memo(ClassHomeworkListComponent);
ClassHomeworkList.displayName = 'ClassHomeworkList';