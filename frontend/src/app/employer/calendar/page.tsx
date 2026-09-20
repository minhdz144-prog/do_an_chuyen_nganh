'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Calendar, Clock, MapPin, User, Briefcase, Mail, Phone, Video } from 'lucide-react';
import { format, isAfter, isToday, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function EmployerCalendarPage() {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const jobRes: any = await axiosInstance.get(`/jobs?employer=${user._id}&status=all&limit=100`);
        const employerJobs = jobRes.data.jobs || [];

        const appPromises = employerJobs.map((job: any) =>
          axiosInstance.get(`/jobs/${job._id}/applications`)
        );
        const appResponses: any = await Promise.allSettled(appPromises);
        
        let allApps: any[] = [];
        appResponses.forEach((res: any, index: number) => {
          if (res.status === 'fulfilled' && res.value.data.applications) {
            const apps = res.value.data.applications.map((app: any) => ({
              ...app,
              jobDetails: employerJobs[index]
            }));
            allApps = [...allApps, ...apps];
          }
        });

        // Chỉ lấy những ứng viên đang ở trạng thái phỏng vấn hoặc có interviewDate
        const interviewApps = allApps.filter(app => app.status === 'interview' && app.interviewDate);
        
        // Sắp xếp theo thời gian tăng dần
        interviewApps.sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());
        
        setInterviews(interviewApps);
      } catch (error) {
        console.error('Lỗi khi tải lịch phỏng vấn', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const upcomingInterviews = interviews.filter(i => isAfter(new Date(i.interviewDate), new Date()) || isToday(new Date(i.interviewDate)));
  const pastInterviews = interviews.filter(i => isBefore(new Date(i.interviewDate), new Date()) && !isToday(new Date(i.interviewDate)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Lịch phỏng vấn</h1>
        <p className="text-muted-foreground">
          Quản lý các lịch hẹn phỏng vấn với ứng viên. Bạn có {upcomingInterviews.length} lịch sắp tới.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary/90" /> Sắp diễn ra
        </h2>
        {upcomingInterviews.length === 0 ? (
          <EmptyState 
            title="Không có lịch hẹn"
            description="Chưa có lịch phỏng vấn nào sắp diễn ra."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingInterviews.map(app => (
              <InterviewCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>

      {pastInterviews.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground/80" /> Đã qua
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastInterviews.map(app => (
              <InterviewCard key={app._id} app={app} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewCard({ app, isPast = false }: { app: any, isPast?: boolean }) {
  const date = new Date(app.interviewDate);
  const isOnline = app.statusHistory?.[app.statusHistory.length - 1]?.note?.toLowerCase().includes('online');

  return (
    <div className={`p-6 rounded-2xl border ${isPast ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/50 opacity-75' : 'bg-white border-primary/20 shadow-sm dark:bg-slate-900 dark:border-emerald-900/30'} flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md`}>
      {/* Date badge */}
      <div className={`absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 rounded-full opacity-10 ${isPast ? 'bg-slate-400' : 'bg-primary'}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
          </h3>
          <p className="text-primary dark:text-primary font-medium text-lg flex items-center gap-2 mt-1">
            <Clock className="w-5 h-5" /> {format(date, 'HH:mm')}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
            {isOnline ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            {isOnline ? 'Online' : 'Trực tiếp'}
          </span>
        </div>
      </div>

      <div className="h-px bg-muted w-full" />

      <div className="space-y-3 relative z-10">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-muted-foreground/80 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-200">{app.candidate?.name || 'Ứng viên ẩn danh'}</p>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
              {app.candidate?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {app.candidate.email}</span>}
              {app.candidate?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {app.candidate.phone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Briefcase className="w-5 h-5 text-muted-foreground/80 mt-0.5" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ứng tuyển vị trí <span className="font-medium text-slate-900 dark:text-slate-200">{app.jobDetails?.title}</span>
            </p>
          </div>
        </div>
      </div>
      
      {app.statusHistory?.[app.statusHistory.length - 1]?.note && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 relative z-10 italic">
          "{app.statusHistory[app.statusHistory.length - 1].note}"
        </div>
      )}
    </div>
  );
}
