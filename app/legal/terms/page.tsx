'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen, Users, Shield, Target, Gamepad2, ExternalLink } from 'lucide-react';
import { useWideLayout } from '@/hooks/use-wide-layout';

export default function TermsOfService() {
  const { getContainerClass } = useWideLayout();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass() + ' py-16'}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Link 
            href="/signup" 
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign Up
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: August 19, 2025
          </p>
        </motion.div>

        {/* At a Glance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">At a Glance</h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>Free to use:</strong> Core TaskTornado features are free for all students</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>Your data stays yours:</strong> You own your assignments, grades, and academic information</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>School-friendly:</strong> Designed to help, not interfere with your education</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>No cheating:</strong> AI assistant helps you learn, doesn't do your work for you</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to TaskTornado! These terms outline your rights and responsibilities as a student using our 
              academic productivity platform. We've kept them straightforward and student-focused.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Acceptance of Terms */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using TaskTornado to organize your homework, track assignments, or get AI study help, 
                you agree to these terms. If you don't agree, that's okay - just don't use the service.
              </p>
            </div>
          </motion.section>

          {/* Description of Service */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                2. What TaskTornado Does
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              TaskTornado helps you stay on top of your schoolwork with these features:
            </p>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Assignment Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keep track of homework, projects, and test dates with smart reminders</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Grade Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your academic progress and identify areas for improvement</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">AI Study Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get help with homework questions and study suggestions (not cheating!)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <Gamepad2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Study Break Games</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unlock brain-training games when you keep up with your homework</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* User Accounts */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                3. Your Account
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">What You're Responsible For</h3>
                <ul className="space-y-2">
                  {[
                    'Keep your password secret and don\'t share your account',
                    'Use your real school information (we don\'t sell it, promise)',
                    'You\'re responsible for what happens on your account'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* User Responsibilities */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                4. Using TaskTornado Responsibly
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">To keep TaskTornado helpful for everyone, please:</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Be honest about your assignments and grades',
                  "Don't use the AI to cheat on tests or homework",
                'Respect other students using the platform',
                "Don't try to break or hack the system",
                'Use it to help your learning, not replace it',
                'Follow your school\'s academic honesty policies'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Intellectual Property */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              5. Who Owns What
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Content</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  You own all your assignments, grades, and study materials. We don't claim any rights to your schoolwork.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You can download or delete your data at any time.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Our Content</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  The TaskTornado platform, features, and design are our property. Please don't copy, modify, or redistribute them.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              6. Important Disclaimers
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-100 dark:border-amber-900/50">
              <ul className="space-y-3">
                {[
                  'TaskTornado is a tool to help you stay organized - not guarantee academic success',
                  'AI assistant may make mistakes - always double-check important information',
                  'We\'re not responsible for grades, test scores, or school outcomes',
                  'Service may occasionally be down for maintenance or technical issues'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Changes to Terms */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              7. Changes to These Terms
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We might update these terms as TaskTornado grows and improves. We'll update the date at the top 
                when we do. Continuing to use the service means you accept the new terms.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              8. Questions About These Terms?
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              If you have questions about these terms or how TaskTornado works:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors group"
              >
                Ask a Question
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                Report an Issue
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
