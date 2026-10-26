import Link from 'next/link';
import { Check, KeyRound, ArrowRight } from 'lucide-react';
import { FREE_LIMITS } from '@/lib/planTier';
import { AI_PLAN_LIMITS } from '@/lib/ai/config';
import { AI_PROVIDERS } from '@/lib/ai/providers';

export default function PricingPage() {
    const ai = AI_PLAN_LIMITS.free;
    const included = [
        `${FREE_LIMITS.homeworkEntries} active assignments`,
        `${FREE_LIMITS.activeTests} active tests`,
        `${FREE_LIMITS.flashcardStorage} saved flashcards`,
        `${FREE_LIMITS.webSaves} saved links`,
        'Calendar, grade calculator, and study timer',
        `${ai.quick} Quick and ${ai.tutor} Deep AI actions per day`,
        `${ai.bulk_generation} study-set generations per day`,
        `${FREE_LIMITS.translationsPerDay} translations per day, up to ${FREE_LIMITS.translationMaxChars.toLocaleString()} characters each`,
    ];
    return (
        <main className="min-h-screen bg-[#fffaf4] px-6 pb-24 pt-32 text-sky-950 dark:bg-gray-950 dark:text-sky-100">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">One free plan</p>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Your schoolwork. One place.</h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed opacity-70">Start with the included free limits. Connect your own AI key whenever you want more AI usage or a different model.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-sky-100 bg-white p-8 dark:border-sky-900 dark:bg-gray-900">
                        <h2 className="text-xl font-bold">TaskTornado Free</h2>
                        <p className="my-5 text-5xl font-bold">$0<span className="text-sm font-medium opacity-50"> / forever</span></p>
                        <ul className="space-y-3">{included.map((item) => <li key={item} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-sky-500" />{item}</li>)}</ul>
                        <p className="mt-5 text-xs leading-relaxed opacity-60">AI features share a total of {ai.combined} actions per day and a four-request-per-minute limit. Daily allowances reset at midnight UTC.</p>
                        <Link href="/signup" className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600">Get started free <ArrowRight className="h-4 w-4" /></Link>
                    </section>
                    <section className="rounded-3xl border border-sky-200 bg-sky-50/60 p-8 dark:border-sky-800 dark:bg-sky-950/30">
                        <KeyRound className="mb-4 h-7 w-7 text-sky-500" />
                        <h2 className="text-xl font-bold">Bring your own AI key</h2>
                        <p className="mt-4 text-sm leading-relaxed opacity-75">Connect {Object.values(AI_PROVIDERS).map((provider) => provider.name).join(', ')} from Settings → AI Connection.</p>
                        <ul className="mt-6 space-y-3 text-sm">
                            <li>Choose your provider and chat model.</li>
                            <li>Personal-key requests bypass daily AI quotas.</li>
                            <li>Switch back to free AI at any time.</li>
                            <li>Your key is encrypted and can be removed at any time.</li>
                        </ul>
                        <p className="mt-6 text-xs leading-relaxed opacity-65">Provider charges and rate limits apply. TaskTornado&apos;s request-rate and assignment/storage limits remain. Ramblr uses your key with Groq; other providers use the free speech allowance.</p>
                        <Link href="/settings#ai" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-sky-300 px-5 py-3 text-sm font-semibold hover:bg-sky-100 dark:border-sky-700 dark:hover:bg-sky-900">Set up your key <ArrowRight className="h-4 w-4" /></Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
