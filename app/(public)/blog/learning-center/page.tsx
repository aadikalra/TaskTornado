import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'The Learning Center: Becoming a TaskTornado Power User | TaskTornado Journal',
    description: 'Maximize your potential. A guide to the tutorials and resources available to help you master every corner of our platform.',
};

export default function LearningCenterArticle() {
    return (
        <BlogArticleTemplate
            title="Tutorials Center"
            description="Maximize your potential. A guide to the tutorials and resources available to help you master every corner of our platform."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 4, 2026"
            readTime="6 min read"
            coverImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                TaskTornado is a deep platform. While we&apos;ve designed it to be intuitive from day one, there are layers of functionality that even our most active users might not have explored yet. From AI-driven insights to collaborative shortcuts, there&apos;s always more to discover.
            </p>
            <p>
                That&apos;s why we built the <strong>Learning Center</strong>. It&apos;s your hub for mastering the TaskTornado ecosystem.
            </p>

            <h2>Guided Journeys</h2>
            <p>
                Our tutorials aren&apos;t just lists of features; they&apos;re guided journeys through specific workflows. Whether you&reg;re trying to set up your first class or deep-diving into grade modeling, our step-by-step guides ensure you reach your goal without any guesswork.
            </p>

            <h2>AI guidance is coming later</h2>
            <p>
                Aurora resources will be added only after the AI provider,
                privacy, and student-safety review is complete. AI is currently
                unavailable.
            </p>

            <h2>Power User Shortcuts</h2>
            <p>
                Speed matters. We&apos;ve documented the keyboard shortcuts and platform tricks that help you move through your academic tasks like a pro. From fast-switching between views to advanced search operators, these &quot;pro tips&quot; will shave minutes off your daily routine.
            </p>

            <div className="bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30 p-8 rounded-3xl my-12">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-4">Start Your Training</h3>
                <p className="mb-6 opacity-70">Ready to take your TaskTornado skills to the next level? Explore our library of tutorials today.</p>
                <Link href="/tutorials" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full shadow-lg shadow-sky-500/20 transition-transform hover:scale-105">
                    Visit the Tutorials
                </Link>
            </div>

            <h2>Constant Updates</h2>
            <p>
                As we add new features to the platform, the Learning Center is updated in real-time. It&apos;s a living resource that grows alongside TaskTornado, ensuring you always have access to the latest best practices and efficiency tools.
            </p>
            <p>
                We believe that the best way to empower students is to give them both powerful tools and the knowledge to use them effectively. The Learning Center is our invitation to you to master your workflow and reach your full potential.
            </p>
        </BlogArticleTemplate>
    );
}
