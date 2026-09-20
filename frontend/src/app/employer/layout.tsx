'use client';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, Building, LayoutDashboard, Users, Menu, CalendarDays, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';

const SIDEBAR_LINKS = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: '/images/icons/stats.svg' },
  { href: '/employer/jobs', label: 'Quản lý việc làm', icon: '/images/icons/search.svg' },
  { href: '/employer/applications', label: 'Hồ sơ ứng viên', icon: '/images/icons/apply.svg' },
  { href: '/employer/calendar', label: 'Lịch phỏng vấn', icon: CalendarDays },
  { href: '/employer/company', label: 'Hồ sơ công ty', icon: '/images/icons/employer.svg' },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, updateUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({ name: '', location: '', industry: '' });

  useEffect(() => {
    if (user && user.role === 'employer' && !user.companyId) {
      setShowCompanyModal(true);
    } else {
      setShowCompanyModal(false);
    }
  }, [user]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.name) { toast.error('Vui lòng nhập tên công ty'); return; };
    
    try {
      setLoading(true);
      const res: any = await axiosInstance.post('/companies', companyData);
      updateUser({ companyId: res.data.company._id });
      setShowCompanyModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo công ty');
    } finally {
      setLoading(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-foreground tracking-tight flex items-center gap-1">
          IT Job<span className="text-primary">Portal</span> 
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">Employer</span>
        </Link>
      </div>
      
      <div className="px-4 mb-4">
        <Link 
          href="/employer/jobs/create"
          className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Đăng tin mới
        </Link>
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
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {typeof Icon === 'string' ? (
                <img src={Icon} alt={link.label} className={`w-5 h-5 ${isActive ? 'brightness-0 invert' : 'opacity-70 group-hover:opacity-100'}`} />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop - Glassmorphism */}
      <aside className="w-72 hidden lg:block sticky top-0 h-screen glass-sidebar z-40">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Glassmorphism */}
        <header className="h-16 glass-panel sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b-0 border-r-0 border-l-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="lg:hidden text-muted-foreground hover:bg-muted p-2 rounded-md">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 glass-sidebar border-r-0" showCloseButton={false}>
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              {SIDEBAR_LINKS.find(link => pathname.startsWith(link.href))?.label || 'Bảng điều khiển'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-8 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Nhà tuyển dụng</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mandatory Company Setup Modal */}
      <Dialog open={showCompanyModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md pointer-events-auto glass-card border-border">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ công ty</DialogTitle>
            <DialogDescription>
              Bạn cần tạo hồ sơ công ty trước khi có thể đăng tin tuyển dụng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên công ty <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                value={companyData.name} 
                onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                placeholder="VD: Tech Corp"
                required
                className="bg-white/50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Lĩnh vực</Label>
              <Input 
                id="industry" 
                value={companyData.industry} 
                onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                placeholder="VD: Software Development"
                className="bg-white/50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Địa chỉ</Label>
              <Input 
                id="location" 
                value={companyData.location} 
                onChange={(e) => setCompanyData({...companyData, location: e.target.value})}
                placeholder="VD: Quận 1, TP.HCM"
                className="bg-white/50 focus:bg-white"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Đang tạo...' : 'Lưu thông tin'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
