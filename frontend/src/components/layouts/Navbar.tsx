'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Briefcase, LogOut, LayoutDashboard, User, ChevronDown,
  Bookmark, Menu, X, Search, FileText, Wrench, BookOpen,
  Zap, Star, Building2, MapPin, Clock, TrendingUp
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/shared/NotificationBell';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

// ─── Mega dropdown data (chuẩn TopCV Pro) ───────────────────────────────────
const VIEC_LAM_ITEMS = [
  { icon: Search, label: 'Tìm việc làm IT', href: '/jobs', desc: 'Hàng nghìn việc làm công nghệ' },
  { icon: TrendingUp, label: 'Việc làm HOT', href: '/jobs?sort=salary', desc: 'Lương cao, đãi ngộ tốt' },
  { icon: MapPin, label: 'Theo địa điểm', href: '/jobs?location=HCM', desc: 'HCM, Hà Nội và toàn quốc' },
  { icon: Clock, label: 'Mới nhất hôm nay', href: '/jobs?sort=new', desc: 'Cập nhật trong 24h' },
];

const CV_ITEMS = [
  { icon: FileText, label: 'Hồ sơ của tôi', href: '/candidate/profile', desc: 'Xem & chỉnh sửa CV' },
  { icon: Star, label: 'Việc đã lưu', href: '/candidate/saved-jobs', desc: 'Danh sách việc yêu thích' },
];

const CONG_CU_ITEMS = [
  { icon: Zap, label: 'AI Live Matching', href: '/#matching', desc: 'Gợi ý việc làm thông minh' },
  { icon: Building2, label: 'Dành cho NTD', href: '/employer/dashboard', desc: 'Đăng tin & quản lý ứng viên' },
];

interface MegaMenuProps {
  items: { icon: React.ElementType; label: string; href: string; desc: string }[];
  isOpen: boolean;
}

function MegaMenu({ items, isOpen }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#1e2024] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
        >
          <div className="p-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── NavDropdown wrapper ─────────────────────────────────────────────────────
function NavDropdown({
  label,
  items,
  isActive,
}: {
  label: string;
  items: { icon: React.ElementType; label: string; href: string; desc: string }[];
  isActive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors rounded-lg ${
          isActive || open ? 'text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <MegaMenu items={items} isOpen={open} />
    </div>
  );
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#141517] border-b border-white/8 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[70px] flex items-center justify-between gap-6">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex items-center gap-1.5">
            <img src="/images/logo.svg" alt="IT Job" className="w-10 h-10 drop-shadow-lg group-hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-300" />
            <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors drop-shadow-md ml-1">
              IT<span className="text-emerald-500">Job</span>
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ──────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavDropdown
            label="Việc làm"
            items={VIEC_LAM_ITEMS}
            isActive={pathname.startsWith('/jobs')}
          />
          <NavDropdown
            label="Hồ sơ & CV"
            items={CV_ITEMS}
            isActive={pathname.startsWith('/candidate')}
          />
          <NavDropdown
            label="Công cụ"
            items={CONG_CU_ITEMS}
          />
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-lg"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Cẩm nang nghề nghiệp
          </Link>

          {/* IT Job link badge */}
          <Link
            href="/"
            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">IT Job</span>
          </Link>
        </nav>

        {/* ── Right Side Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {!mounted ? (
            <div className="w-40 h-9 bg-white/5 animate-pulse rounded-lg hidden sm:block" />
          ) : isAuthenticated && user ? (
            /* Logged-in state */
            <div className="flex items-center gap-2">
              {user.role === 'candidate' && (
                <Link
                  href="/candidate/saved-jobs"
                  className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                >
                  <Bookmark className="w-5 h-5" />
                  {(user.savedJobs?.length || 0) > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {user.savedJobs!.length}
                    </span>
                  )}
                </Link>
              )}

              <NotificationBell />
              <ThemeToggle />

              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 relative rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs border border-white/20 overflow-hidden">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="avatar" fill sizes="28px" className="object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ').pop()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-64 bg-[#1e2024] rounded-2xl shadow-2xl shadow-black/60 border border-white/10 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-2 inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {user.role === 'employer' ? 'Nhà tuyển dụng' : user.role === 'admin' ? 'Quản trị viên' : 'Ứng viên'}
                        </span>
                      </div>
                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" /> {getDashboardLabel()}
                        </Link>
                        <Link
                          href={user.role === 'candidate' ? '/candidate/profile' : user.role === 'employer' ? '/employer/company' : '/admin/dashboard'}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" /> Cập nhật hồ sơ
                        </Link>
                      </div>
                      <div className="border-t border-white/8 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Guest state — 3 buttons chuẩn TopCV Pro */
            <div className="hidden md:flex items-center gap-2">

              {/* Đăng ký — viền xanh, chữ xanh (như TopCV Login btn) */}
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  Đăng ký
                </motion.div>
              </Link>

              {/* Đăng nhập — nền xanh solid (như TopCV "Đăng ký" btn) */}
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 0 18px 4px rgba(0,177,79,0.35)' }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Đăng nhập
                </motion.div>
              </Link>

              {/* Đăng tuyển — viền vàng, chữ vàng (như TopCV "Đăng tuyển & tìm hồ sơ") */}
              <Link href="/employer/dashboard">
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 0 18px 4px rgba(226,183,75,0.25)' }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-lg border border-amber-500/60 text-amber-400 text-sm font-semibold hover:bg-amber-500/10 transition-colors cursor-pointer whitespace-nowrap hidden lg:block"
                >
                  Đăng tuyển &amp; tìm hồ sơ
                </motion.div>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/8 bg-[#1a1c1f] overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3">
              {[
                { href: '/jobs', label: 'Việc làm IT' },
                { href: '/candidate/profile', label: 'Hồ sơ & CV' },
                { href: '/jobs', label: 'Cẩm nang nghề nghiệp' },
                { href: '/employer/dashboard', label: 'Nhà tuyển dụng' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl bg-white/5 text-slate-300 font-semibold hover:bg-white/10 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/8">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 rounded-xl bg-emerald-500 text-white font-semibold"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 rounded-xl border border-emerald-500 text-emerald-400 font-semibold"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
