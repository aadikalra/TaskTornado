'use client';

import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

const WritingAssistPage = () => {
  return <TiptapEditor />;
};

export default WritingAssistPage;
