'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  X,
  Building2,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface MazerSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function MazerSidebar({ isOpen, setIsOpen }: MazerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const menuGroups = [
    {
      title: 'Menu',
      items: [
        { name: 'Dashboard', icon: '/images/icons/stats.svg', path: '/admin/dashboard' },
        { name: 'Quản lý Người dùng', icon: Users, path: '/admin/users' },
        { name: 'Quản lý Công ty', icon: '/images/icons/employer.svg', path: '/admin/companies' },
      ]
    },
    {
      title: 'Cài đặt',
      items: [
        { name: 'Cấu hình hệ thống', icon: '/images/icons/settings.svg', path: '/admin/settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-white dark:bg-[#1e1e2d] border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
             <img src="/images/logo.svg" alt="ITJob Admin" className="w-9 h-9 group-hover:scale-105 transition-transform" />
             <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">IT Job <span className="text-[#435ebe]">Admin</span></span>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${
                          isActive 
                            ? 'bg-[#435ebe] text-white shadow-md shadow-[#435ebe]/30 translate-x-1' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#252536] hover:text-[#435ebe] dark:hover:text-[#435ebe]'
                        }`}
                      >
                        {typeof item.icon === 'string' ? (
                          <img src={item.icon} alt={item.name} className={`w-5 h-5 ${isActive ? 'brightness-0 invert' : 'opacity-70'}`} />
                        ) : (
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'opacity-70'}`} />
                        )}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
