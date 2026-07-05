'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Button, buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Mới nộp' },
  { value: 'reviewing', label: 'Đang xem xét' },
  { value: 'interview', label: 'Phỏng vấn' },
  { value: 'offered', label: 'Trúng tuyển' },
  { value: 'rejected', label: 'Từ chối' },
];

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(resolved => setJobId(resolved.id));
  }, [params]);

  useEffect(() => {
    if (!jobId) return;
    
    const fetchApplications = async () => {
      try {
        const res: any = await axiosInstance.get(`/jobs/${jobId}/applications?limit=50`);
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Lỗi tải danh sách hồ sơ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      let interviewDate = undefined;
      
      if (newStatus === 'interview') {
        const dateStr = prompt('Vui lòng nhập ngày giờ phỏng vấn (YYYY-MM-DD HH:mm):', format(new Date(), 'yyyy-MM-dd 09:00'));
        if (!dateStr) return; // Cancelled
        interviewDate = dateStr;
      }

      await axiosInstance.patch(`/applications/${appId}/status`, {
        status: newStatus,
        interviewDate,
        note: `Đã chuyển sang trạng thái: ${newStatus}`,
      });
      
      // Cập nhật state local
      setApplications(apps => 
        apps.map(app => 
          app._id === appId 
            ? { ...app, status: newStatus, interviewDate: interviewDate || app.interviewDate } 
            : app
        )
      );
      
      alert('Đã cập nhật trạng thái hồ sơ');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải danh sách hồ sơ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <Link href="/employer/jobs" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ ứng tuyển</h1>
          <p className="text-slate-500 mt-1">Quản lý ứng viên nộp đơn cho vị trí này.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có hồ sơ nào</h3>
            <p className="text-slate-500">Tin tuyển dụng này hiện chưa có ứng viên nào nộp đơn.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app._id} className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{app.candidate?.name}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.candidate?.email}</span>
                          {app.candidate?.phone && (
                            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {app.candidate?.phone}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(app.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-semibold">Kinh nghiệm</div>
                        <div className="font-medium text-slate-900">{app.candidate?.candidateProfile?.yearsOfExperience || 0} năm</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-semibold">Bằng cấp</div>
                        <div className="font-medium text-slate-900">{app.candidate?.candidateProfile?.educationLevel || 'Không rõ'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-slate-400 uppercase font-semibold">Kỹ năng</div>
                        <div className="font-medium text-slate-900 truncate" title={app.candidate?.candidateProfile?.skills?.join(', ')}>
                          {app.candidate?.candidateProfile?.skills?.join(', ') || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div className="bg-white p-4 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-2">Thư giới thiệu (Cover Letter)</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                    <div className="text-sm font-semibold text-slate-700 mb-1">Trạng thái hồ sơ</div>
                    <Select 
                      value={app.status} 
                      onValueChange={(val: any) => handleStatusChange(app._id, val)}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {app.interviewDate && (
                      <div className="text-xs text-purple-600 font-medium bg-purple-50 p-2 rounded-lg text-center mt-2">
                        Lịch hẹn: {format(new Date(app.interviewDate), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}

                    <div className="flex-1"></div>

                    {app.resumeUrl ? (
                      <a 
                        href={app.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={cn(buttonVariants({ variant: 'default' }), "w-full bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2")}
                      >
                        <Download className="w-4 h-4" /> Xem CV Đính kèm
                      </a>
                    ) : (
                      <Button disabled className="w-full bg-slate-100 text-slate-400" variant="outline">
                        Không có CV
                      </Button>
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
