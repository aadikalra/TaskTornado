'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useAI } from '@/context/AIContext';
import { Clock, AlertTriangle, BookOpen, Loader2, Link as LinkIcon, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icon-map';
import { Button } from '@/components/animate-ui/components/buttons/button';

interface PriorityHomework {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const PriorityHomeworkCard = () => {
  const { homeworks, classes } = useClassContext();
  const { chat } = useAI();
  const [priorityHomework, setPriorityHomework] = useState<PriorityHomework | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [hasStartedWorking, setHasStartedWorking] = useState(false);

  // Create a unique key for localStorage based on the current homeworks
  const homeworksKey = useMemo(() => {
    const incompleteIds = homeworks
      .filter(hw => !hw.completed)
      .map(hw => hw.id)
      .sort()
      .join(',');
    return `priority_homework_${incompleteIds}`;
  }, [homeworks]);

  // Check if we need to update the cached result
  const needsUpdate = useCallback((cached: { timestamp: number } | null) => {
    if (!cached) return true;
    // Update if cache is older than 1 hour
    return Date.now() - cached.timestamp > 60 * 60 * 1000;
  }, []);

  // Load from cache on mount and when homeworks change
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;

    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(homeworksKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!needsUpdate(parsed)) {
            setPriorityHomework(parsed.data);
            setIsLoading(false);
            return false; // No need to update
          }
        }
        return true; // Need to fetch new data
      } catch (err) {
        console.error('Error loading from cache:', err);
        return true; // On error, fetch new data
      }
    };

    const shouldFetch = loadFromCache();
    if (shouldFetch) {
      setLastUpdated(prev => prev + 1);
    }
  }, [homeworksKey, needsUpdate]);

  // Fetch and cache priority homework
  useEffect(() => {
    if (lastUpdated === 0) return; // Skip initial render

    const determinePriorityHomework = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Filter and format homeworks for the AI
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        // Separate overdue, due today, and upcoming homeworks
        const overdueHomeworks = homeworks
          .filter(hw => {
            if (hw.completed) return false;
            const hwDate = new Date(hw.dueDate);
            hwDate.setHours(0, 0, 0, 0);
            return hwDate < today; // Past due date
          })
          .map(hw => ({
            id: hw.id,
            title: hw.title,
            className: classes.find(c => c.id === hw.classId)?.name || 'Unknown Class',
            dueDate: new Date(hw.dueDate).toISOString(),
            description: hw.description || '',
            links: hw.links || [],
            created_at: hw.created_at || new Date().toISOString(),
            isOverdue: true,
            daysOverdue: Math.floor((today.getTime() - new Date(hw.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
          }));

        const dueTodayHomeworks = homeworks
          .filter(hw => {
            if (hw.completed) return false;
            const hwDate = new Date(hw.dueDate);
            hwDate.setHours(0, 0, 0, 0);
            return hwDate.getTime() === today.getTime(); // Due today
          })
          .map(hw => ({
            id: hw.id,
            title: hw.title,
            className: classes.find(c => c.id === hw.classId)?.name || 'Unknown Class',
            dueDate: new Date(hw.dueDate).toISOString(),
            description: hw.description || '',
            links: hw.links || [],
            created_at: hw.created_at || new Date().toISOString(),
            isOverdue: false,
            isDueToday: true,
          }));

        const upcomingHomeworks = homeworks
          .filter(hw => {
            if (hw.completed) return false;
            const hwDate = new Date(hw.dueDate);
            hwDate.setHours(0, 0, 0, 0);
            return hwDate > today; // Future due date
          })
          .map(hw => ({
            id: hw.id,
            title: hw.title,
            className: classes.find(c => c.id === hw.classId)?.name || 'Unknown Class',
            dueDate: new Date(hw.dueDate).toISOString(),
            description: hw.description || '',
            links: hw.links || [],
            created_at: hw.created_at || new Date().toISOString(),
            isOverdue: false,
            isDueToday: false,
          }));

        // Priority order: overdue > due today > upcoming
        const homeworksToProcess = overdueHomeworks.length > 0 ? 
          overdueHomeworks : 
          dueTodayHomeworks.length > 0 ? 
            dueTodayHomeworks : 
            upcomingHomeworks;

        if (homeworksToProcess.length === 0) {
          setPriorityHomework(null);
          setIsLoading(false);
          return;
        }


        // Get current date and time in ISO format
        const currentDateTime = new Date().toISOString();

        // Call the AI with Gemma 3n model
        const response = await chat([{
          role: 'user',
          content: `Current date and time: ${currentDateTime}
          
Given the following list of homework assignments, please determine which one should be completed first.
${overdueHomeworks.length > 0 ? 
  `NOTE: These assignments are OVERDUE and should be prioritized immediately. The most overdue assignment should be selected first.` : 
  dueTodayHomeworks.length > 0 ?
  `NOTE: These assignments are DUE TODAY and should be prioritized immediately. Select the most important one.` :
  `These are upcoming assignments that should be prioritized based on due date and importance.`}

Consider the following factors:
${overdueHomeworks.length > 0 ? 
  `1. How overdue the assignment is (more days overdue = higher priority)
2. Assignment complexity and estimated time to complete
3. Class importance (prioritize core subjects)` :
  dueTodayHomeworks.length > 0 ?
  `1. Assignment complexity and estimated time to complete
2. Class importance (prioritize core subjects)
3. Any other relevant factors` :
  `1. Proximity to due date (sooner is higher priority)
2. Estimated time to complete (shorter tasks might be good to knock out quickly)
3. Class importance (prioritize core subjects)`}

${overdueHomeworks.length > 0 ? 
  `Each assignment includes "daysOverdue" - the number of days past the due date. Pick the one with the highest daysOverdue.` : 
  dueTodayHomeworks.length > 0 ?
  `All assignments are due today. Pick the most important/urgent one.` :
  `Any other relevant factors`}

Here's the homework data in JSON format:
${JSON.stringify(homeworksToProcess, null, 2)}

Please respond with a JSON object in this exact format:
{
  "id": "homework-id",
  "title": "Homework Title",
  "className": "Class Name",
  "dueDate": "ISO date string",
  "reason": "Brief explanation of why this should be done first${overdueHomeworks.length > 0 ? ' (mention how overdue it is)' : dueTodayHomeworks.length > 0 ? ' (mention it\'s due today)' : ''}",
  "priority": "high|medium|low"
}`
        }], 'gemma-3n-e4b-it');

        // Try to parse the JSON response
        try {
          // Safely extract the response content
          let responseContent = '';

          if (typeof response === 'string') {
            responseContent = response;
          } else if (response && typeof response === 'object') {
            // Handle different possible response structures
            if ('response' in response && typeof response.response === 'string') {
              responseContent = response.response;
            } else if ('message' in response &&
              response.message &&
              typeof response.message === 'object' &&
              'content' in response.message) {
              responseContent = String(response.message.content);
            } else {
              // Try to stringify if it's an object
              try {
                responseContent = JSON.stringify(response);
              } catch (e) {
                console.error('Could not stringify response:', response);
                throw new Error('Invalid response format from AI');
              }
            }
          }

          if (!responseContent) {
            throw new Error('Empty response from AI');
          }

          // Extract JSON from markdown code blocks if present
          let jsonStr = responseContent.trim();
          const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1];
          }

          const result = JSON.parse(jsonStr);

          // Cache the result
          const newPriorityHomework = {
            id: result.id,
            title: result.title,
            className: result.className,
            dueDate: result.dueDate,
            reason: result.reason,
            priority: result.priority || 'medium' as const
          };

          // Save to cache
          if (typeof window !== 'undefined') {
            const cacheData = {
              data: newPriorityHomework,
              timestamp: Date.now()
            };

            try {
              localStorage.setItem(homeworksKey, JSON.stringify(cacheData));
            } catch (err) {
              console.error('Error saving to cache:', err);
            }
          }

          setPriorityHomework(newPriorityHomework);
        } catch (e) {
          console.error('Error parsing AI response:', e, 'Response:', response);
          throw new Error('Failed to parse AI response. The AI might not have returned valid JSON.');
        }
      } catch (err) {
        console.error('Error determining priority homework:', err);
        setError('Failed to determine priority homework');
      } finally {
        setIsLoading(false);
      }
    };

    determinePriorityHomework();
  }, [homeworks, classes, chat, homeworksKey, lastUpdated]);

  // Don't show anything if there are no incomplete homeworks (overdue or upcoming)
  if (homeworks.filter(hw => !hw.completed).length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/3 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // If not loading and no priority homework found (or error), hide the section
  if (!isLoading && (!priorityHomework || error)) {
    return null;
  }

  // Get the class icon
  const homework = homeworks.find(hw => hw.id === priorityHomework?.id);
  const classData = homework ? classes.find(c => c.id === homework.classId) : null;
  const ClassIcon = classData?.icon ? (iconMap[classData.icon as keyof typeof iconMap] ?? BookOpen) : BookOpen;

  const formattedDueDate = priorityHomework ? new Date(priorityHomework.dueDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) : '';

  if (!priorityHomework) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <ClassIcon className="w-4 h-4 text-[#264f84] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {priorityHomework.className}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 text-[#264f84] dark:text-blue-400" />
              <span>Due {formattedDueDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-900">
          {(() => {
            const homework = homeworks.find(hw => hw.id === priorityHomework.id);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const hwDate = new Date(homework?.dueDate || '');
            hwDate.setHours(0, 0, 0, 0);
            const isOverdue = hwDate < today;
            const isDueToday = hwDate.getTime() === today.getTime();

            if (isOverdue) {
              const daysOverdue = Math.floor((today.getTime() - hwDate.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`}
                  </span>
                </>
              );
            }

            if (isDueToday) {
              return (
                <>
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Due Today</span>
                </>
              );
            }

            const priorityConfig = {
              high: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
              medium: { icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
              low: { icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
            }[priorityHomework.priority];

            const Icon = priorityConfig.icon;

            return (
              <>
                <Icon className={`w-3 h-3 ${priorityConfig.color}`} />
                <span className={`text-xs font-medium ${priorityConfig.color}`}>
                  {priorityHomework.priority.charAt(0).toUpperCase() + priorityHomework.priority.slice(1)}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">
            {priorityHomework.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {priorityHomework.reason}
          </p>
        </div>

        {/* Display links if available */}
        {(() => {
          const homework = homeworks.find(hw => hw.id === priorityHomework.id);
          const links = homework?.links;

          if (!links || links.length === 0) return null;

          // Handle both string and array formats for links
          let parsedLinks = [];
          try {
            parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
            if (!Array.isArray(parsedLinks)) parsedLinks = [];
          } catch (e) {
            console.error('Error parsing links:', e);
            parsedLinks = [];
          }

          if (parsedLinks.length === 0) return null;

          return (
            <div className="flex flex-wrap gap-2">
              {parsedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate max-w-[150px]" title={link.title || link.url}>
                    {link.title || link.url}
                  </span>
                </a>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3 text-[#264f84] dark:text-blue-400" />
          <span>AI Recommended</span>
        </div>
        <Button
          onClick={() => setHasStartedWorking(true)}
          disabled={hasStartedWorking}
          size="sm"
          variant={hasStartedWorking ? "secondary" : "default"}
          className={cn(
            "text-xs",
            !hasStartedWorking && "bg-[#264f84] hover:bg-[#1f3f6b] dark:bg-blue-600 dark:hover:bg-blue-700"
          )}
        >
          {hasStartedWorking ? 'Working...' : 'Start Working'}
        </Button>
      </div>
    </div>
  );
};

export default PriorityHomeworkCard;