"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconArrowUp,
  IconCloud,
  IconFileSpark,
  IconGauge,
  IconPhotoScan,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";

const PROMPTS = [
  {
    icon: IconFileSpark,
    text: "Write documentation",
    prompt:
      "Write comprehensive documentation for this codebase, including setup instructions, API references, and usage examples.",
  },
  {
    icon: IconGauge,
    text: "Optimize performance",
    prompt:
      "Analyze the codebase for performance bottlenecks and suggest optimizations to improve loading times and runtime efficiency.",
  },
  {
    icon: IconAlertTriangle,
    text: "Find and fix 3 bugs",
    prompt:
      "Scan through the codebase to identify and fix 3 critical bugs, providing detailed explanations for each fix.",
  },
];

const MODELS = [
  {
    value: "quick",
    name: "Quick",
    description: "Fast responses (100 messages/day)",
    max: false,
  },
  {
    value: "gemini-2.5-flash-lite",
    name: "Deep",
    description: "Deeper analysis (10 messages/day)",
    max: false,
  },
  {
    value: "kimi-k2",
    name: "Cloud",
    description: "Most powerful (20 messages/day)",
    max: true,
  },
];

export default function Ai02() {
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [activeCommand, setActiveCommand] = useState<
    'data' | 'control' | 'resources' | 'flashcards' | 'therapist' | 'grade' | null
  >(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Track active @-command
  useEffect(() => {
    const inputLower = inputValue.toLowerCase();
    
    if (inputLower.includes('@data')) {
      setActiveCommand('data');
    } else if (inputLower.includes('@control')) {
      setActiveCommand('control');
    } else if (inputLower.includes('@resources')) {
      setActiveCommand('resources');
    } else if (inputLower.includes('@flashcards')) {
      setActiveCommand('flashcards');
    } else if (inputLower.includes('@therapist')) {
      setActiveCommand('therapist');
    } else if (inputLower.includes('@grade')) {
      setActiveCommand('grade');
    } else {
      setActiveCommand(null);
    }
  }, [inputValue]);

  const handlePromptClick = (prompt: string) => {
    if (inputRef.current) {
      inputRef.current.value = prompt;
      setInputValue(prompt);
      inputRef.current.focus();
    }
  };

  const handleModelChange = (value: string) => {
    const model = MODELS.find((m) => m.value === value);
    if (model) {
      setSelectedModel(model);
    }
  };

  const renderMaxBadge = () => (
    <div className="flex h-[14px] items-center gap-1.5 rounded border border-border px-1 py-0">
      <span
        className="text-[9px] font-bold uppercase"
        style={{
          background:
            "linear-gradient(to right, rgb(129, 161, 193), rgb(125, 124, 155))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MAX
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-[calc(42rem-5rem)]">
      <div className={cn(
        `flex min-h-[120px] flex-col rounded-2xl cursor-text bg-card border transition-all duration-200 shadow-lg`,
        activeCommand === 'data'
          ? 'border-yellow-400 ring-2 ring-yellow-400/30'
          : activeCommand === 'control'
            ? 'border-blue-400 ring-2 ring-blue-400/30'
            : activeCommand === 'resources'
              ? 'border-purple-400 ring-2 ring-purple-400/30'
              : activeCommand === 'flashcards'
                ? 'border-pink-400 ring-2 ring-pink-400/30'
                : activeCommand === 'therapist'
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                  : activeCommand === 'grade'
                    ? 'border-green-400 ring-2 ring-green-400/30'
                    : 'border-border'
      )}>
        <div className="flex-1 relative overflow-y-auto max-h-[258px]">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything"
            className={cn(
              `min-h-[48.4px] w-full border-0 p-3 transition-[padding] duration-200 ease-in-out outline-none text-[16px] resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent! whitespace-pre-wrap break-words`,
              activeCommand === 'data'
                ? 'text-yellow-700 dark:text-yellow-200'
                : activeCommand === 'control'
                  ? 'text-blue-700 dark:text-blue-200'
                  : activeCommand === 'resources'
                    ? 'text-purple-700 dark:text-purple-200'
                    : activeCommand === 'flashcards'
                      ? 'text-pink-700 dark:text-pink-200'
                      : activeCommand === 'therapist'
                        ? 'text-cyan-700 dark:text-cyan-200'
                        : activeCommand === 'grade'
                          ? 'text-green-700 dark:text-green-200'
                          : 'text-foreground'
            )}
          />
        </div>

        <div className="flex min-h-[40px] items-center gap-2 p-2 pb-1">
          <div className="flex aspect-1 items-center gap-1 rounded-full bg-muted p-1.5 text-xs">
            <IconCloud className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="relative flex items-center">
            <Select
              value={selectedModel.value}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="w-fit border-none bg-transparent! p-0 text-sm text-muted-foreground hover:text-foreground focus:ring-0 shadow-none">
                <SelectValue>
                  {selectedModel.max ? (
                    <div className="flex items-center gap-1">
                      <span>{selectedModel.name}</span>
                      {renderMaxBadge()}
                    </div>
                  ) : (
                    <span>{selectedModel.name}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.max ? (
                      <div className="flex items-center gap-1">
                        <span>{model.name}</span>
                        {renderMaxBadge()}
                      </div>
                    ) : (
                      <span>{model.name}</span>
                    )}
                    <span className="text-muted-foreground block text-xs">
                      {model.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground transition-all duration-100"
              title="Attach images"
            >
              <IconPhotoScan className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-100 cursor-pointer",
                inputValue && (
                  activeCommand === 'data'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : activeCommand === 'control'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : activeCommand === 'resources'
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : activeCommand === 'flashcards'
                          ? 'bg-pink-500 hover:bg-pink-600'
                          : activeCommand === 'therapist'
                            ? 'bg-cyan-500 hover:bg-cyan-600'
                            : activeCommand === 'grade'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-primary hover:bg-primary/90'
                )
              )}
              disabled={!inputValue}
            >
              <IconArrowUp className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PROMPTS.map((button) => {
          const IconComponent = button.icon;
          return (
            <Button
              key={button.text}
              variant="ghost"
              className="group flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-foreground transition-all duration-200 hover:bg-muted/30 h-auto bg-transparent dark:bg-muted"
              onClick={() => handlePromptClick(button.prompt)}
            >
              <IconComponent className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span>{button.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
