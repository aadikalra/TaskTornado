'use client';

'use client';

import { useParams } from 'next/navigation';
import { useClassContext } from '@/context/ClassContext';
import type { Test as TestType } from '@/context/ClassContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';

type StudyMaterial = string | { url: string; title?: string };
type Test = Omit<TestType, 'studyMaterials'> & {
  studyMaterials: StudyMaterial[];
};

export default function TestDetailPage() {
  const { id } = useParams() as { id: string };
  const { tests, classes } = useClassContext();
  const [test, setTest] = useState<Test | null>(null);
  const [classItem, setClassItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testItem = tests.find(t => t.id === id);
    setTest(testItem || null);
    
    if (testItem) {
      const cls = classes.find(c => c.id === testItem.classId);
      setClassItem(cls || null);
    } else {
      setClassItem(null);
    }
    setLoading(false);
  }, [id, tests, classes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Test not found</h1>
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{test.title}</h1>
              {classItem && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2"
                  style={{
                    backgroundColor: classItem.color ? `${classItem.color}20` : '#f3f4f6',
                    color: classItem.color || '#4b5563',
                    border: `1px solid ${classItem.color ? `${classItem.color}33` : '#e5e7eb'}`
                  }}
                >
                  {classItem.name}
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(test.testDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {test.testTime && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="mr-2 h-4 w-4" />
                  {test.testTime}
                </div>
              )}
              {test.testType && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {test.testType}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test Details</h2>
          {test.description ? (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{test.description}</p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No additional details provided.</p>
          )}

          {/* Study Materials Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Study Materials</h3>
            {test.studyMaterials && test.studyMaterials.length > 0 ? (
              <ul className="space-y-2">
                {test.studyMaterials.map((material, index) => {
                  // Handle both string URLs and object with url/title
                  const url = typeof material === 'string' ? material : material.url;
                  const title = (typeof material === 'object' && material.title) 
                    ? material.title 
                    : `Study Material ${index + 1}`;
                  
                  return (
                    <li key={index} className="flex items-center">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        {title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No study materials provided.</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Link href="/tests">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
          </Link>
          <div className="space-x-2">
            <Link href={`/tests/edit/${test.id}`}>
              <Button variant="outline">Edit Test</Button>
            </Link>
            <Link href={`/tests/study/${test.id}`}>
              <Button>Study Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
