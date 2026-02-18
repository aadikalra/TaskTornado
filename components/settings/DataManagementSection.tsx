'use client';

import { Trash2, BookOpen } from 'lucide-react';
import DangerZoneItem from './DangerZoneItem';

interface DataManagementSectionProps {
  classes: any[];
  homeworks: any[];
  showClassConfirm: boolean;
  showHomeworkConfirm: boolean;
  onClearClasses: () => void;
  onClearHomeworks: () => void;
}

export default function DataManagementSection({
  classes,
  homeworks,
  showClassConfirm,
  showHomeworkConfirm,
  onClearClasses,
  onClearHomeworks
}: DataManagementSectionProps) {
  return (
    <div className="space-y-3">
      <DangerZoneItem
        title="Delete All Classes"

        buttonText="Delete All Classes"
        confirmText="Click to Confirm"
        onConfirm={onClearClasses}
        isConfirming={showClassConfirm}
        count={classes.length}
        countLabel="class"
        icon={BookOpen}
        variant="destructive"
      />

      <DangerZoneItem
        title="Delete All Homework"

        buttonText="Delete All Homework"
        confirmText="Click to Confirm"
        onConfirm={onClearHomeworks}
        isConfirming={showHomeworkConfirm}
        count={homeworks.length}
        countLabel="assignment"
        icon={Trash2}
        variant="destructive"
      />
    </div>
  );
}
