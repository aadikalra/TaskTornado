import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Study Groups: The Social Side of Academic Success | TaskTornado Journal',
    description: 'Isolation is the enemy of motivation. Connect with peers, share resources, and thrive together with TaskTornado groups.',
};

export default function StudyGroupsArticle() {
    return (
        <BlogArticleTemplate
            title="Study Groups"
            description="Isolation is the enemy of motivation. Connect with peers, share resources, and thrive together with TaskTornado groups."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 6, 2026"
            readTime="5 min read"
            coverImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                Being a student can often feel like a solitary pursuit. You spend hours alone with your books, struggling through difficult concepts and managing a heavy workload. But some of the most profound learning happens not in isolation, but in <strong>collaboration</strong>.
            </p>
            <p>
                We built <strong>TaskTornado Groups</strong> to make it easier for students to find their tribe, share their knowledge, and support each other through the academic journey.
            </p>

            <h2>Building Community</h2>
            <p>
                TaskTornado Groups allow you to create or join communities centered around shared goals. Whether it&apos;s a specific class, a study project, or a long-term interest like &quot;Computer Science Foundations,&quot; groups provide a dedicated space for engagement.
            </p>

            <h2>Shared Resources, Shared Success</h2>
            <p>
                In a group, everyone&apos;s contributions benefit the whole. Members can:
            </p>
            <ul>
                <li><strong>Share Notes and Links:</strong> Instantly distribute helpful materials to all group members.</li>
                <li><strong>Coordinate Study Sessions:</strong> Use integrated scheduling to find the perfect time for everyone to meet.</li>
                <li><strong>Collaborative Questioning:</strong> Get answers from peers who are tackling the same material.</li>
            </ul>

            <h2>Real-Time Collaboration</h2>
            <p>
                Our group features include real-time chat and discussion threads, allowing for immediate feedback and deep dives into complex topics. By fostering a sense of shared responsibility, groups help keep motivation high and ensure that no one falls behind.
            </p>

            <div className="bg-[#f5f9fc] dark:bg-zinc-800 p-8 rounded-3xl my-12 border border-sky-200/40 dark:border-sky-800/30">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-4">Learn Together</h3>
                <p className="mb-6">Don&apos;t go it alone. Join a community of motivated peers and reach your goals together.</p>
                <Link href="/groups" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full shadow-lg shadow-sky-500/20 transition-transform hover:scale-105">
                    Explore Groups
                </Link>
            </div>

            <h2>The Power of Peer Peer-to-Peer Learning</h2>
            <p>
                Research shows that teaching a concept to someone else is one of the best ways to solidify your own understanding. By participating in group discussions and helping peers, you&apos;re not just being a good community member — you&apos;re becoming a better student.
            </p>
            <p>
                TaskTornado Groups are about more than just making study friends; they&apos;re about building the support systems that make academic success sustainable and enjoyable.
            </p>
        </BlogArticleTemplate>
    );
}
