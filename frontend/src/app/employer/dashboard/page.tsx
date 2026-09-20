'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Briefcase, Users, Eye, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import JobAnalyticsChart from '@/components/employer/JobAnalyticsChart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    chartData: [] as any[],
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
        let chartData: any[] = [];
        let totalAppsCount = 0;

        const appPromises = jobs.map((job: any) =>
          axiosInstance.get(`/jobs/${job._id}/applications`)
        );
        const appResponses: any = await Promise.allSettled(appPromises);

        jobs.forEach((job: any, index: number) => {
          if (job.status === 'active') activeCount++;
          viewsCount += (job.views || 0);

          let appsCount = 0;
          if (appResponses[index].status === 'fulfilled') {
            appsCount = appResponses[index].value.data.applications?.length || 0;
            totalAppsCount += appsCount;
          }

          chartData.push({
            name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
            views: job.views || 0,
            applications: appsCount
          });
        });
        
        setStats({
          totalJobs: jobs.length,
          activeJobs: activeCount,
          totalApplications: totalAppsCount, 
          totalViews: viewsCount,
          chartData: chartData
        } as any);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  const statCards = [
    { label: 'Việc làm đang mở', value: stats.activeJobs, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Hồ sơ ứng tuyển', value: stats.totalApplications, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Lượt xem tin', value: stats.totalViews, icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Tỉ lệ chuyển đổi', value: stats.totalViews ? Math.round((stats.totalApplications / stats.totalViews) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  // Dummy Funnel Data
  const funnelData = [
    { name: 'Lượt xem', value: stats.totalViews || 1000 },
    { name: 'Click nộp CV', value: Math.round((stats.totalViews || 1000) * 0.4) },
    { name: 'Hoàn tất nộp CV', value: stats.totalApplications || 150 },
    { name: 'Phỏng vấn', value: Math.round((stats.totalApplications || 150) * 0.2) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tổng quan Tuyển dụng</h1>
          <p className="text-muted-foreground">Theo dõi hiệu suất đăng tin và phễu tuyển dụng của bạn.</p>
        </div>
        <Link 
          href="/employer/jobs/create" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Đăng tin mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-3xl group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h2 className="text-lg font-bold text-foreground">Biểu đồ Lượt xem & Ứng tuyển</h2>
                <p className="text-xs text-muted-foreground mt-1">So sánh số liệu giữa các tin tuyển dụng</p>
             </div>
          </div>
          <div className="h-[320px] w-full">
            <JobAnalyticsChart data={stats.chartData} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
               <Filter className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-foreground">Phễu Tuyển dụng</h2>
               <p className="text-xs text-muted-foreground">Chuyển đổi trung bình</p>
            </div>
          </div>
          
          <div className="space-y-6">
             {funnelData.map((item, index) => {
                const maxVal = funnelData[0].value;
                const percentage = maxVal ? Math.round((item.value / maxVal) * 100) : 0;
                
                return (
                   <div key={item.name} className="relative">
                      <div className="flex justify-between text-sm mb-2 font-medium">
                         <span className="text-foreground">{item.name}</span>
                         <span className="text-primary">{item.value}</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                         <div 
                            className={`h-full rounded-full ${index === 0 ? 'bg-emerald-400' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-primary' : 'bg-primary/80'}`}
                            style={{ width: `${percentage}%` }}
                         />
                      </div>
                   </div>
                )
             })}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
             <div className="bg-amber-500/10 rounded-2xl p-4 text-amber-700 dark:text-amber-400">
                <p className="text-sm font-semibold mb-1">Mẹo tối ưu phễu</p>
                <p className="text-xs leading-relaxed opacity-90">Tỉ lệ từ "Lượt xem" sang "Click nộp CV" đang thấp. Hãy thử làm nổi bật mức lương và chế độ đãi ngộ ở đầu mô tả công việc!</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
