import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Peer Discussions: Moving Class Conversations Forward | TaskTornado Journal',
    description: 'Engagement happens in the dialogue. Learn how our discussion forums foster deeper critical thinking through collaboration.',
};

export default function PeerDiscussionsArticle() {
    return (
        <BlogArticleTemplate
            title="Discussion Forums"
            description="Engagement happens in the dialogue. Learn how our discussion forums foster deeper critical thinking through collaboration."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 5, 2026"
            readTime="4 min read"
            coverImage="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                A great education is about more than just absorbing information; it&apos;s about engaging with it. It&apos;s about questioning assumptions, exploring different perspectives, and testing your ideas against those of your peers.
            </p>
            <p>
                We built <strong>TaskTornado Discussions</strong> to provide a dedicated home for these vital intellectual exchanges.
            </p>

            <h2>Beyond the Classroom Walls</h2>
            <p>
                The classroom is a powerful space for learning, but the conversation shouldn&apos;t stop when the bell rings. Our discussion forums allow students to continue exploring topics deeply, asynchronously, and at their own pace.
            </p>

            <h2>A Space for Every Subject</h2>
            <p>
                Whether you&apos;re debating the themes of a classic novel or troubleshooting a difficult coding problem, Discussions provide a structured way to collaborate. We&apos;ve designed the experience to be:
            </p>
            <ul>
                <li><strong>Organized:</strong> Threads are categorized by class and topic, making it easy to find relevant conversations.</li>
                <li><strong>Searchable:</strong> Don&apos;t repeat the same questions. Search the forum to find answers from past discussions.</li>
                <li><strong>Inclusive:</strong> Our minimal, text-first design ensures that the focus is always on the quality of the ideas, not the loudest voice.</li>
            </ul>

            <h2>Fostering Critical Thinking</h2>
            <p>
                Writing out your thoughts in a discussion post forces you to articulate them clearly. Responding to a peer&apos;s argument requires you to think critically and empathetically. These are the skills that define a true scholar.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl my-12 border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100 italic">Join the Conversation</h3>
                <p className="mb-6 text-blue-800 dark:text-blue-200">Have a question or a unique insight? Share it with your peers today.</p>
                <Link href="/discussions" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-2xl transition-transform hover:scale-105">
                    Go to Discussions
                </Link>
            </div>

            <h2>Building a Knowledge Base</h2>
            <p>
                Over time, a class discussion forum becomes a valuable resource for everyone involved. It becomes a living record of the class&apos;s collective learning journey, full of insights and explanations that you won&apos;t find in any textbook.
            </p>
            <p>
                At TaskTornado, we&apos;re committed to building tools that help students become active participants in their own education. Peer Discussions are a central part of that vision.
            </p>
        </BlogArticleTemplate>
    );
}
