'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useAI } from '@/context/AIContext';
import { Sparkles, Clock, AlertTriangle, BookOpen, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        
        // Filter out completed homeworks and format them for the AI
        const incompleteHomeworks = homeworks
          .filter(hw => !hw.completed)
          .map(hw => ({
            id: hw.id,
            title: hw.title,
            className: classes.find(c => c.id === hw.classId)?.name || 'Unknown Class',
            dueDate: new Date(hw.dueDate).toISOString(),
            description: hw.description || '',
            links: hw.links || [],
            created_at: hw.created_at || new Date().toISOString(),
          }));

        if (incompleteHomeworks.length === 0) {
          setPriorityHomework(null);
          setIsLoading(false);
          return;
        }

        // Create a prompt for the AI
        const prompt = `Given the following list of incomplete homework assignments, please determine which one should be completed first based on due date, time needed, and importance. 
        Consider the following factors:
        1. Proximity to due date (sooner is higher priority)
        2. Estimated time to complete (shorter tasks might be good to knock out quickly)
        3. Class importance (prioritize core subjects)
        4. Any other relevant factors
        
        Here's the homework data in JSON format:
        ${JSON.stringify(incompleteHomeworks, null, 2)}
        
        Please respond with a JSON object in this exact format:
        {
          "id": "homework-id",
          "title": "Homework Title",
          "className": "Class Name",
          "dueDate": "ISO date string",
          "reason": "Brief explanation of why this should be done first",
          "priority": "high|medium|low"
        }`;

        // Get current date and time in ISO format
        const currentDateTime = new Date().toISOString();
        
        // Call the AI with Gemma 3n model
        const response = await chat([{ 
          role: 'user', 
          content: `Current date and time: ${currentDateTime}
          
Given the following list of incomplete homework assignments, please determine which one should be completed first based on due date, time needed, and importance. 
Consider the following factors:
1. Proximity to due date (sooner is higher priority, overdue is highest)
2. Estimated time to complete (shorter tasks might be good to knock out quickly)
3. Class importance (prioritize core subjects)
4. Any other relevant factors

If an assignment is overdue, please mark it as 'overdue' or 'most overdue' in the reason field.

Here's the homework data in JSON format:
${JSON.stringify(incompleteHomeworks, null, 2)}

Please respond with a JSON object in this exact format:
{
  "id": "homework-id",
  "title": "Homework Title",
  "className": "Class Name",
  "dueDate": "ISO date string",
  "reason": "Brief explanation of why this should be done first (include 'overdue' or 'most overdue' if applicable)",
  "priority": "high|medium|low"
}`
        }], 'gemma3n:latest');
        
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

  // Don't show anything if there are no incomplete homeworks
  if (homeworks.filter(hw => !hw.completed).length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6 border border-purple-100 dark:border-purple-900/50 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
            <h3 className="font-medium text-purple-900 dark:text-purple-100">Finding your top priority...</h3>
          </div>
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-4 bg-purple-100 dark:bg-purple-800/50 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-purple-100 dark:bg-purple-800/50 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Don't show anything if there's an error
  }

  // No priority homework found
  if (!priorityHomework) {
    return null;
  }

  // Determine icon and color based on priority
  const priorityConfig = {
    high: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800/50',
      textColor: 'text-red-900 dark:text-red-100',
    },
    medium: {
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800/50',
      textColor: 'text-amber-900 dark:text-amber-100',
    },
    low: {
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800/50',
      textColor: 'text-blue-900 dark:text-blue-100',
    },
  }[priorityHomework.priority];

  const PriorityIcon = priorityConfig.icon;
  const dueDate = new Date(priorityHomework.dueDate);
  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={cn(
      'rounded-xl p-4 mb-6 w-full max-w-2xl mx-auto shadow-sm border',
      priorityConfig.bgColor,
      priorityConfig.borderColor
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
        <div className="flex items-start space-x-2">
          <div className={`h-8 w-8 flex-shrink-0 ${priorityConfig.bgColor} rounded-full flex items-center justify-center`}>
            <PriorityIcon className={`h-4 w-4 ${priorityConfig.color}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {priorityHomework.className}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Due {formattedDueDate}
            </p>
          </div>
        </div>
        <div className="px-2 py-1 text-xs rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {priorityHomework.priority} priority
        </div>
      </div>
      
      <div className="mt-3">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 break-words">
          {priorityHomework.title}
        </h4>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">
          {priorityHomework.reason}
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
            <div className="mt-2 space-y-1">
              {parsedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-teal-600 hover:text-teal-800 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[200px]" title={link.title || link.url}>
                    {link.title || link.url}
                  </span>
                </a>
              ))}
            </div>
          );
        })()}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            AI Recommended
          </span>
        </div>
        <button className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          Start working
        </button>
      </div>
    </div>
  );
};

export default PriorityHomeworkCard;
