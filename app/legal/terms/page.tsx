'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/signup" 
            className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 mb-6"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Sign Up
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: August 19, 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using TaskTornado ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
            <p className="text-gray-700">
              TaskTornado provides an online platform to help students manage their academic life, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Class and assignment tracking</li>
              <li>Grade management</li>
              <li>Study schedule planning</li>
              <li>Academic progress monitoring</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. User Accounts</h2>
            <p className="text-gray-700">
              To access certain features of the Service, you must create an account. You are responsible for maintaining 
              the confidentiality of your account information and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. User Responsibilities</h2>
            <p className="text-gray-700">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service in compliance with all applicable laws and regulations</li>
              <li>Not engage in any activity that could harm the Service or its users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Intellectual Property</h2>
            <p className="text-gray-700">
              All content and materials available on the Service, including but not limited to text, graphics, logos, 
              and software, are the property of TaskTornado and are protected by intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Limitation of Liability</h2>
            <p className="text-gray-700">
              TaskTornado shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will provide notice of any changes by updating 
              the "Last updated" date at the top of this page. Your continued use of the Service after such modifications 
              constitutes your acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-gray-700">
              <a href="mailto:support@tasktornado.com" className="text-teal-600 hover:underline">
                support@tasktornado.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
