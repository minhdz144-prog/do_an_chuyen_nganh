'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserCircle, FileText, Menu, Sparkles, Bookmark, FileSpreadsheet } from 'lucide-react';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SIDEBAR_LINKS = [
  { href: '/candidate/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
  { href: '/candidate/applications', label: 'Lịch sử ứng tuyển', icon: FileText },
  { href: '/candidate/saved-jobs', label: 'Việc làm đã lưu', icon: Bookmark },
  { href: '/candidate/jobs/recommended', label: 'Gợi ý việc làm AI', icon: Sparkles },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card rounded-3xl md:m-4 md:mr-0 border border-border shadow-sm overflow-hidden">
      <div className="p-6 pb-2">
        <Link href="/" className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <span>IT Job<span className="text-primary">Portal</span></span>
        </Link>
      </div>
      
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 font-medium' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
         <div className="bg-primary/5 rounded-2xl p-4 text-center">
           <div className="w-10 h-10 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
           </div>
           <p className="text-sm font-semibold text-foreground mb-1">Nâng cấp CV</p>
           <p className="text-xs text-muted-foreground mb-3">Tạo CV chuyên nghiệp ngay trên nền tảng.</p>
           <Link 
             href="/candidate/profile"
             className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-transparent shadow-sm h-8 px-3 w-full rounded-xl border-primary/20 text-primary hover:bg-primary/10"
           >
             Tạo CV
           </Link>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-72 hidden lg:block sticky top-0 h-screen z-40 p-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 lg:mt-4 lg:mx-8 lg:rounded-2xl glass-panel sticky top-4 z-30 flex items-center justify-between px-4 lg:px-6 border shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="lg:hidden text-muted-foreground hover:bg-muted p-2 rounded-md">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-transparent border-0" showCloseButton={false}>
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <div className="h-screen py-4 pl-4 pr-2">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              {SIDEBAR_LINKS.find(link => pathname.startsWith(link.href))?.label || 'Bảng điều khiển'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/jobs" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Tìm việc làm</Link>
             <div className="h-4 w-px bg-border hidden md:block mx-2"></div>
             <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
