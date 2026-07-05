'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Briefcase, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tránh lỗi Hydration mismatch vì Zustand persist lưu state dưới LocalStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'employer': return '/employer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/candidate/profile';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'employer': return 'Quản lý tuyển dụng';
      case 'admin': return 'Quản trị hệ thống';
      default: return 'Hồ sơ của tôi';
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-500" />
          <span>IT Job<span className="text-emerald-500">Portal</span></span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link href="/jobs" className={cn("hover:text-emerald-500 transition-colors", pathname.startsWith('/jobs') && "text-emerald-500")}>
            Việc làm IT
          </Link>
          <Link href="/employer/dashboard" className={cn("hover:text-emerald-500 transition-colors", pathname.startsWith('/employer') && "text-emerald-500")}>
            Nhà tuyển dụng
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!mounted ? (
            <div className="w-20 h-9 bg-slate-100 animate-pulse rounded-lg"></div>
          ) : isAuthenticated && user ? (
            // ★ Quyết định: dùng custom dropdown thuần thay vì shadcn DropdownMenu
            // để tránh phụ thuộc thêm package và kiểm soát animation linh hoạt hơn
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors"
              >
                {/* Avatar với chữ cái đầu */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                  {/* Thông tin user */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className={cn(
                      "text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full",
                      user.role === 'employer' ? "bg-blue-100 text-blue-700" :
                      user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                      "bg-emerald-100 text-emerald-700"
                    )}>
                      {user.role === 'employer' ? 'Nhà tuyển dụng' : user.role === 'admin' ? 'Admin' : 'Ứng viên'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      {getDashboardLabel()}
                    </Link>
                    <Link
                      href={user.role === 'candidate' ? '/candidate/profile' : user.role === 'employer' ? '/employer/company' : '/admin/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Cập nhật hồ sơ
                    </Link>
                  </div>

                  {/* Divider + Logout */}
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                Đăng nhập
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-800 rounded-lg")}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
