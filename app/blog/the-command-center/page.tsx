import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'The Command Center: A Unified View of Your Academic Life | TaskTornado Journal',
    description: 'Your dashboard is more than a list of assignments. It is an intelligent hub designed to prioritize your most urgent tasks and celebrate your progress.',
};

export default function CommandCenterArticle() {
    return (
        <BlogArticleTemplate
            title="Intelligent Dashboard"
            description="Your dashboard is more than a list of assignments. It is an intelligent hub designed to prioritize your most urgent tasks and celebrate your progress."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 9, 2026"
            readTime="4 min read"
            coverImage="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                In the life of a modern student, information is scattered. You have deadlines in Google Classroom, study materials on various websites, and personal notes tucked away in notebooks. This fragmentation leads to a constant, underlying feeling of <strong>anxiety</strong> — that &quot;What am I forgetting?&quot; sensation.
            </p>
            <p>
                We built the TaskTornado Dashboard to solve this. We don&apos;t just call it a home screen; we call it the <strong>Command Center.</strong>
            </p>

            <h2>Everything in its Place</h2>
            <p>
                The Command Center is designed to give you instant clarity. The moment you log in, your eyes are drawn to what matters most. We use intelligent layout and visual hierarchy to ensure that your most urgent assignments, upcoming tests, and current class standings are always front-and-center.
            </p>

            <h2>Intelligent Prioritization</h2>
            <p>
                A long list of tasks can be paralyzing. That&apos;s why our dashboard doesn&apos;t just show you <em>everything</em> — it shows you what to do <em>now</em>.
            </p>
            <ul>
                <li><strong>Dynamic Sorting:</strong> Your assignments are automatically prioritized based on their due date and weight.</li>
                <li><strong>Class Cards:</strong> Each class has a dedicated space where you can see your current grade, recent progress, and upcoming workload at a glance.</li>
                <li><strong>Real-time Stats:</strong> See your overall GPA and study streaks to keep your momentum high.</li>
            </ul>

            <h2>Customized for You</h2>
            <p>
                We believe your tools should adapt to you, not the other way around. The dashboard is highly customizable. You can toggle the visibility of specific categories, adjust the layout to suit your preference, and even set personalization themes that make the space feel like your own.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl my-12 border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Take Control Today</h3>
                <p className="mb-6 text-blue-800 dark:text-blue-200">Ready to transform your academic workflow? Log in and experience the Command Center for yourself.</p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-2xl transition-transform hover:scale-105">
                    Visit Your Dashboard
                </Link>
            </div>

            <h2>Reducing Cognitive Load</h2>
            <p>
                By centralizing your academic life, we reduce the &quot;cognitive switching cost&quot; — the mental energy required to jump between different tools and logins. When you know where everything is, you can spend less time organizing and more time <strong>doing.</strong>
            </p>
            <p>
                The Command Center is just the beginning. We&apos;re constantly refining the experience based on student feedback to make it the most powerful tool in your academic arsenal.
            </p>
        </BlogArticleTemplate>
    );
}
