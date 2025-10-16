'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: August 19, 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          <section className="space-y-4">
            <p className="text-gray-700">
              At TaskTornado, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
            <p className="text-gray-700">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Academic Information:</strong> Classes, assignments, grades, and study materials you upload</li>
              <li><strong>Usage Data:</strong> Information about how you use our Service, including pages visited and features used</li>
              <li><strong>Device Information:</strong> IP address, browser type, and operating system</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="text-gray-700">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide and maintain our Service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Ensure the security of our Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Encryption of data in transit using SSL/TLS</li>
              <li>Secure storage of passwords using industry-standard hashing</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information only for as long as necessary to provide you with our services and 
              for legitimate business purposes, such as maintaining the performance of the Service, making data-
              driven business decisions, complying with legal obligations, and resolving disputes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
            <p className="text-gray-700">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your personal information</li>
              <li>Request transfer of your personal information</li>
              <li>Withdraw consent where we rely on consent to process your information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Third-Party Services</h2>
            <p className="text-gray-700">
              We may use third-party services to help us operate our business and the Service, such as hosting 
              providers, analytics providers, and customer support services. These third parties have access to 
              your personal information only to perform these tasks on our behalf and are obligated not to 
              disclose or use it for any other purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Children's Privacy</h2>
            <p className="text-gray-700">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If we learn that we have collected personal information from a 
              child under 13, we will take steps to delete that information as soon as possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-gray-700">
              <a href="mailto:privacy@schoolorganizer.com" className="text-teal-600 hover:underline">
                privacy@schoolorganizer.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
