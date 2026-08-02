import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CSV Import Unavailable | TaskTornado',
  description: 'CSV and file imports are not available in TaskTornado.',
};

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
        Feature unavailable
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        TaskTornado does not accept file uploads
      </h1>
      <p className="mt-4 text-muted-foreground">
        CSV import is not part of the current product. Create flashcards manually
        inside your account instead.
      </p>
      <Link
        href="/flashcards"
        className="mt-8 rounded-full bg-sky-600 px-5 py-2.5 font-medium text-white hover:bg-sky-700"
      >
        Go to flashcards
      </Link>
    </main>
  );
}
