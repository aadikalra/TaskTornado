'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

interface DictionaryPopupProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({ word, isOpen, onClose }) => {
  const [dictionaryData, setDictionaryData] = React.useState<any>(null);
  const [dictionaryLoading, setDictionaryLoading] = React.useState(false);
  const [dictionaryError, setDictionaryError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && word) {
      fetchDictionary(word);
    }
  }, [isOpen, word]);

  const fetchDictionary = async (word: string) => {
    setDictionaryLoading(true);
    setDictionaryError(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      const data = await response.json();
      setDictionaryData(data);
    } catch (error) {
      setDictionaryError('Definition not found for this word');
    } finally {
      setDictionaryLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dictionary: {word}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {dictionaryLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading definition...</p>
                </div>
              )}

              {dictionaryError && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">{dictionaryError}</p>
                </div>
              )}

              {dictionaryData && !dictionaryLoading && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {dictionaryData.map((entry: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{entry.word}</h4>
                        {entry.phonetic && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">/{entry.phonetic}/</span>
                        )}
                      </div>
                      
                      {entry.meanings?.map((meaning: any, meaningIndex: number) => (
                        <div key={meaningIndex} className="mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded mb-2">
                            {meaning.partOfSpeech}
                          </span>
                          
                          {meaning.definitions?.map((def: any, defIndex: number) => (
                            <div key={defIndex} className="mb-2">
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {defIndex + 1}. {def.definition}
                              </p>
                              {def.example && (
                                <p className="text-gray-500 dark:text-gray-400 text-xs italic mt-1">
                                  Example: "{def.example}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
