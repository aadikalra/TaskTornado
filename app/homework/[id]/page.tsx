'use client';

import { useParams } from 'next/navigation';
import { useClassContext, type Homework, type Class } from '@/context/ClassContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomeworkDetailPage() {
  const { id } = useParams() as { id: string };
  const { homeworks, classes } = useClassContext();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [classItem, setClassItem] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hw = homeworks.find(h => h.id === id);
    setHomework(hw || null);
    
    if (hw) {
      const cls = classes.find(c => c.id === hw.classId);
      setClassItem(cls || null);
    } else {
      setClassItem(null);
    }
    setLoading(false);
  }, [id, homeworks, classes]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!homework) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Homework not found</h1>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{homework.title}</h1>
            {classItem && (
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2"
                style={{ 
                  backgroundColor: classItem.color ? `${classItem.color}20` : '#f3f4f6',
                  color: classItem.color || '#4b5563' 
                }}
              >
                {classItem.name}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Due Date</div>
            <div className="font-medium">
              {new Date(homework.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        {homework.description ? (
          <p className="text-gray-700 whitespace-pre-line">{homework.description}</p>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Add more details as needed */}
      <div className="flex justify-end">
        <Link href="/">
          <Button variant="outline" className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href={`/homework/edit/${homework.id}`}>
          <Button>Edit Homework</Button>
        </Link>
      </div>
    </div>
  );
}
