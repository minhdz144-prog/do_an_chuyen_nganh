'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Users, Briefcase, FileText, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Stats {
  users: { candidates: number; employers: number; admins: number };
  jobs: { active: number; draft: number; closed: number };
  applications: { applied: number; reviewing: number; interview: number; offered: number; rejected: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res: any = await axiosInstance.get('/admin/stats');
        setStats(res.data.stats);
      } catch (error) {
        console.error('Lỗi tải thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải thống kê...</div>;
  if (!stats) return <div className="p-10 text-center text-rose-500">Không thể tải dữ liệu.</div>;

  const totalUsers = stats.users.candidates + stats.users.employers + stats.users.admins;
  const totalJobs = stats.jobs.active + stats.jobs.draft + stats.jobs.closed;
  const totalApps = Object.values(stats.applications).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500 mt-1">Giám sát hoạt động của IT Job Portal.</p>
      </div>

      {/* Cards tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng người dùng</p>
              <h3 className="text-3xl font-black text-slate-900">{totalUsers}</h3>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Ứng viên</span><span className="font-semibold">{stats.users.candidates}</span></div>
            <div className="flex justify-between text-slate-600"><span>Nhà tuyển dụng</span><span className="font-semibold">{stats.users.employers}</span></div>
            <div className="flex justify-between text-slate-600"><span>Admin</span><span className="font-semibold">{stats.users.admins}</span></div>
          </div>
          <Link href="/admin/users" className="mt-4 text-xs text-blue-600 font-medium hover:underline block">Xem danh sách →</Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl"><Briefcase className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng tin tuyển dụng</p>
              <h3 className="text-3xl font-black text-slate-900">{totalJobs}</h3>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600 items-center"><span>Đang hoạt động</span><span className="font-semibold text-emerald-600">{stats.jobs.active}</span></div>
            <div className="flex justify-between text-slate-600"><span>Nháp</span><span className="font-semibold">{stats.jobs.draft}</span></div>
            <div className="flex justify-between text-slate-600"><span>Đã đóng</span><span className="font-semibold text-rose-500">{stats.jobs.closed}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-xl"><FileText className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng đơn ứng tuyển</p>
              <h3 className="text-3xl font-black text-slate-900">{totalApps}</h3>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Mới nộp</span><span className="font-semibold">{stats.applications.applied}</span></div>
            <div className="flex justify-between text-slate-600"><span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-amber-500"/>Phỏng vấn</span><span className="font-semibold text-amber-600">{stats.applications.interview}</span></div>
            <div className="flex justify-between text-slate-600"><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/>Trúng tuyển</span><span className="font-semibold text-emerald-600">{stats.applications.offered}</span></div>
            <div className="flex justify-between text-slate-600"><span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-400"/>Từ chối</span><span className="font-semibold text-rose-500">{stats.applications.rejected}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
