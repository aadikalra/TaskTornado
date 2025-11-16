'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathContentProps {
  content: string;
  className?: string;
}

export function MathContent({ content, className = '' }: MathContentProps) {
  // Split content by LaTeX delimiters
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // This regex matches either \(...) or \[...]
  const regex = /(\\\(.*?\)|\\\[.*?\\\])/g;
  
  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    // Add the match
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        
        // Handle inline math: \(...)
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2);
          return <InlineMath key={i} math={math} />;
        }
        
        // Handle display math: \[...]
        if (part.startsWith('\\[')) {
          const math = part.slice(2, -2);
          return <BlockMath key={i} math={math} />;
        }
        
        // Regular text
        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </span>
  );
}
