import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Writing Companion: Level Up Your Essays with AI Insights | TaskTornado Journal',
    description: 'From brainstorming to final polish, discover how TaskTornado helps you articulate complex ideas more clearly.',
};

export default function WritingCompanionArticle() {
    return (
        <BlogArticleTemplate
            title="Writing Assistant"
            description="From brainstorming to final polish, discover how TaskTornado helps you articulate complex ideas more clearly."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 7, 2026"
            readTime="6 min read"
            coverImage="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                Writing is hard. Whether it&apos;s a five-paragraph essay or a twenty-page research paper, the process of turning raw thoughts into structured arguments is one of the most demanding tasks a student faces.
            </p>
            <p>
                We built the <strong>TaskTornado Writing Companion</strong> to be your partner in that process. We&apos;re not here to write your papers for you; we&apos;re here to help you write them <em>better.</em>
            </p>

            <h2>Defeating the Blank Page</h2>
            <p>
                The hardest part of writing is often the first hundred words. Our AI tools are specifically designed to help you break through writer&apos;s block:
            </p>
            <ul>
                <li><strong>Brainstorming:</strong> Chat with Aurora to refine your thesis statement or explore different angles for your topic.</li>
                <li><strong>Outline Generation:</strong> Turn a messy list of ideas into a logical, structured outline in seconds.</li>
                <li><strong>Idea Expansion:</strong> Struggling to explain a complex concept? Describe it in your own words and let the Companion suggest ways to articulate it more clearly.</li>
            </ul>

            <h2>Refining Your Voice</h2>
            <p>
                Great writing is about clarity and impact. Our tools help you polish your prose without losing your personal style. We offer suggestions for:
            </p>
            <ul>
                <li><strong>Tone Adjustment:</strong> Ensure your writing is appropriate for your audience, whether it&apos;s a formal report or a creative story.</li>
                <li><strong>Clarity and Conciseness:</strong> Identify wordy sentences and find more direct ways to express your ideas.</li>
                <li><strong>Structural Flow:</strong> Ensure your arguments transition smoothly from one paragraph to the next.</li>
            </ul>

            <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 p-8 rounded-3xl my-12">
                <h3 className="text-xl font-bold mb-4 font-serif italic">Elevate Your Prose</h3>
                <p className="mb-6">Don&apos;t let a blank page slow you down. Start your next writing project with the support you deserve.</p>
                <Link href="/writing-assist" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl transition-transform hover:scale-105">
                    Open Writing Assist
                </Link>
            </div>

            <h2>Educational Collaboration</h2>
            <p>
                We believe the best writing tools are the ones that teach you something. By showing you <em>why</em> a particular change might be effective, we help you become a stronger, more confident writer over time.
            </p>
            <p>
                Whether you&apos;re a natural storyteller or someone who dreads every essay, the TaskTornado Writing Companion is built to help you reach your full potential as a writer.
            </p>
        </BlogArticleTemplate>
    );
}
