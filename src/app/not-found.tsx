import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-orange-500 p-0.5 shadow-2xl mb-6">
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-orange-400" />
        </div>
      </div>
      <h1 className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
        404
      </h1>
      <h2 className="text-xl font-bold mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm">
        The requested page does not exist in RT Billing System.
      </p>

      <Link href="/dashboard" className="mt-8">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 px-8">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
