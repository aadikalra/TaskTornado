'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertCircle, ExternalLink } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    items: [
      { label: 'Account Information', desc: 'Name, email address, and password for your TaskTornado account login and profile' },
      { label: 'Academic Information', desc: 'Classes, assignments, test dates, and grades you enter for scheduling and AI-powered homework recommendations' },
      { label: 'Usage Data', desc: 'How you interact with TaskTornado features like homework tracking, test scheduling, and AI assistant usage' },
      { label: 'Device Information', desc: 'IP address, browser type, and operating system' },
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    list: [
      'Provide and maintain our Service',
      'Improve and personalize your experience',
      'Communicate with you about your account and our services',
      'Analyze usage patterns and trends',
      'Ensure the security of our Service',
      'Comply with legal obligations',
    ],
  },
  {
    icon: Lock,
    title: '3. Data Security',
    description: 'We implement comprehensive security measures to protect your academic data and personal information. Your school-related information is never shared with third parties, parents, or educational institutions.',
    subsections: [
      {
        label: 'Technical Security',
        items: [
          'End-to-end encryption of data in transit using SSL/TLS',
          'Secure password storage with industry-standard bcrypt hashing',
          'Regular security audits and vulnerability assessments',
          'Strict access controls and multi-factor authentication for admin access',
        ],
      },
      {
        label: 'Protection Measures',
        items: [
          'Rate limiting to prevent unauthorized access attempts',
          '24/7 security monitoring and threat detection',
          'AI assistant queries processed temporarily and deleted immediately',
          'No sharing of academic data with schools, parents, or third parties',
        ],
      },
    ],
  },
];

const retentionItems = [
  'Assignment data: Remains until you delete your account or remove individual assignments',
  'Account information: Deleted within 30 days of account deletion',
  'AI assistant queries: Processed temporarily and deleted immediately after response',
  'Usage analytics: Aggregated and anonymized after 90 days',
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
  'Authentication: Keeps you logged in to your TaskTornado account',
  'Preferences: Remembers your settings like AI personality and layout preferences',
  'Security: Helps protect your account from unauthorized access',
];

const analyticsItems = [
  'Feature usage (which tools you use most)',
  'Performance metrics (loading times, errors)',
  'No advertising tracking or data selling',
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
                <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-sky-900 dark:text-white">At a Glance</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { bold: 'Your data stays yours:', rest: 'Assignment data remains until you delete your account or remove individual assignments' },
                { bold: 'School-focused privacy:', rest: 'We never share your academic data with schools, parents, or third parties' },
                { bold: 'Minimal tracking:', rest: 'Only basic analytics to improve TaskTornado, no advertising or data selling' },
                { bold: 'AI-powered features:', rest: 'Your homework questions are processed temporarily for AI assistance, then deleted' },
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
              and protect your personal information when you use our student productivity platform.
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
                    {i === 2 && <Eye className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                    {i === 3 && <AlertCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
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
              We implement comprehensive security measures to protect your academic data. Your school-related information is never shared with third parties.
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
                You can delete individual assignments, export your data at any time, or delete your entire account to remove all personal information permanently.
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
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">6. Cookies and Tracking</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-3">Essential Cookies</h3>
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
                <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed mb-2">We use minimal analytics to improve TaskTornado:</p>
                <div className="space-y-2">
                  {analyticsItems.map((item, i) => (
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
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-5">7. Third-Party Services</h2>
            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl px-5 py-4">
              <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                We may use third-party services to help us operate our business and the Service, such as hosting
                providers, analytics providers, and customer support services. These third parties have access to
                your personal information only to perform these tasks on our behalf and are obligated not to
                disclose or use it for any other purpose.
              </p>
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
