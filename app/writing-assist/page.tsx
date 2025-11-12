'use client';

import dynamic from 'next/dynamic';

const LexicalEditor = dynamic(
  () => import('@/components/LexicalEditor'), 
  { ssr: false }
);

const WritingAssistPage = () => {
  return <LexicalEditor />;
};

export default WritingAssistPage;
