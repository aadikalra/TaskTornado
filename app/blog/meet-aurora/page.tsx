import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Meet Aurora: Your Always-On Socratic Tutor | TaskTornado Journal',
    description: 'Learn why we built Aurora to be more than just a chatbot. Discover how our AI uses Socratic questioning to help students arrive at answers on their own.',
};

export default function MeetAuroraArticle() {
    return (
        <BlogArticleTemplate
            title="Aurora AI"
            description="Learn why we built Aurora to be more than just a chatbot. Discover how our AI uses Socratic questioning to help students arrive at answers on their own."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 9, 2026"
            readTime="5 min read"
            coverImage="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                When we first started building the AI for TaskTornado, we knew we didn&apos;t want to create just another answer machine. The internet is already full of tools that will give you a quick answer to a math problem or a summary of a history chapter.
            </p>
            <p>
                But true learning doesn&apos;t happen when you&apos;re given the answer. It happens when you&apos;re guided toward the <strong>process</strong> of finding it. That&apos;s why we built <strong>Aurora</strong>.
            </p>

            <h2>The Socratic Philosophy</h2>
            <p>
                Aurora is built on the Socratic method — a form of cooperative argumentative dialogue that stimulates critical thinking. Instead of simply telling you why an equation is balanced, Aurora might ask you what you notice about the atoms on the left side versus the right.
            </p>
            <p>
                This approach ensures that students aren&apos;t just finishing their homework; they&apos;re actually mastering the material.
            </p>

            <h2>Context-Aware Intelligence</h2>
            <p>
                What makes Aurora different from a generic AI is its awareness of your academic world. When you talk to Aurora, it isn&apos;t starting from scratch. It understands:
            </p>
            <ul>
                <li><strong>Your Classes:</strong> It knows what subjects you&apos;re focusing on.</li>
                <li><strong>Your Deadlines:</strong> It can help you prioritize study sessions for upcoming tests.</li>
                <li><strong>Your Progress:</strong> It remembers the concepts you&apos;ve struggled with in the past and offers focused support.</li>
            </ul>

            <h2>Beyond the Chatbox</h2>
            <p>
                Aurora isn&apos;t just a tab you visit; it&apos;s an assistant that lives across the platform. Whether you&apos;re in the middle of a quiz or reviewing your grade breakdown, Aurora is just a click away, ready to explain a complex topic or help you brainstorm your next essay.
            </p>

            <div className="bg-neutral-50 dark:bg-zinc-900 p-8 rounded-3xl my-12 border border-neutral-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Master Your Studies</h3>
                <p className="mb-6 italic">Ready to experience a more intelligent way to study? Start a conversation with Aurora today.</p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl transition-transform hover:scale-105">
                    Open Aurora
                </Link>
            </div>

            <h2>Empowering Every Student</h2>
            <p>
                Our mission with Aurora is to democratize high-quality tutoring. We believe every student deserves a personalized mentor who is patient, knowledgeable, and available 24/7.
            </p>
            <p>
                As we continue to develop Aurora, we&apos;re focused on making it even more intuitive and supportive. Because at the end of the day, our goal isn&apos;t to make school easier — it&apos;s to make you better at it.
            </p>
        </BlogArticleTemplate>
    );
}
