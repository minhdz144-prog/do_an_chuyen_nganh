'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const res: any = await axiosInstance.get(`/jobs?employer=${user._id}&status=all&limit=100`);
        const jobs = res.data.jobs || [];
        
        let activeCount = 0;
        let viewsCount = 0;
        jobs.forEach((job: any) => {
          if (job.status === 'active') activeCount++;
          viewsCount += (job.views || 0);
        });

        // Tạm thời chưa fetch totalApplications thực tế vì cần API ứng tuyển (Step 7)
        // Chúng ta mock tạm số liệu
        
        setStats({
          totalJobs: jobs.length,
          activeJobs: activeCount,
          totalApplications: 0, 
          totalViews: viewsCount,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  const statCards = [
    { label: 'Tổng số tin đã đăng', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tin đang hoạt động', value: stats.activeJobs, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Lượt xem tin', value: stats.totalViews, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Hồ sơ ứng tuyển', value: stats.totalApplications, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Tổng quan tình hình tuyển dụng của công ty.</p>
        </div>
        <Link 
          href="/employer/jobs/create" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Đăng tin mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Mẹo tuyển dụng hiệu quả</h2>
        <ul className="space-y-2 text-slate-600 list-disc list-inside">
          <li>Viết mô tả công việc chi tiết và rõ ràng về quyền lợi.</li>
          <li>Đề xuất mức lương cụ thể để thu hút nhiều ứng viên hơn.</li>
          <li>Phản hồi hồ sơ của ứng viên trong vòng 48h để giữ chân nhân tài.</li>
        </ul>
      </div>
    </div>
  );
}
