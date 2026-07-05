import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 justify-center text-3xl font-bold text-slate-900 tracking-tight">
          <Briefcase className="w-8 h-8 text-emerald-500" />
          <span>IT Job<span className="text-emerald-500">Portal</span></span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 sm:rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
