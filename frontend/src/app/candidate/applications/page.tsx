'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Building2, MapPin, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  applied: { label: 'Đã nộp', color: 'bg-blue-100 text-blue-800' },
  reviewing: { label: 'Đang xem xét', color: 'bg-amber-100 text-amber-800' },
  interview: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-800' },
  offered: { label: 'Đề nghị làm việc', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Từ chối', color: 'bg-rose-100 text-rose-800' },
};

export default function CandidateApplicationsPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchApplications = async () => {
      try {
        const res: any = await axiosInstance.get('/applications/my?limit=50');
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Lỗi khi tải lịch sử ứng tuyển:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Việc làm đã ứng tuyển</h1>
        <p className="text-slate-500 mt-1">Theo dõi trạng thái các hồ sơ bạn đã gửi đến nhà tuyển dụng.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa ứng tuyển công việc nào</h3>
            <p className="text-slate-500 mb-6">Hãy khám phá các cơ hội nghề nghiệp phù hợp với bạn.</p>
            <Link 
              href="/jobs" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors inline-block"
            >
              Tìm việc ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {app.job?.company?.logo ? (
                      <img src={app.job.company.logo} alt="logo" className="w-16 h-16 rounded-xl border border-slate-100 object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <Link href={`/jobs/${app.job?._id}`} className="text-lg font-bold text-slate-900 hover:text-emerald-600">
                        {app.job?.title || 'Công việc đã bị xóa'}
                      </Link>
                      <div className="text-slate-600 font-medium mb-2">{app.job?.company?.name}</div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {app.job?.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" /> {app.job?.salary?.min ? `$${app.job.salary.min} - $${app.job.salary.max}` : 'Thỏa thuận'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> Nộp ngày: {format(new Date(app.createdAt), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[app.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_MAP[app.status]?.label || app.status}
                    </span>
                    
                    {app.interviewDate && (
                      <div className="mt-3 text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 text-center">
                        Lịch phỏng vấn:<br />
                        {format(new Date(app.interviewDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
