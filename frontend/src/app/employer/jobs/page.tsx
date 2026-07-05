'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, PlusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function EmployerJobsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res: any = await axiosInstance.get(`/jobs?employer=${user._id}&status=all&limit=50`);
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
      await axiosInstance.delete(`/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id));
      alert('Đã xóa thành công!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Việc làm</h1>
          <p className="text-slate-500 mt-1">Danh sách tất cả tin tuyển dụng bạn đã đăng tải.</p>
        </div>
        <Link href="/employer/jobs/create">
          <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
            <PlusCircle className="w-4 h-4" />
            Đăng tin mới
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-slate-500 mb-6">Hãy bắt đầu tìm kiếm nhân tài bằng cách đăng tin đầu tiên của bạn.</p>
            <Link href="/employer/jobs/create">
              <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                Đăng tin ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
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
                  <tr key={job._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <Link href={`/jobs/${job._id}`} className="font-semibold text-slate-900 hover:text-emerald-600 block">
                        {job.title}
                      </Link>
                      <span className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.jobType}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.level}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                        }`}>
                        {job.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(job.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {job.deadline ? format(new Date(job.deadline), 'dd/MM/yyyy', { locale: vi }) : 'Không có'}
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-slate-700">
                      {job.views || 0}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/employer/jobs/${job._id}/applications`}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-purple-600" title="Xem hồ sơ ứng viên">
                          <Users className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/employer/jobs/${job._id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-rose-600"
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
