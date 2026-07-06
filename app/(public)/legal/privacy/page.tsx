'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertCircle, ExternalLink, Server, Cpu, Globe, Cookie } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    items: [
      { label: 'Account Information', desc: 'Name, email address, and account type (student or guardian) for login and profile. Passwords (if applicable) are managed securely by our authentication provider — we never store raw passwords.' },
      { label: 'Academic Information', desc: 'Classes, assignments, test dates, grades, flashcard decks, quiz data, and web saves you create or import from Google Classroom.' },
      { label: 'AI Interaction Data', desc: 'Prompts you send to Aurora (our AI assistant), including any homework context or selected text. These are sent to Google Gemini for processing and are not stored by TaskTornado.' },
      { label: 'Social and Collaborative Data', desc: 'Discussion board posts, group chat messages, and study group membership you choose to participate in.' },
      { label: 'Guardian-Linked Data', desc: 'If you link a guardian account, your guardian can view your homework, tests, grades, and class information through a read-only dashboard.' },
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    list: [
      'Provide and maintain the TaskTornado platform',
      'Power AI-assisted features like Aurora, flashcard generation, and quiz creation',
      'Import assignments from Google Classroom when you connect your account',
      'Enable guardian accounts to view linked student academic progress',
      'Enforce rate limits and protect against abuse',
      'Comply with legal obligations',
    ],
  },
  {
    icon: Lock,
    title: '3. Data Security',
    description: 'We implement industry-appropriate security measures to protect your data. Your information is protected by the security infrastructure of our hosting and database providers.',
    subsections: [
      {
        label: 'Transport Security',
        items: [
          'All data transmitted between your browser and our servers is encrypted via HTTPS (TLS)',
          'Authentication tokens are securely managed via cookies with appropriate expiration policies',
          'Security headers (X-Frame-Options, X-Content-Type-Options) are enforced on all responses',
        ],
      },
      {
        label: 'Application Security',
        items: [
          'Rate limiting on AI requests to prevent abuse and unauthorized access',
          'Row-Level Security (RLS) policies on all database tables via Supabase',
          'AI prompts are processed in real-time and not stored by TaskTornado after the response is generated',
          'Restricted access controls for beta access management',
        ],
      },
    ],
  },
];

const retentionItems = [
  'Academic data (homework, tests, grades): Persists until you manually delete items or delete your account',
  'Account information: Deleted when you use the Delete Account feature in Settings',
  'AI assistant conversations: Not stored by TaskTornado — subject to Google Gemini\'s data retention policies',
  'Analytics data: Handled by Vercel Analytics according to their retention schedule',
];

const rights = [
  'Access the personal information we hold about you',
  'Request correction of inaccurate personal information',
  'Request deletion of your personal information',
  'Object to or restrict processing of your personal information',
  'Request transfer of your personal information',
  'Withdraw consent where we rely on consent to process your information',
];

const cookieItems = [
  'Authentication: Supabase session cookies to keep you logged in',
  'Preferences: Settings such as theme (dark/light mode), dyslexic font, and layout preferences stored in cookies and localStorage',
  'Rate Limiting: Cookies that track AI usage counts to enforce daily limits',
];

const thirdPartyServices = [
  {
    name: 'Supabase',
    role: 'Database, authentication, and file storage',
    data: 'All account data, academic records, social features, and guardian links',
    link: 'https://supabase.com/privacy',
  },
  {
    name: 'Google Gemini (AI Studio)',
    role: 'AI-powered features (Aurora assistant, flashcard generation, quiz creation, writing assist)',
    data: 'Prompts containing homework questions, class context, or selected text sent for AI processing',
    link: 'https://ai.google.dev/terms',
  },
  {
    name: 'Google OAuth',
    role: 'Optional "Continue with Google" sign-in',
    data: 'Email, name, and profile information during the authentication flow',
    link: 'https://policies.google.com/privacy',
  },
  {
    name: 'Google Classroom API',
    role: 'Optional import of courses and assignments',
    data: 'Course names, assignment titles, due dates, and grades — only when you explicitly connect your Classroom account',
    link: 'https://edu.google.com/intl/ALL_us/workspace-for-education/privacy/',
  },
  {
    name: 'Vercel',
    role: 'Hosting and web analytics',
    data: 'Page views, performance metrics (Core Web Vitals), and IP addresses at the infrastructure level',
    link: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Google Fonts',
    role: 'Typography (Geist, Inter, Nunito Sans)',
    data: 'IP address is visible to Google when fonts are loaded by your browser',
    link: 'https://policies.google.com/privacy',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen bg-[#f8fbfd] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
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
            Privacy Policy
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-base">
            Last updated: March 7, 2026
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
                <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-sky-900 dark:text-white">At a Glance</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { bold: 'Your data stays yours:', rest: 'Your academic data persists until you manually delete it or delete your account' },
                { bold: 'AI queries are ephemeral:', rest: 'TaskTornado does not store AI conversations — prompts are processed by Google Gemini and not retained by us' },
                { bold: 'Guardian visibility:', rest: 'If you link a guardian, they can view your homework, tests, and grades through a read-only dashboard' },
                { bold: 'No ads, no data selling:', rest: 'We use Vercel Analytics for basic page-view metrics — no advertising trackers or data brokers' },
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
              At TaskTornado, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              and protect your personal information when you use our student productivity platform. We believe in
              transparency — every third-party service that handles your data is explicitly named below.
            </p>
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="space-y-10">
          {/* Section 1 — Information We Collect */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">1. Information We Collect</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">We collect the following types of information</p>
            <div className="space-y-3">
              {sections[0].items!.map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                  <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    {i === 0 && <UserCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                    {i === 1 && <Database className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                    {i === 2 && <Cpu className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                    {i === 3 && <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                    {i === 4 && <Eye className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-0.5">{item.label}</h3>
                    <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 2 — How We Use Your Information */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">2. How We Use Your Information</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">We use your information to</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {sections[1].list!.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                  <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                  <span className="text-sm text-sky-800 dark:text-sky-200">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 3 — Data Security */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">3. Data Security</h2>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/40 mb-5 leading-relaxed">
              We implement industry-appropriate security measures to protect your data. Your information is secured by the combined infrastructure of our hosting and database providers.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {sections[2].subsections!.map((sub, si) => (
                <div key={si} className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                  <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-3">{sub.label}</h3>
                  <div className="space-y-2">
                    {sub.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                        <span className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 4 — Data Retention */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">4. Data Retention</h2>
            <div className="space-y-0">
              {retentionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-3.5 border-b border-sky-100 dark:border-gray-800 px-1">
                  <div className="w-6 h-6 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full" />
                  </div>
                  <span className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#ebf6b5]/30 dark:bg-sky-500/5 border border-[#d4e88e]/40 dark:border-sky-500/10 rounded-2xl px-5 py-4">
              <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-1">Your Control</h3>
              <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">
                You can delete individual assignments, flashcard decks, web saves, and other content at any time. You can also permanently delete your entire account through Settings, which removes all associated data.
              </p>
            </div>
          </motion.div>

          {/* Section 5 — Your Rights */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">5. Your Rights</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">You have the right to</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {rights.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                  <div className="w-5 h-5 bg-sky-100 dark:bg-sky-500/15 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                  </div>
                  <span className="text-xs text-sky-800 dark:text-sky-200 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 6 — Cookies */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">6. Cookies and Local Storage</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-3">Cookies We Use</h3>
                <div className="space-y-2">
                  {cookieItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                      <span className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-3">Analytics</h3>
                <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed mb-2">We use Vercel Analytics for basic, privacy-friendly metrics:</p>
                <div className="space-y-2">
                  {[
                    'Page views and navigation patterns',
                    'Core Web Vitals (loading speed, interactivity)',
                    'No advertising tracking, fingerprinting, or data selling',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 shrink-0" />
                      <span className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 7 — Third-Party Services */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">7. Third-Party Services</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-5">
              The following services process your data on our behalf. Each has its own privacy policy governing data handling.
            </p>
            <div className="space-y-3">
              {thirdPartyServices.map((service, i) => (
                <div key={i} className="px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-sky-100 dark:bg-sky-500/15 rounded-lg flex items-center justify-center shrink-0">
                        <Server className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                      </div>
                      <h3 className="text-sm font-bold text-sky-900 dark:text-white">{service.name}</h3>
                    </div>
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors shrink-0"
                    >
                      Privacy Policy ↗
                    </a>
                  </div>
                  <p className="text-[11px] text-sky-600/60 dark:text-sky-400/50 mb-0.5 font-medium">{service.role}</p>
                  <p className="text-xs text-sky-600/40 dark:text-sky-400/30 leading-relaxed">{service.data}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 8 — Children's Privacy */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">8. Children&apos;s Privacy</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If we learn that we have collected personal information from a
                child under 13, we will take steps to delete that information as soon as possible.
              </p>
            </div>
          </motion.div>

          {/* Section 9 — Changes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">9. Changes to This Policy</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this policy.
              </p>
            </div>
          </motion.div>

          {/* Section 10 — Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="pt-8 border-t border-sky-100 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">10. Contact Us</h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40 mb-6">
              For privacy-related inquiries, please use our support channels
            </p>
            <a
              href="https://forms.gle/wjR1nJdg8vFYeNcd6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#275085] dark:bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            >
              Send Privacy Inquiry
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
