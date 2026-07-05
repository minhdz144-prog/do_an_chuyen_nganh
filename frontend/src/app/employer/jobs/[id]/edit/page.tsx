'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import JobForm from '@/components/employer/JobForm';

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unwrapping params for Next.js 15+

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res: any = await axiosInstance.get(`/jobs/${id}`);
        setInitialData(res.data.job);
      } catch (error: any) {
        setErrorMsg('Không thể tải thông tin tin tuyển dụng.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        location: data.location,
        salary: { min: data.salaryMin, max: data.salaryMax },
        jobType: data.jobType,
        level: data.level,
        deadline: data.deadline || undefined,
      };

      await axiosInstance.put(`/jobs/${id}`, payload);
      router.push('/employer/jobs');
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tin.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
        <Link href="/employer/jobs" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-slate-500 mt-1">Cập nhật thông tin chi tiết cho vị trí này.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          {errorMsg}
        </div>
      )}

      {initialData && (
        <JobForm mode="edit" initialData={initialData} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
