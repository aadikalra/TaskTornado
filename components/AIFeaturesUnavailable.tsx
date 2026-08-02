import Link from 'next/link';

export function AIFeaturesUnavailable({
  featureName = 'AI features',
}: {
  featureName?: string;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="max-w-lg rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-[#275085] dark:text-violet-200">
          {featureName} are not available yet
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#275085]/65 dark:text-violet-200/65">
          TaskTornado&apos;s AI and AI-powered translation features are disabled
          while we select a provider and complete privacy, safety, and
          production controls.
        </p>
        <Link
          className="mt-7 inline-flex rounded-xl bg-[#275085] px-5 py-3 text-sm font-bold text-white"
          href="/features"
        >
          View available features
        </Link>
      </div>
    </main>
  );
}
