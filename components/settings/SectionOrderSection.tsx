'use client';

import { Sparkles, Pin, BookOpen, GraduationCap, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SectionId = 'ai-priority' | 'pinned' | 'classes' | 'tests';

interface SectionOrderSectionProps {
  sectionOrder: SectionId[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onOrderChange: (newOrder: SectionId[]) => void;
}

export default function SectionOrderSection({
  sectionOrder,
  onMoveUp,
  onMoveDown,
  onOrderChange
}: SectionOrderSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionId);
      const newIndex = sectionOrder.indexOf(over?.id as SectionId);
      
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  };

  const getSectionInfo = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'ai-priority':
        return { name: 'AI Priority Recommendations', icon: Sparkles, color: 'text-purple-500' };
      case 'pinned':
        return { name: 'Pinned Homeworks', icon: Pin, color: 'text-blue-500' };
      case 'classes':
        return { name: 'My Classes', icon: BookOpen, color: 'text-green-500' };
      case 'tests':
        return { name: 'Tests & Exams', icon: GraduationCap, color: 'text-orange-500' };
      default:
        return { name: 'Unknown Section', icon: () => null, color: 'text-gray-500' };
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sectionOrder.map((sectionId) => (
            <SortableItem
              key={sectionId}
              id={sectionId}
              sectionOrder={sectionOrder}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  sectionOrder,
  onMoveUp,
  onMoveDown
}: {
  id: SectionId;
  sectionOrder: SectionId[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const index = sectionOrder.indexOf(id);
  const info = getSectionInfo(id);
  const Icon = info.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-lg border ${
        isDragging
          ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700'
      } transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move touch-none"
        >
          <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <Icon className={`h-5 w-5 ${info.color}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {info.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Position {index + 1} of {sectionOrder.length}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="h-8 w-8 p-0 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
          title="Move up"
        >
          ↑
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveDown(index)}
          disabled={index === sectionOrder.length - 1}
          className="h-8 w-8 p-0 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
          title="Move down"
        >
          ↓
        </Button>
      </div>
    </div>
  );
}

function getSectionInfo(sectionId: SectionId) {
  switch (sectionId) {
    case 'ai-priority':
      return { name: 'AI Priority Recommendations', icon: Sparkles, color: 'text-purple-500' };
    case 'pinned':
      return { name: 'Pinned Homeworks', icon: Pin, color: 'text-blue-500' };
    case 'classes':
      return { name: 'My Classes', icon: BookOpen, color: 'text-green-500' };
    case 'tests':
      return { name: 'Tests & Exams', icon: GraduationCap, color: 'text-orange-500' };
    default:
      return { name: 'Unknown Section', icon: () => null, color: 'text-gray-500' };
  }
}
