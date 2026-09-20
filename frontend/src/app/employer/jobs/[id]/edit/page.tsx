'use client';
import { toast } from 'sonner';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res: any = await axiosInstance.get(`/jobs/${id}`);
        setInitialData(res.data.job);
      } catch (error: any) {
        toast.error('Không thể tải thông tin tin tuyển dụng.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
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
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật tin.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground dark:text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl bg-card rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mb-8 border-b border-border pb-6 flex items-center gap-4">
        <Link href="/employer/jobs" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Cập nhật thông tin chi tiết cho vị trí này.</p>
        </div>
      </div>


      {initialData && (
        <JobForm mode="edit" initialData={initialData} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
