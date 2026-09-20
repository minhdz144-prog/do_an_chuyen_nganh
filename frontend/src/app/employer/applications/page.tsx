'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { jobsApi } from '@/lib/api/jobs';
import { applicationsApi } from '@/lib/api/applications';
import { Application } from '@/types/application';
import { Job } from '@/types/job';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Building2, Mail, Phone, FileText, Calendar, ExternalLink, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import EmployerKanbanBoard from '@/components/employer/EmployerKanbanBoard';
import AIAssessmentDialog from '@/components/employer/AIAssessmentDialog';

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
  applied: 'bg-slate-100 text-foreground/80',
  reviewing: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-800',
  offered: 'bg-primary/20 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
};

export default function EmployerApplicationsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Record<string, boolean>>({});
  
  const [isAssessing, setIsAssessing] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [assessingCandidateName, setAssessingCandidateName] = useState('');

  const handleAssessCandidate = async (app: any) => {
    try {
      setIsAssessing(app._id);
      const res: any = await axiosInstance.post('/ai/assess-candidate', {
        candidateSkills: app.candidate?.candidateProfile?.skills || [],
        candidateExperience: app.candidate?.candidateProfile?.yearsOfExperience || 0,
        jobRequiredSkills: app.job?.requiredSkills || [],
        jobTitle: app.job?.title || ''
      });
      if (res.success) {
        setAssessmentData(res.data.assessment);
        setAssessingCandidateName(app.candidate?.name || 'Ứng viên');
        setIsAssessmentDialogOpen(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đánh giá ứng viên lúc này.');
    } finally {
      setIsAssessing(null);
    }
  };

  const toggleCoverLetter = (appId: string) => {
    setExpandedCoverLetters(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Lấy tất cả jobs của employer để biết danh sách jobId
      const jobRes = await jobsApi.getJobs({ employer: user!._id, status: 'all', limit: 100 } as any);
      const employerJobs = jobRes.data.jobs || [];
      setJobs(employerJobs);

      // Fetch applications song song cho từng job
      const appPromises = employerJobs.map((job: Job) =>
        applicationsApi.getJobApplications(job._id, { limit: 50 }).then((r) =>
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
        const dateStr = prompt('Nhập ngày phỏng vấn (YYYY-MM-DD HH:mm):', format(new Date(), 'yyyy-MM-dd 09:00'));
        if (!dateStr) return; // Người dùng bấm Cancel
        
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 2024) {
          toast.error('Ngày giờ không hợp lệ! Vui lòng nhập đúng định dạng YYYY-MM-DD HH:mm và đảm bảo năm chính xác.');
          return;
        }
        interviewDate = dateStr;
      }

      await applicationsApi.updateApplicationStatus(appId, {
        status: newStatus,
        note: `Employer chuyển → ${STATUS_LABELS[newStatus]}`,
        interviewDate,
      });

      // Cập nhật state local, không cần refetch
      setApplications(prev =>
        prev.map(app => app._id === appId ? { ...app, status: newStatus as any, interviewDate } : app)
      );
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const filteredApps = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);

  if (loading) return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hồ sơ ứng viên</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">
            Quản lý tất cả {applications.length} hồ sơ ứng tuyển vào {jobs.length} tin tuyển dụng của bạn.
          </p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('list')}
            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`}
          >
            <List className="w-4 h-4 mr-1.5" /> Danh sách
          </Button>
          <Button 
            variant={viewMode === 'board' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('board')}
            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'board' ? 'shadow-sm' : ''}`}
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" /> Bảng Kanban
          </Button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <EmployerKanbanBoard 
          applications={applications} 
          onStatusChange={handleStatusChange} 
          statusLabels={STATUS_LABELS}
          statusColors={STATUS_COLORS}
          validTransitions={VALID_TRANSITIONS}
        />
      ) : (
        <>
          {/* Tabs lọc theo trạng thái */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border p-1 h-auto">
          <TabsTrigger value="all" className="rounded-lg">Tất cả ({applications.length})</TabsTrigger>
          <TabsTrigger value="applied" className="rounded-lg">Mới ({applications.filter(a => a.status === 'applied').length})</TabsTrigger>
          <TabsTrigger value="reviewing" className="rounded-lg">Đang xem</TabsTrigger>
          <TabsTrigger value="interview" className="rounded-lg">Phỏng vấn</TabsTrigger>
          <TabsTrigger value="offered" className="rounded-lg">Trúng</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {filteredApps.length === 0 ? (
              <EmptyState 
                title="Không có hồ sơ nào"
                description="Chưa có ứng viên nào thuộc trạng thái này."
              />
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredApps.map((app) => (
                  <div key={app._id} className="p-6 hover:bg-muted/50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Thông tin ứng viên */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground font-display">{app.candidate?.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.candidate?.email}</span>
                              {app.candidate?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.candidate?.phone}</span>}
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[app.status]}`}>
                            {STATUS_LABELS[app.status]}
                          </span>
                        </div>

                        {/* Vị trí ứng tuyển */}
                        <div className="text-sm text-muted-foreground dark:text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                          Ứng tuyển: <Link href={`/jobs/${app.job._id}`} className="font-semibold text-foreground hover:text-primary">{app.job.title}</Link>
                          <span className="text-muted-foreground/80 dark:text-muted-foreground ml-2 font-mono text-xs">• {format(new Date(app.createdAt), 'dd/MM/yyyy')}</span>
                        </div>

                        {/* Thông tin profile ứng viên */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-card border border-border rounded-xl p-3">
                            <div className="text-xs text-muted-foreground/80 dark:text-muted-foreground uppercase font-semibold mb-1">Kinh nghiệm</div>
                            <div className="font-medium text-foreground font-mono">{app.candidate?.candidateProfile?.yearsOfExperience || 0} <span className="font-sans text-xs">năm</span></div>
                          </div>
                          <div className="bg-card border border-border rounded-xl p-3 col-span-2">
                            <div className="text-xs text-muted-foreground/80 dark:text-muted-foreground uppercase font-semibold mb-1">Kỹ năng</div>
                            <div className="font-medium text-foreground truncate text-xs">
                              {app.candidate?.candidateProfile?.skills?.join(', ') || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>

                        {app.coverLetter && (
                          <div className="text-sm bg-muted/50 rounded-xl p-4 border border-border mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground uppercase font-semibold">Cover Letter</p>
                              {app.coverLetter.length > 150 && (
                                <button 
                                  onClick={() => toggleCoverLetter(app._id)}
                                  className="text-[11px] text-primary font-medium hover:underline focus:outline-none"
                                >
                                  {expandedCoverLetters[app._id] ? 'Thu gọn' : 'Xem thêm'}
                                </button>
                              )}
                            </div>
                            <p className={`text-foreground/80 whitespace-pre-wrap ${expandedCoverLetters[app._id] ? '' : 'line-clamp-3'}`}>
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-border flex justify-start">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAssessCandidate(app)}
                            disabled={isAssessing === app._id}
                            className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 h-8 text-xs px-3"
                          >
                            {isAssessing === app._id ? 'Đang phân tích...' : '✨ AI Nhận Xét Ứng Viên'}
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-3 min-w-[180px] lg:border-l lg:border-border lg:pl-6">
                        {/* ★ State machine UI: chỉ hiển thị trạng thái hợp lệ kế tiếp */}
                        {VALID_TRANSITIONS[app.status]?.length > 0 ? (
                          <div className="space-y-2 w-full">
                            <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground font-semibold uppercase">Chuyển trạng thái</p>
                            <Select onValueChange={(val: any) => handleStatusChange(app._id, val)}>
                              <SelectTrigger className="w-full bg-card text-sm">
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
                          <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground italic">Trạng thái cuối</p>
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
                            className="flex items-center justify-center gap-2 text-xs font-medium text-foreground/80 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
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
      </>
      )}

      <AIAssessmentDialog
        isOpen={isAssessmentDialogOpen}
        onClose={() => setIsAssessmentDialogOpen(false)}
        assessment={assessmentData}
        candidateName={assessingCandidateName}
      />
    </div>
  );
}
