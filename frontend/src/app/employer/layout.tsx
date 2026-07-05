'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, Building, LayoutDashboard, Users, Menu, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';

const SIDEBAR_LINKS = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employer/jobs', label: 'Quản lý việc làm', icon: Briefcase },
  { href: '/employer/applications', label: 'Hồ sơ ứng viên', icon: Users },
  { href: '/employer/company', label: 'Hồ sơ công ty', icon: Building },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, updateUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Company Setup Modal state
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
    if (!companyData.name) return alert('Vui lòng nhập tên công ty');
    
    try {
      setLoading(true);
      const res: any = await axiosInstance.post('/companies', companyData);
      updateUser({ companyId: res.data.company._id });
      setShowCompanyModal(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi tạo công ty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            IT Job<span className="text-emerald-400">Portal</span> Employer
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
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex justify-between items-center px-4 z-20">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          IT Job<span className="text-emerald-400">Portal</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:pt-0 pt-16">
        <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mandatory Company Setup Modal */}
      <Dialog open={showCompanyModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ công ty</DialogTitle>
            <DialogDescription>
              Bạn cần tạo hồ sơ công ty trước khi có thể đăng tin tuyển dụng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên công ty <span className="text-rose-500">*</span></Label>
              <Input 
                id="name" 
                value={companyData.name} 
                onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                placeholder="VD: Tech Corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Lĩnh vực</Label>
              <Input 
                id="industry" 
                value={companyData.industry} 
                onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                placeholder="VD: Software Development"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Địa chỉ</Label>
              <Input 
                id="location" 
                value={companyData.location} 
                onChange={(e) => setCompanyData({...companyData, location: e.target.value})}
                placeholder="VD: Quận 1, TP.HCM"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 text-white">
              {loading ? 'Đang tạo...' : 'Lưu thông tin'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
