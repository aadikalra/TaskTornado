import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About TaskTornado | Student Planner',
    description: 'Learn who builds TaskTornado, what the free student planner does, and where to contact the team about support or privacy.',
    alternates: { canonical: '/about' },
};

export default function AboutPage() {
    return (
        <article className="min-h-screen bg-[#fffaf4] text-sky-950 dark:bg-gray-950 dark:text-sky-100">
            <div className="mx-auto max-w-3xl space-y-10 px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
                <header>
                    <Link href="/" className="font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">TaskTornado home</Link>
                    <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-6xl">About TaskTornado</h1>
                    <p className="mt-4 text-lg leading-relaxed text-sky-900/75 dark:text-sky-100/75">
                        TaskTornado is a free web app for organizing homework, classes, and tests.
                        Aadi Kalra founded the project to give students one place to see what’s due and decide what to study next.
                    </p>
                </header>
                <section>
                    <h2 className="text-2xl font-bold">Built for the school week</h2>
                    <p className="mt-3 leading-relaxed text-sky-900/75 dark:text-sky-100/75">
                        Students can organize assignments by class, keep track of upcoming tests in the calendar,
                        and review with flashcards or quizzes. Eligible students can also use Aurora for study planning and explanations.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-5 font-semibold text-sky-700 dark:text-sky-300">
                        <Link href="/student-planner" className="underline underline-offset-4">Explore the student planner</Link>
                        <Link href="/changelog" className="underline underline-offset-4">Read release notes</Link>
                        <Link href="/blog" className="underline underline-offset-4">Read the TaskTornado Journal</Link>
                    </div>
                </section>
                <section className="rounded-3xl border border-sky-100 bg-white p-6 dark:border-sky-900 dark:bg-slate-900 sm:p-8">
                    <h2 className="text-2xl font-bold">Support and privacy</h2>
                    <p className="mt-3 leading-relaxed text-sky-900/75 dark:text-sky-100/75">
                        Reach the TaskTornado team for product questions or privacy requests. The privacy policy explains
                        what data the planner collects, how Aurora handles requests, and what choices students and guardians have.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-5 font-semibold text-sky-700 dark:text-sky-300">
                        <a href="https://forms.gle/wjR1nJdg8vFYeNcd6" className="underline underline-offset-4">Contact TaskTornado</a>
                        <Link href="/legal/privacy" className="underline underline-offset-4">Privacy Policy</Link>
                        <Link href="/legal/terms" className="underline underline-offset-4">Terms of Service</Link>
                    </div>
                </section>
            </div>
        </article>
    );
}
