'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4">
        <h2 className="text-lg font-bold text-red-400">Page Rendering Error</h2>
        <p className="text-slate-400 text-xs font-mono bg-slate-950 p-3 rounded text-left overflow-x-auto">
          {error?.message || 'Failed to render this page.'}
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition"
          >
            Try Again
          </button>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
