'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useAI } from '@/context/AIContext';
import { Sparkles, Clock, AlertTriangle, BookOpen, Loader2, GraduationCap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityTest {
  id: string;
  title: string;
  className: string;
  testDate: string;
  testType: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  studyMaterials?: string[];
}

const PriorityTestCard = () => {
  const { tests, classes } = useClassContext();
  const { chat } = useAI();
  const [priorityTest, setPriorityTest] = useState<PriorityTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Create a unique key for localStorage based on the current tests
  const testsKey = useMemo(() => {
    const upcomingIds = tests
      .filter(test => test.status === 'upcoming')
      .map(test => test.id)
      .sort()
      .join(',');
    return `priority_test_${upcomingIds}`;
  }, [tests]);

  // Check if we need to update the cached result
  const needsUpdate = useCallback((cached: { timestamp: number } | null) => {
    if (!cached) return true;
    // Update if cache is older than 1 hour
    return Date.now() - cached.timestamp > 60 * 60 * 1000;
  }, []);

  // Load from cache on mount and when tests change
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;

    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(testsKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!needsUpdate(parsed)) {
            setPriorityTest(parsed.data);
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
  }, [testsKey, needsUpdate]);

  // Fetch and cache priority test
  useEffect(() => {
    if (lastUpdated === 0) return; // Skip initial render

    const determinePriorityTest = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Filter out completed/missed tests and format them for the AI
        const upcomingTests = tests
          .filter(test => test.status === 'upcoming')
          .map(test => ({
            id: test.id,
            title: test.title,
            className: classes.find(c => c.id === test.classId)?.name || 'Unknown Class',
            testDate: new Date(test.testDate).toISOString(),
            testType: test.testType,
            description: '', // tests don't have descriptions in the same way
            studyMaterials: test.studyMaterials || [],
            created_at: new Date().toISOString(),
          }));

        if (upcomingTests.length === 0) {
          setPriorityTest(null);
          setIsLoading(false);
          return;
        }

        // Create a prompt for the AI
        const prompt = `Given the following list of upcoming tests, please determine which one should be studied for first based on test date, test type, and importance.

        Consider the following factors:
        1. Proximity to test date (sooner is higher priority, overdue is highest)
        2. Test type (finals and midterms are typically more important than quizzes)
        3. Class importance (prioritize core subjects)
        4. Study materials available (tests with more study materials might need more time)
        5. Any other relevant factors

        Here's the test data in JSON format:
        ${JSON.stringify(upcomingTests, null, 2)}

        Please respond with a JSON object in this exact format:
        {
          "id": "test-id",
          "title": "Test Title",
          "className": "Class Name",
          "testDate": "ISO date string",
          "testType": "exam|quiz|midterm|final|project|presentation",
          "reason": "Brief explanation of why this should be studied first",
          "priority": "high|medium|low"
        }`;

        // Get current date and time in ISO format
        const currentDateTime = new Date().toISOString();

        // Call the AI with Gemma 3n model
        const response = await chat([{
          role: 'user',
          content: `Current date and time: ${currentDateTime}

Given the following list of upcoming tests, please determine which one should be studied for first based on test date, test type, and importance.
Consider the following factors:
1. Proximity to test date (sooner is higher priority, overdue is highest)
2. Test type (finals and midterms are typically more important than quizzes)
3. Class importance (prioritize core subjects)
4. Study materials available (tests with more study materials might need more time)
5. Any other relevant factors

If a test is overdue, please mark it as 'overdue' or 'most overdue' in the reason field.

Here's the test data in JSON format:
${JSON.stringify(upcomingTests, null, 2)}

Please respond with a JSON object in this exact format:
{
  "id": "test-id",
  "title": "Test Title",
  "className": "Class Name",
  "testDate": "ISO date string",
  "testType": "exam|quiz|midterm|final|project|presentation",
  "reason": "Brief explanation of why this should be studied first (include 'overdue' or 'most overdue' if applicable)",
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
          const newPriorityTest = {
            id: result.id,
            title: result.title,
            className: result.className,
            testDate: result.testDate,
            testType: result.testType,
            reason: result.reason,
            priority: result.priority || 'medium' as const
          };

          // Save to cache
          if (typeof window !== 'undefined') {
            const cacheData = {
              data: newPriorityTest,
              timestamp: Date.now()
            };

            try {
              localStorage.setItem(testsKey, JSON.stringify(cacheData));
            } catch (err) {
              console.error('Error saving to cache:', err);
            }
          }

          setPriorityTest(newPriorityTest);
        } catch (e) {
          console.error('Error parsing AI response:', e, 'Response:', response);
          throw new Error('Failed to parse AI response. The AI might not have returned valid JSON.');
        }
      } catch (err) {
        console.error('Error determining priority test:', err);
        setError('Failed to determine priority test');
      } finally {
        setIsLoading(false);
      }
    };

    determinePriorityTest();
  }, [tests, classes, chat, testsKey, lastUpdated]);

  // Don't show anything if there are no upcoming tests
  if (tests.filter(test => test.status === 'upcoming').length === 0) {
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
            <h3 className="font-medium text-purple-900 dark:text-purple-100">Finding your top test priority...</h3>
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

  // No priority test found
  if (!priorityTest) {
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
  }[priorityTest.priority];

  const PriorityIcon = priorityConfig.icon;
  const testDate = new Date(priorityTest.testDate);
  const formattedTestDate = testDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Get test type icon
  const getTestTypeIcon = (testType: string) => {
    switch (testType.toLowerCase()) {
      case 'exam':
      case 'final':
      case 'midterm':
        return GraduationCap;
      case 'quiz':
        return BookOpen;
      case 'project':
        return Calendar;
      case 'presentation':
        return Calendar;
      default:
        return BookOpen;
    }
  };

  const TestTypeIcon = getTestTypeIcon(priorityTest.testType);

  return (
    <div className={cn(
      'rounded-xl p-4 mb-6 w-full max-w-2xl mx-auto shadow-sm border',
      priorityConfig.bgColor,
      priorityConfig.borderColor
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
        <div className="flex items-start space-x-2">
          <div className={`h-8 w-8 flex-shrink-0 ${priorityConfig.bgColor} rounded-full flex items-center justify-center`}>
            <TestTypeIcon className={`h-4 w-4 ${priorityConfig.color}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {priorityTest.className}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {priorityTest.testType} • {formattedTestDate}
            </p>
          </div>
        </div>
        <div className="px-2 py-1 text-xs rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {priorityTest.priority} priority
        </div>
      </div>

      <div className="mt-3">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 break-words">
          {priorityTest.title}
        </h4>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">
          {priorityTest.reason}
        </div>

        {/* Display study materials if available */}
        {priorityTest.studyMaterials && priorityTest.studyMaterials.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            📚 Study topics: {priorityTest.studyMaterials.slice(0, 3).join(', ')}
            {priorityTest.studyMaterials.length > 3 && ` +${priorityTest.studyMaterials.length - 3} more`}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            AI Recommended
          </span>
        </div>
        <button className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          Start studying
        </button>
      </div>
    </div>
  );
};

export default PriorityTestCard;
