import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'The Research Hub: How Web Saves Professionalize Your Study | TaskTornado Journal',
    description: 'Research is messy. Our web saves tool keeps your sources organized, searchable, and always at your fingertips.',
};

export default function ResearchHubArticle() {
    return (
        <BlogArticleTemplate
            title="Web Saves Hub"
            description="Research is messy. Our web saves tool keeps your sources organized, searchable, and always at your fingertips."
            category="Product"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 7, 2026"
            readTime="4 min read"
            coverImage="https://images.unsplash.com/photo-1454165833772-d99626a44bf7?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                The internet is the greatest library ever built, but it&apos;s also the nosiest. When you&apos;re deep in a research project, it&apos;s all too easy to end up with fifty open tabs, a dozen half-copied URLs, and no clear way to find that one perfect quote you saw twenty minutes ago.
            </p>
            <p>
                We built <strong>Web Saves</strong> to bring order to the chaos. It&apos;s more than a bookmark manager; it&apos;s a dedicated workspace for your intellectual curiousity.
            </p>

            <h2>Your Personal Archive</h2>
            <p>
                In TaskTornado, every link you save becomes part of a searchable, structured archive. You can categorize your finds by project, tag them for easy retrieval, and add personal notes to explain why a particular source is important.
            </p>

            <h2>Seamless Collection</h2>
            <p>
                We designed the collection process to be invisible. Whether you&apos;re on your desktop or your phone, saving a source takes just a couple of taps. By moving the &quot;curation&quot; phase outside of your browser, we help you keep your browsing sessions focused and your research organized.
            </p>

            <h2>Intelligent Retrieval</h2>
            <p>
                A library is only as good as its index. TaskTornado allows you to search through your saved links by title, category, or your own personal tags. It ensures that when it&apos;s time to start writing your essay, all your ingredients are already prepped and ready to go.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-3xl my-12 border border-emerald-100 dark:border-emerald-900/30">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-4 text-emerald-900 dark:text-emerald-100">Organize Your Research</h3>
                <p className="mb-6 text-emerald-800 dark:text-emerald-200">Stop losing your best sources. Start building your personal research hub today.</p>
                <Link href="/web-saves" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white font-bold rounded-2xl transition-transform hover:scale-105">
                    Go to Web Saves
                </Link>
            </div>

            <h2>Beyond Bookmarks</h2>
            <p>
                We believe that the way you manage your information reflects the quality of your work. By professionalizing your research workflow, you&apos;re not just gathering data; you&apos;re building an internal knowledge base that you can draw upon for years to come.
            </p>
            <p>
                The Research Hub is just one way TaskTornado helps you master the art of being a student in the digital age.
            </p>
        </BlogArticleTemplate>
    );
}
