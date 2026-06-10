'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => (
            <p className="text-current leading-relaxed" {...props} />
          ),
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
                  'rounded bg-muted dark:bg-muted/50 px-1.5 py-0.5 font-mono text-sm text-current',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-current" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold text-current mt-4 mb-2 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold text-current mt-3 mb-1.5 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-bold text-current mt-2.5 mb-1 first:mt-0" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-bold text-current mt-2 mb-1 first:mt-0" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-current font-semibold underline underline-offset-4 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-1 text-current marker:text-current/60" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-1 text-current marker:text-current/60" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-current/20 pl-4 text-current italic bg-current/5 rounded-r-md py-1 my-2"
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