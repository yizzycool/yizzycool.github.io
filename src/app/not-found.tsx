import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Yizzy Peasy',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-slate-800 dark:text-slate-100">
        404
      </h1>
      <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Return Home
      </Link>
    </div>
  );
}
