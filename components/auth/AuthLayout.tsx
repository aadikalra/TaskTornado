'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, linkText, linkHref, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FBF9] overflow-x-hidden font-sans">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E6F5D8] via-[#F8FBF9] to-[#F8FBF9] -z-10" />
      
      <main className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-teal-800 px-8 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          
          {/* Form Container */}
          <div className="p-8">
            <p className="text-gray-600 text-center mb-8">
              {subtitle}{' '}
              <Link 
                href={linkHref} 
                className="font-medium text-teal-700 hover:text-teal-800 transition-colors"
              >
                {linkText}
              </Link>
            </p>
            
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
