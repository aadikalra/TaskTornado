'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useAI } from '@/context/AIContext';
import { Clock, AlertTriangle, BookOpen, Loader2, GraduationCap, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icon-map';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/animate-ui/components/buttons/button';

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
  const { tests, classes, updateTest } = useClassContext();
  const { chat } = useAI();
  const { success } = useToast();
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

        // Filter out completed/missed tests and tests whose dates have passed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        const upcomingTests = tests
          .filter(test => {
            const testDate = new Date(test.testDate);
            testDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
            return test.status === 'upcoming' && testDate >= today;
          })
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

        // Get current date and time in ISO format
        const currentDateTime = new Date().toISOString();

        // Call the AI with Gemma 3n model
        const response = await chat([{
          role: 'user',
          content: `Current date and time: ${currentDateTime}

Given the following list of upcoming tests, please determine which one should be studied for first based on test date, test type, and importance.
Consider the following factors:
1. Proximity to test date (sooner is higher priority)
2. Test type (BETA tests and ALPHA quizzes are typically more important than regular quizzes)
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
  "testType": "ALPHA|BETA|Quiz|Other|exam|quiz|midterm|final|project|presentation",
  "reason": "Brief explanation of why this should be studied first",
  "priority": "high|medium|low"
}`
        }], 'gemma-3-12b-it');

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

  // Error state or no priority test found
  if (error || !priorityTest) {
    return null;
  }

  // Get the class icon
  const testClass = tests.find(t => t.id === priorityTest.id);
  const classData = testClass ? classes.find(c => c.id === testClass.classId) : null;
  const ClassIcon = classData?.icon ? (iconMap[classData.icon as keyof typeof iconMap] ?? GraduationCap) : GraduationCap;

  const testDate = new Date(priorityTest.testDate);
  const formattedTestDate = testDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleStartStudying = async () => {
    if (!testClass) return;

    try {
      await updateTest(testClass.id, { status: 'preparing' });
      success(`Test status updated to "Preparing" - ${priorityTest.title}`);
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <ClassIcon className="w-4 h-4 text-[#264f84] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {priorityTest.className}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 text-[#264f84] dark:text-blue-400" />
              <span>{priorityTest.testType} • {formattedTestDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-900">
          {(() => {
            const priorityConfig = {
              high: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
              medium: { icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
              low: { icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
            }[priorityTest.priority];
            
            const Icon = priorityConfig.icon;
            
            return (
              <>
                <Icon className={`w-3 h-3 ${priorityConfig.color}`} />
                <span className={`text-xs font-medium ${priorityConfig.color}`}>
                  {priorityTest.priority.charAt(0).toUpperCase() + priorityTest.priority.slice(1)}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">
            {priorityTest.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {priorityTest.reason}
          </p>
        </div>

        {/* Display study materials if available */}
        {priorityTest.studyMaterials && priorityTest.studyMaterials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {priorityTest.studyMaterials.slice(0, 3).map((material, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800"
              >
                📚 {material}
              </span>
            ))}
            {priorityTest.studyMaterials.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                +{priorityTest.studyMaterials.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3 text-[#264f84] dark:text-blue-400" />
          <span>AI Recommended</span>
        </div>
        <Button
          onClick={handleStartStudying}
          size="sm"
          className="text-xs bg-[#264f84] hover:bg-[#1f3f6b] dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Start Studying
        </Button>
      </div>
    </div>
  );
};

export default PriorityTestCard;
