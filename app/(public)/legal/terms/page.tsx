'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, BookOpen, Users, Shield, Target, Gamepad2, ExternalLink } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="relative min-h-screen bg-[#f8fbfd] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 max-w-4xl mx-auto">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-base">
            Last updated: August 19, 2025
          </p>
        </motion.div>

        {/* At a Glance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-12"
        >
          <div className="bg-[#ebf6b5]/30 dark:bg-sky-500/5 border border-[#d4e88e]/40 dark:border-sky-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-sky-900 dark:text-white">At a Glance</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { bold: 'Free to use:', rest: 'Core TaskTornado features are free for all students' },
                { bold: 'Your data stays yours:', rest: 'You own your assignments, grades, and academic information' },
                { bold: 'School-friendly:', rest: 'Designed to help, not interfere with your education' },
                { bold: 'No cheating:', rest: 'AI assistant helps you learn, doesn\'t do your work for you' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">
                    <strong className="text-sky-900 dark:text-white">{item.bold}</strong> {item.rest}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-12"
        >
          <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
            <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
              Welcome to TaskTornado! These terms outline your rights and responsibilities as a student using our
              academic productivity platform. We&apos;ve kept them straightforward and student-focused.
            </p>
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="space-y-10">

          {/* 1. Acceptance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">1. Acceptance of Terms</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                By using TaskTornado to organize your homework, track assignments, or get AI study help,
                you agree to these terms. If you don&apos;t agree, that&apos;s okay — just don&apos;t use the service.
              </p>
            </div>
          </motion.div>

          {/* 2. What TaskTornado Does */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">2. What TaskTornado Does</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">TaskTornado helps you stay on top of your schoolwork</p>
            <div className="space-y-3">
              {[
                { icon: BookOpen, label: 'Assignment Tracking', desc: 'Keep track of homework, projects, and test dates with smart reminders' },
                { icon: Target, label: 'Grade Management', desc: 'Monitor your academic progress and identify areas for improvement' },
                { icon: Shield, label: 'AI Aurora', desc: 'Get help with homework questions and study suggestions (not cheating!)' },
                { icon: Gamepad2, label: 'Study Break Games', desc: 'Unlock brain-training games when you keep up with your homework' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-0.5">{item.label}</h3>
                      <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 3. Your Account */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">3. Your Account</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">What you&apos;re responsible for</p>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <div className="space-y-2.5">
                {[
                  'Keep your password secret and don\'t share your account',
                  'Use your real school information (we don\'t sell it, promise)',
                  'You\'re responsible for what happens on your account',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                    <span className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 4. Using Responsibly */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">4. Using TaskTornado Responsibly</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">To keep TaskTornado helpful for everyone</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Be honest about your assignments and grades',
                'Don\'t use the AI to cheat on tests or homework',
                'Respect other students using the platform',
                'Don\'t try to break or hack the system',
                'Use it to help your learning, not replace it',
                'Follow your school\'s academic honesty policies',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                  <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                  <span className="text-xs text-sky-800 dark:text-sky-200 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 5. Who Owns What */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">5. Who Owns What</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-2">Your Content</h3>
                <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed mb-1.5">
                  You own all your assignments, grades, and study materials. We don&apos;t claim any rights to your schoolwork.
                </p>
                <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">
                  You can download or delete your data at any time.
                </p>
              </div>
              <div className="bg-[#ebf6b5]/30 dark:bg-sky-500/5 border border-[#d4e88e]/40 dark:border-sky-500/10 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-2">Our Content</h3>
                <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">
                  The TaskTornado platform, features, and design are our property. Please don&apos;t copy, modify, or redistribute them.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 6. Important Disclaimers */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">6. Important Disclaimers</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <div className="space-y-2.5">
                {[
                  'TaskTornado is a tool to help you stay organized — not guarantee academic success',
                  'AI assistant may make mistakes — always double-check important information',
                  'We\'re not responsible for grades, test scores, or school outcomes',
                  'Service may occasionally be down for maintenance or technical issues',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-100 dark:bg-amber-500/15 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    </div>
                    <span className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 7. Changes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">7. Changes to These Terms</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                We might update these terms as TaskTornado grows and improves. We&apos;ll update the date at the top
                when we do. Continuing to use the service means you accept the new terms.
              </p>
            </div>
          </motion.div>

          {/* 8. Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="pt-8 border-t border-sky-100 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">8. Questions About These Terms?</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-6">
              If you have questions about these terms or how TaskTornado works
            </p>
            <a
              href="https://forms.gle/wjR1nJdg8vFYeNcd6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#275085] dark:bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            >
              Ask a Question
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
