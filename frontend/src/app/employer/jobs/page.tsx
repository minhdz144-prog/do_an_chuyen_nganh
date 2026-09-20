'use client';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, PlusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatDeadline } from '@/lib/utils';

export default function EmployerJobsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await jobsApi.getJobs({ employer: user._id, status: 'all', limit: 50 } as any);
      setJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) return;
    try {
      await jobsApi.deleteJob(id);
      setJobs(jobs.filter(job => job._id !== id));
      toast.success('Đã xóa thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Việc làm</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Danh sách tất cả tin tuyển dụng bạn đã đăng tải.</p>
        </div>
        <Link href="/employer/jobs/create">
          <Button className="bg-primary hover:bg-primary gap-2">
            <PlusCircle className="w-4 h-4" />
            Đăng tin mới
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground dark:text-muted-foreground">Đang tải dữ liệu...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-6">Hãy bắt đầu tìm kiếm nhân tài bằng cách đăng tin đầu tiên của bạn.</p>
            <Link href="/employer/jobs/create">
              <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                Đăng tin ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-sm text-muted-foreground dark:text-muted-foreground">
                  <th className="p-4 font-medium">Vị trí tuyển dụng</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày đăng</th>
                  <th className="p-4 font-medium">Hết hạn</th>
                  <th className="p-4 font-medium text-center">Lượt xem</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b border-slate-50 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Link href={`/jobs/${job._id}`} className="font-semibold text-foreground hover:text-primary block">
                        {job.title}
                      </Link>
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.jobType}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.level}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                          ? 'bg-primary/20 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                        }`}>
                        {job.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {format(new Date(job.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {formatDeadline(job.deadline)}
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-foreground/80">
                      {job.views || 0}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-blue-600" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/employer/jobs/${job._id}/applications`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-purple-600" title="Xem hồ sơ ứng viên">
                          <Users className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/employer/jobs/${job._id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-primary" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground/80 dark:text-muted-foreground hover:text-rose-600"
                        title="Xóa"
                        onClick={() => handleDelete(job._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
