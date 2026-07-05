'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, FileText, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

const SIDEBAR_LINKS = [
  { href: '/candidate/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
  { href: '/candidate/applications', label: 'Việc đã ứng tuyển', icon: FileText },
  { href: '/candidate/jobs/recommended', label: 'Việc làm gợi ý AI', icon: Sparkles },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen shadow-sm z-10">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
            IT Job<span className="text-emerald-500">Portal</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 z-20">
        <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
          IT Job<span className="text-emerald-500">Portal</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-20 p-4 space-y-2">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:pt-0 pt-16">
        <div className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
