import Link from 'next/link';

export function SocialFeaturesUnavailable() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="max-w-lg rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-[#275085] dark:text-sky-200">
          Social features are unavailable
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#275085]/65 dark:text-sky-200/65">
          Study groups, public discussions, invitations, and group chat are
          disabled until reporting, blocking, moderation, and age-appropriate
          safety controls are ready.
        </p>
        <Link
          className="mt-7 inline-flex rounded-xl bg-[#275085] px-5 py-3 text-sm font-bold text-white"
          href="/dashboard"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}

