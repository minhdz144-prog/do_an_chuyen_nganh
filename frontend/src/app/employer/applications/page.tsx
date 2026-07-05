'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Phone, FileText, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

// ★ State machine: Mapping các trạng thái kế tiếp hợp lệ theo luồng nghiệp vụ
const VALID_TRANSITIONS: Record<string, string[]> = {
  applied: ['reviewing', 'rejected'],
  reviewing: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: [],
  rejected: [],
};

const STATUS_LABELS: Record<string, string> = {
  applied: 'Mới nộp',
  reviewing: 'Đang xem xét',
  interview: 'Phỏng vấn',
  offered: 'Trúng tuyển',
  rejected: 'Từ chối',
};

const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-700',
  reviewing: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-800',
  offered: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
};

export default function EmployerApplicationsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Lấy tất cả jobs của employer để biết danh sách jobId
      const jobRes: any = await axiosInstance.get(`/jobs?employer=${user!._id}&status=all&limit=100`);
      const employerJobs = jobRes.data.jobs || [];
      setJobs(employerJobs);

      // Fetch applications song song cho từng job
      const appPromises = employerJobs.map((job: any) =>
        axiosInstance.get(`/jobs/${job._id}/applications?limit=50`).then((r: any) =>
          (r.data.applications || []).map((app: any) => ({ ...app, job }))
        ).catch(() => [])
      );
      const results = await Promise.all(appPromises);
      const allApps = results.flat().sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setApplications(allApps);
    } catch (error) {
      console.error('Lỗi tải hồ sơ ứng viên:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      let interviewDate: string | undefined;
      if (newStatus === 'interview') {
        const dateStr = prompt('Nhập ngày phỏng vấn (YYYY-MM-DD HH:mm):', '');
        if (dateStr === null) return; // Người dùng bấm Cancel
        interviewDate = dateStr || undefined;
      }

      await axiosInstance.patch(`/applications/${appId}/status`, {
        status: newStatus,
        note: `Employer chuyển → ${STATUS_LABELS[newStatus]}`,
        interviewDate,
      });

      // Cập nhật state local, không cần refetch
      setApplications(prev =>
        prev.map(app => app._id === appId ? { ...app, status: newStatus, interviewDate } : app)
      );
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const filteredApps = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải hồ sơ ứng viên...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ ứng viên</h1>
        <p className="text-slate-500 mt-1">
          Quản lý tất cả {applications.length} hồ sơ ứng tuyển vào {jobs.length} tin tuyển dụng của bạn.
        </p>
      </div>

      {/* Tabs lọc theo trạng thái */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-100 p-1 h-auto">
          <TabsTrigger value="all" className="rounded-lg">Tất cả ({applications.length})</TabsTrigger>
          <TabsTrigger value="applied" className="rounded-lg">Mới ({applications.filter(a => a.status === 'applied').length})</TabsTrigger>
          <TabsTrigger value="reviewing" className="rounded-lg">Đang xem</TabsTrigger>
          <TabsTrigger value="interview" className="rounded-lg">Phỏng vấn</TabsTrigger>
          <TabsTrigger value="offered" className="rounded-lg">Trúng</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredApps.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">Không có hồ sơ nào trong mục này.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredApps.map((app) => (
                  <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Thông tin ứng viên */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{app.candidate?.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.candidate?.email}</span>
                              {app.candidate?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.candidate?.phone}</span>}
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[app.status]}`}>
                            {STATUS_LABELS[app.status]}
                          </span>
                        </div>

                        {/* Vị trí ứng tuyển */}
                        <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                          Ứng tuyển: <Link href={`/jobs/${app.job._id}`} className="font-semibold text-slate-900 hover:text-emerald-600">{app.job.title}</Link>
                          <span className="text-slate-400 ml-2">• {format(new Date(app.createdAt), 'dd/MM/yyyy')}</span>
                        </div>

                        {/* Thông tin profile ứng viên */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-white border border-slate-100 rounded-xl p-3">
                            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Kinh nghiệm</div>
                            <div className="font-medium text-slate-900">{app.candidate?.candidateProfile?.yearsOfExperience || 0} năm</div>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-xl p-3 col-span-2">
                            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Kỹ năng</div>
                            <div className="font-medium text-slate-900 truncate text-xs">
                              {app.candidate?.candidateProfile?.skills?.join(', ') || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>

                        {app.coverLetter && (
                          <div className="text-sm bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1.5">Cover Letter</p>
                            <p className="text-slate-700 line-clamp-3">{app.coverLetter}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-3 min-w-[180px] lg:border-l lg:border-slate-100 lg:pl-6">
                        {/* ★ State machine UI: chỉ hiển thị trạng thái hợp lệ kế tiếp */}
                        {VALID_TRANSITIONS[app.status]?.length > 0 ? (
                          <div className="space-y-2 w-full">
                            <p className="text-xs text-slate-400 font-semibold uppercase">Chuyển trạng thái</p>
                            <Select onValueChange={(val: any) => handleStatusChange(app._id, val)}>
                              <SelectTrigger className="w-full bg-white text-sm">
                                <SelectValue placeholder="Chọn hành động..." />
                              </SelectTrigger>
                              <SelectContent>
                                {VALID_TRANSITIONS[app.status].map(nextStatus => (
                                  <SelectItem key={nextStatus} value={nextStatus}>
                                    → {STATUS_LABELS[nextStatus]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Trạng thái cuối</p>
                        )}

                        {app.interviewDate && (
                          <div className="text-xs text-purple-600 bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-center">
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            {format(new Date(app.interviewDate), 'dd/MM/yyyy HH:mm')}
                          </div>
                        )}

                        {app.candidate?.candidateProfile?.resumeUrl && (
                          <a
                            href={app.candidate.candidateProfile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Xem CV
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
