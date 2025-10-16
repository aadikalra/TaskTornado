'use client';

import { useSearch } from '@/context/SearchContext';
import { useClassContext } from '@/context/ClassContext';
import { Search } from 'lucide-react';
import Link from 'next/link';

export function SearchResults() {
  const { query, closeSearch } = useSearch();
  const { classes, homeworks } = useClassContext();

  if (!query.trim()) {
    return (
      <div className="mt-4 text-center text-gray-500">
        <Search className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2">Type to search homework</p>
      </div>
    );
  }

  const searchTerm = query.toLowerCase();
  
  // Filter homeworks that match the search query
  const filteredHomeworks = homeworks.filter(homework => 
    homework.title.toLowerCase().includes(searchTerm) || 
    homework.description?.toLowerCase().includes(searchTerm) ||
    classes.find(c => c.id === homework.classId)?.name.toLowerCase().includes(searchTerm)
  );

  if (filteredHomeworks.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p style={{padding: '20px'}}>No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {filteredHomeworks.map((homework) => {
          const classItem = classes.find(c => c.id === homework.classId);
          return (
            <li key={homework.id} className="py-3 hover:bg-gray-50">
              <Link 
                href={`/homework/${homework.id}`} 
                className="block px-4 py-2"
                onClick={closeSearch}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{homework.title}</h3>
                  {classItem && (
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: classItem.color ? `${classItem.color}20` : '#f3f4f6',
                        color: classItem.color || '#4b5563' 
                      }}
                    >
                      {classItem.name}
                    </span>
                  )}
                </div>
                {homework.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {homework.description}
                  </p>
                )}
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span>Due: {new Date(homework.dueDate).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
