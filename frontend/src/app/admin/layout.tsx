'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MazerSidebar from '@/components/admin/MazerSidebar';
import MazerHeader from '@/components/admin/MazerHeader';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (isClient && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isClient, router]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isClient || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f2f7ff] dark:bg-[#151521] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#435ebe] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-wide">Checking Admin Permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f7ff] dark:bg-[#151521] text-slate-800 dark:text-slate-200">
      <MazerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`transition-all duration-300 ease-in-out lg:pl-[300px]`}>
        <MazerHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
