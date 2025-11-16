'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      startup?: {
        promise: Promise<void>;
        defaultPageReady?: () => Promise<void>;
      };
      typeset?: (elements?: HTMLElement[]) => void;
      tex?: {
        inlineMath: string[][];
        displayMath: string[][];
        processEscapes: boolean;
        processEnvironments: boolean;
        autoload?: {
          [key: string]: any[];
        };
        packages?: {
          '[+]'?: string[];
        };
      };
      options?: {
        skipHtmlTags: string[];
        ignoreHtmlClass: string;
        processHtmlClass?: string;
        [key: string]: any;
      };
      loader?: {
        load?: string[];
        [key: string]: any;
      };
    };
  }
}

interface LaTeXMathMLRendererProps {
  content: string;
  className?: string;
}

export function LaTeXMathMLRenderer({ content, className = '' }: LaTeXMathMLRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMathJaxReady, setIsMathJaxReady] = useState(false);

  // Initialize MathJax
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMathJax = () => {
      if (!window.MathJax) {
        // Load MathJax
        const script = document.createElement('script');
        script.id = 'MathJax-script';
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        
        script.onload = () => {
          // Configure MathJax
          window.MathJax = {
            ...window.MathJax,
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true,
              processEnvironments: true,
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
              ignoreHtmlClass: '.*|',
            }
          };
          
          // Simple typeset function if startup isn't available
          if (!window.MathJax.typeset) {
            window.MathJax.typeset = () => {
              if (window.MathJax.typesetPromise) {
                return window.MathJax.typesetPromise();
              }
            };
          }
          
          setIsMathJaxReady(true);
        };

        document.head.appendChild(script);
      } else {
        setIsMathJaxReady(true);
      }
    };

    initMathJax();

    return () => {
      const script = document.getElementById('MathJax-script');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Process and render LaTeX content
  useEffect(() => {
    if (!isMathJaxReady || !containerRef.current) return;

    const processMathJax = async () => {
      if (!containerRef.current) return;
      
      try {
        // Process the content to handle both $$...$$ and $...$ delimiters
        let processedContent = content
          .replace(/\$\$([^$]+)\$\$/g, (_, eq) => `\\[${eq}\\]`)
          .replace(/(?<!\\)\$([^$\n]+)\$/g, (_, eq) => `\\(${eq}\\)`);
        
        // Store the processed content
        containerRef.current.innerHTML = processedContent;
        
        // Wait a tick to ensure the DOM is updated
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Configure MathJax if it exists
        if (window.MathJax) {
          // Ensure MathJax is properly configured
          window.MathJax = {
            ...window.MathJax,
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true,
              processEnvironments: true,
              autoload: {
                color: [],
                colorV2: ['color']
              },
              packages: {'[+]': ['noerrors']}
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
              ignoreHtmlClass: '.*|',
              processHtmlClass: 'mathjax-process'
            },
            loader: {load: ['[tex]/noerrors']}
          };
          
          // Add the mathjax-process class to our container
          containerRef.current.classList.add('mathjax-process');
          
          // Typeset the content
          if (window.MathJax.typesetPromise) {
            await window.MathJax.typesetPromise([containerRef.current]);
          } else if (window.MathJax.typeset) {
            window.MathJax.typeset();
          }
        }
      } catch (error) {
        console.error('Error processing MathJax:', error);
      }
    };

    processMathJax();
  }, [content, isMathJaxReady]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
