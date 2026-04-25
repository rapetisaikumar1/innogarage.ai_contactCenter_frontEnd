import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[120px] leading-none font-bold tracking-tight bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="text-xl font-semibold text-slate-900 mt-2">Page not found</h1>
        <p className="text-sm text-slate-600 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
