'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-center">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Application Error</h2>
          <p className="text-slate-400 text-sm mb-4 font-mono bg-slate-950 p-3 rounded text-left overflow-x-auto">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
