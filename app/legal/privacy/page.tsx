'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { useWideLayout } from '@/hooks/use-wide-layout';

export default function PrivacyPolicy() {
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
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
              Privacy Policy
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
                <span><strong>Your data stays yours:</strong> Assignment data remains until you delete your account or remove individual assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>School-focused privacy:</strong> We never share your academic data with schools, parents, or third parties</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>Minimal tracking:</strong> Only basic analytics to improve TaskTornado, no advertising or data selling</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>AI-powered features:</strong> Your homework questions are processed temporarily for AI assistance, then deleted</span>
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
              At TaskTornado, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our student productivity platform.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Information We Collect */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">We collect the following types of information:</p>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <UserCheck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Account Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name, email address, and password for your TaskTornado account login and profile</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <Database className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Academic Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classes, assignments, test dates, and grades you enter for scheduling and AI-powered homework recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Usage Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">How you interact with TaskTornado features like homework tracking, test scheduling, and AI assistant usage</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mt-0.5">
                  <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Device Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">IP address, browser type, and operating system</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How We Use Your Information */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                2. How We Use Your Information
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">We use your information to:</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Provide and maintain our Service',
                'Improve and personalize your experience',
                'Communicate with you about your account and our services',
                'Analyze usage patterns and trends',
                'Ensure the security of our Service',
                'Comply with legal obligations'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Data Security */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                3. Data Security
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We implement comprehensive security measures to protect your academic data and personal information. 
              Your school-related information is never shared with third parties, parents, or educational institutions.
            </p>
            
            <div className="space-y-4">
              <div className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Technical Security</h3>
                <ul className="space-y-3">
                  {[
                    'End-to-end encryption of data in transit using SSL/TLS',
                    'Secure password storage with industry-standard bcrypt hashing',
                    'Regular security audits and vulnerability assessments',
                    'Strict access controls and multi-factor authentication for admin access'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-100 dark:border-amber-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Protection Measures</h3>
                <ul className="space-y-3">
                  {[
                    'Rate limiting to prevent unauthorized access attempts',
                    '24/7 security monitoring and threat detection',
                    'AI assistant queries processed temporarily and deleted immediately',
                    'No sharing of academic data with schools, parents, or third parties'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Retention */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              4. Data Retention
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Specific Retention Periods</h3>
                <ul className="space-y-3">
                  {[
                    'Assignment data: Remains until you delete your account or remove individual assignments',
                    'Account information: Deleted within 30 days of account deletion',
                    'AI assistant queries: Processed temporarily and deleted immediately after response',
                    'Usage analytics: Aggregated and anonymized after 90 days'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Control</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You can delete individual assignments, export your data at any time, or delete your entire account 
                  to remove all personal information permanently.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Your Rights */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              5. Your Rights
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">You have the right to:</p>
            
            <div className="grid gap-3">
              {[
                'Access the personal information we hold about you',
                'Request correction of inaccurate personal information',
                'Request deletion of your personal information',
                'Object to or restrict processing of your personal information',
                'Request transfer of your personal information',
                'Withdraw consent where we rely on consent to process your information'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full mt-0.5">
                    <UserCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Cookies and Tracking */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              6. Cookies and Tracking
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Essential Cookies</h3>
                <ul className="space-y-3">
                  {[
                    'Authentication: Keeps you logged in to your TaskTornado account',
                    'Preferences: Remembers your settings like AI personality and layout preferences',
                    'Security: Helps protect your account from unauthorized access'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Analytics</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  We use minimal analytics to improve TaskTornado:
                </p>
                <ul className="space-y-2">
                  {[
                    'Feature usage (which tools you use most)',
                    'Performance metrics (loading times, errors)',
                    'No advertising tracking or data selling'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Third-Party Services */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              7. Third-Party Services
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may use third-party services to help us operate our business and the Service, such as hosting 
                providers, analytics providers, and customer support services. These third parties have access to 
                your personal information only to perform these tasks on our behalf and are obligated not to 
                disclose or use it for any other purpose.
              </p>
            </div>
          </motion.section>

          {/* Children's Privacy */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              8. Children's Privacy
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-100 dark:border-amber-900/50">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal 
                information from children under 13. If we learn that we have collected personal information from a 
                child under 13, we will take steps to delete that information as soon as possible.
              </p>
            </div>
          </motion.section>

          {/* Changes to This Policy */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              9. Changes to This Policy
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
              10. Contact Us
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              For privacy-related inquiries, please use our support channels:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors group"
              >
                Send Privacy Inquiry
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                Report Privacy Issue
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
