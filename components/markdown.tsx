'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = className && match;
            return isBlock ? (
              <div className="bg-gray-900 dark:bg-gray-800 rounded-md p-4 my-4 overflow-auto border border-gray-700">
                <code
                  className={cn('text-sm font-mono text-gray-100', className)}
                  {...props}
                >
                  {children}
                </code>
              </div>
            ) : (
              <code
                className={cn(
                  'rounded bg-muted dark:bg-muted/50 px-1.5 py-0.5 font-mono text-sm text-foreground',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-1 text-foreground" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-1 text-foreground" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/20 dark:border-muted-foreground/30 pl-4 text-muted-foreground italic bg-muted/20 dark:bg-muted/10 rounded-r-md"
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}