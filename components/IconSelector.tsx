'use client';

import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

// Define a type for valid Lucide icon names
type LucideIconName = keyof typeof LucideIcons;

// List of common icons to show in the selector
const COMMON_ICONS: LucideIconName[] = [
  'BookOpen', 'BookText', 'GraduationCap', 'School', 'BookMarked', 'BookUp', 'BookType',
  'Calculator', 'FlaskConical', 'Atom', 'Microscope', 'Beaker', 'Brain',
  'Code2', 'Cpu', 'Database', 'FileCode', 'Terminal', 'Wand2', 'Palette', 'Music', 'Drama',
  'Globe', 'Map', 'History', 'Calendar', 'Clock', 'Award', 'Trophy', 'Star', 'Lightbulb'
] as const;

// Type for the icon component props
type IconComponentProps = React.FC<LucideProps>;

interface IconSelectorProps {
  value?: LucideIconName;
  onChange: (iconName: LucideIconName) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [selectedIcon, setSelectedIcon] = React.useState<LucideIconName>(value || 'BookOpen');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setSelectedIcon(value);
    }
  }, [value]);

  const IconComponent = LucideIcons[selectedIcon] as IconComponentProps || LucideIcons.BookOpen;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Icon
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            type="button"
          >
            <div className="mr-2 h-4 w-4">
              <IconComponent className="h-full w-full" />
            </div>
            {selectedIcon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2">
            <ScrollArea className="h-[300px] w-full">
              <div className="grid grid-cols-5 gap-2 p-2">
                {COMMON_ICONS.map((iconName) => {
                  const Icon = LucideIcons[iconName] as IconComponentProps;
                  return (
                    <Button
                      key={iconName}
                      variant={selectedIcon === iconName ? 'default' : 'ghost'}
                      size="icon"
                      className="h-10 w-10"
                      type="button"
                      onClick={() => {
                        setSelectedIcon(iconName);
                        onChange(iconName);
                        setIsOpen(false);
                      }}
                    >
                      <div className="h-5 w-5">
                        <Icon className="h-full w-full" />
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
